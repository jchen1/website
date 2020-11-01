---
layout: post
title: Recovering Lost Roam Notes
date: "2020-10-30"
author: Jeff Chen
tags: 2020,clojure,code,october,roam,readwise
---

This post dives deep into a scary data loss scenario - we'll cover identifying the data loss, investigating the root cause, and finally recovering the data.

**This bug affected Readwise users who exported their highlights (both manually & automatically) to Roam on 10/27. If you are one of those users, you should contact Roam support & use [my recovery code](https://github.com/jchen1/roam-restore) ASAP!**

<!-- excerpt -->

## Background

[Roam](https://roamresearch.com) is a "note-taking tool for networked thought". It supports all sorts of cool things - what's relevant here is that it automatically creates a new page for every day, your Daily Notes. Recently, I started using [Readwise](https://readwise.io), which ingests Kindle highlights and uses [spaced repetition](https://en.wikipedia.org/wiki/Spaced_repetition) to help you remember what you read. Readwise has a Roam integration, which automatically adds Kindle highlights to Roam. Unfortunately, since Roam doesn't have a public API yet, Readwise's integration seems to be effectively using Selenium - clicking on elements and pasting highlights which is inherently flaky.

Yesterday, I woke up without my Daily Notes from the day before. Disaster! Fortunately, with the help of the Roam Slack group and Tristan from Readwise, I was able to isolate the cause of note deletion and even restore my lost data. Here's what happened:

## Roam architecture

Roam uses [Datascript](https://github.com/tonsky/datascript) for its client-side database. Like Datomic, Datascript stores data as a `datom`, defined as `[e a v tx]`, or `entity`, `attribute`, `value`, and `transaction-id` (incrementing integer). If you're interested in learning more, [Datascript's author has an excellent overview](https://tonsky.me/blog/datascript-internals/).

Importantly for us, Roam differs from other webapps in that it doesn't store all state and history in its backend. Instead, Roam's backend just stores a snapshotted Datascript database (updated ~daily as far as I can tell) and the list of transactions since that last snapshot. If we can download those two things before Roam's next snapshot, we have two breadcrumbs towards recovery: 1. We can find the transaction that deleted my Daily Notes page 2. We can also reconstruct our Datascript database, replaying transactions up until the point of deletion, and recover our Daily Notes from that!

## Capturing state

Our first step is to store Roam's database snapshot and transaction list. Instead of REST API calls, Roam uses a Websocket connection to send these to its web client. This complicates things for us: instead of just saving API responses with `curl`, we need to download a [HAR file](https://en.wikipedia.org/wiki/HAR_%28file_format%29), which, fortunately for us, includes Websocket traffic with more recent Chrome versions. HAR files are just JSON archives stored in chronological order - it's easy to select just the Websocket traffic:

```clojure
(defn parse-har
  [harfile]
  (let [json (json/parse-string (slurp harfile) true)
        ws-messages (->> json :log :entries (filter #(some? (:_webSocketMessages %))) second :_webSocketMessages)
        ws-data (map :data ws-messages)]
    ws-data))
```

Inspecting this data more closely, it appears that Roam's websocket messages are generally JSON strings (and occasionally numbers). When a message is more than 16KB, it's split into multiple messages without wrapping - so we'll need to stitch these bigger messages together. One way to detect a non-split-message is to just try and parse it as JSON - if it's valid, we can say it's non-split. (There's an edge case we're unlikely to hit here: if the 16KB chunk just so happens to be valid JSON as well we'll be out of luck. Lucky for us, I didn't run into this!) Now, we can extend `parse-har` as follows:

```clojure
(defn parse-har
  [harfile]
  (let [json (json/parse-string (slurp harfile) true)
        ws-messages (->> json :log :entries (filter #(some? (:_webSocketMessages %))) second :_webSocketMessages)
        ws-data (map :data ws-messages)
        try-parse #(try (json/parse-string % true)
                        (catch Throwable _ nil))
        ;; Roam sends a series of JSON objects over WS messages.
        ;; If an object is bigger than 16kb it's split across
        ;; multiple messages - so we need to stitch them together.
        ws-json (reduce (fn [{:keys [done partial]} next]
                          (let [potential-json-str (str partial next)]
                            (if-let [json (try-parse potential-json-str)]
                              {:done (conj done json)
                               :partial ""}
                              {:done done
                               :partial potential-json-str})))
                        {:done [] :partial ""}
                        ws-data)]
    (assert (= (:partial ws-json) ""))
    (:done ws-json)))
```

## Finding the culprit

Armed with our parsed websocket messages, we can see that many of them look like transactions. One that looks particularly suspicious has a nested field named `tx-meta` with the value `delete-page`! The transaction looks something like this:

```clojure
{:app-version "0.7.4",
 :email "hello@jeff.yt",
 :session-id "uuid95d98efd-c8fa-4412-87a4-e7b7201bee24",
 :t 1603947791561,
 :time 1603947791542,
 :tx "[[\"^ \",\"~:block/uid\",\"ogCRjInhE\",\"~:block/string\",\"some-text-here\",\"~:edit/time\",1603947791363,\"~:edit/email\",\"hello@jeff.yt\"],[\"^ \",\"^0\",\"4CpSytRnt\",\"^1\",\"Highlights first synced by #Readwise October 28th, 2020\",\"^2\",1603947791364,\"^3\",\"hello@jeff.yt\"],[\"^ \",\"^0\",\"C-IOsE50G\",\"^1\",\"New highlights added October 28th, 2020 at 11:03 PM\",\"^2\",1603947791364,\"^3\",\"hello@jeff.yt\"],[\"~:db.fn/retractEntity\",[\"^0\",\"hLBqaz4gS\"]],[\"^4\",[\"^0\",\"vwD08rqdT\"]],[\"^4\",[\"^0\",\"6VWOGgeAd\"]],[\"^4\",[\"^0\",\"P56-fWN2O\"]],[\"^4\",[\"^0\",\"SffV3NfN2\"]],[\"^4\",[\"^0\",\"qnZBZCGCv\"]],[\"^4\",[\"^0\",\"10-28-2020\"]]]",
 :tx-meta {:event-id "uuid719b009f-b969-47b6-b2db-41542d10b328",
           :event-name "delete-page",
           :tx-id "uuid289e80fc-4c27-4d54-9df4-d83ac0ceeaed",
           :tx-name "delete-page"}}
```

I omitted ~90% of the transaction to save space - but it's more of the same. This definitely looks like the transaction that deleted my Daily Notes page: I see `db.fn/retractEntity` as well as `10-28-2020` in the transaction. Interestingly, this transaction captures two Readwise interactions as well. It's not a smoking gun, but it's definitely suspicious that Readwise was operating on my database at the **exact same time** that my page was mysteriously deleted!

Let's pause here, and check in with the Roam Slack group. Someone else has already started a thread about data loss! They and others quickly confirm that they also all have Readwise's auto-export enabled. Again, it's not confirmation that Readwise is to blame, but it's enough for me to stop what I'm doing and disable my Readwise integration! We'll also share our knowledge in the Slack thread and ask affected users to save their Roam HAR file like we did.

Later, [Tristan, founder of Readwise](https://twitter.com/homsiT), pops into Slack and quickly confirms that [a recent Roam behavior change combined with the Readwise integration can cause deleted pages](https://twitter.com/homsiT/status/1321856588022513665). Huge props to Tristan who responds perfectly: he triages the issue, disables the feature to prevent any more users from hitting it, and fixes & re-enables auto-export all within a couple hours! Tristan also remains communicative and takes full responsibility, even offering refunds, though I'd argue that these hiccups are bound to happen when Roam still hasn't opened up their public API.

## Deserializing the database

Peeking again at our parsed HAR file, we see what appears to be our serialized database - it's stored like this:

```clojure
{:split-db {0 "transit-encoded-str-0"
            1 "transit-encoded-str-1"
            ...}}
```

Each string looks something like this:

```
[\\\"^P\\\",[1641,\\\"^H\\\",\\\"zeciaTJfg\\\",536877373]],[\\\"^P\\\",[1641,\\\"^17\\\",\\\"hello@jeff.yt\\\",536877373]],[\\\"^P\\\",[1641,\\\"^18\\\",1583270770601,536877373]],[\\\"^P\\\",[1641,\\\"^R\\\",\\\"hello@jeff.yt\\\",536877373]],[\\\"^P\\\",[1641,\\\"^S\\\",1583270784121,536877377]],[\\\"^P\\\",[1642,\\\"^E\\\",1643,536877384]]
```

This looks like Transit! [Transit](https://github.com/cognitect/transit-format) is a JSON-like format for sending data between applications ([this post](https://blog.klipse.tech/clojure/2016/09/22/transit-clojure.html) is a good introduction). Datascript has its own [set of Transit handlers](https://github.com/tonsky/datascript-transit/) - let's import that and see if we get a working database! Of course, we'll also need to combine `split-db` by smashing the Transit-encoded strings together.

```clojure
(require '[datascript.transit :as dt])

(defn parse-db
  [parsed-har]
  (let [db-str (->> parsed-har
                    ;; the database is deeply nested!
                    (filter #(some-> % :d :b :d :split-db))
                    first :d :b :d :split-db
                    vals
                    (string/join ""))]
    (dt/read-transit-str db-str)))
```

Voila - a real Datascript database! We can confirm it's my Roam database by querying it:

```clojure
(require '[datascript.core :as d])
(let [db (-> harfile (parse-har) (parse-db))
      conn (d/conn-from-db db)]
  (d/q '[:find ?e :where [?e :node/title "Daily Template"]] @conn))

;; #{[1855]}
```

With a working Roam database, our next step is to apply all of the transactions we have up until the deletion event. Transactions are Transit-encoded, and we'll have to do quite a bit of data manipulation to get a list of them. Once we have that list, we can sort the transactions and apply them sequentially:

```clojure
(defn apply-transactions-until
  [db parsed-har until-time]
  (let [transactions-to-apply (->> parsed-har
                                   (map #(some-> % :d :b :d))
                                   (filter seqable?)
                                   (apply concat)
                                   (filter #(string/starts-with? (-> % first name) "-MK"))
                                   (map second)
                                   (filter #(< (:time %) until-time))
                                   (sort-by :time)
                                   (map :tx)
                                   (map dt/read-transit-str))
        conn (d/conn-from-db db)]
    (doseq [tx transactions-to-apply]
      (d/transact! conn tx))
    (d/db conn)))
```

Here, `until-time` is the time of the deletion transaction. We're so close now! We've managed to materialize my Roam database from **right before my notes were deleted**! All we need to do now is pull that deleted page, and we'll be done!

## Recovering data

Recovering my deleted page shouldn't be too hard: we can use Datascript's `pull` to recursively grab the entire page's contents!

```clojure
(defn recover
  [db]
  (let [conn (d/conn-from-db db)
        note-eid (ffirst (d/q `[:find ?e :where [?e :block/uid ~missing-date]] @conn))
        page (d/pull db '[:block/string {:block/children [:block/order :block/string {:block/children ...}]}] note-eid)]
    page))

(recover db)

; #:block{:children [#:block{:order 0,
;                           :string "[[Gym 💪🏽]]",
;                           :children [#:block{:order 0,
;                                              :string "#[[weight room]]",
;                                              :children [#:block{:order 0, :string "bench 5x5x225"}
;                                                         #:block{:order 1, :string "seated rows 4x12x100"}]}]}
```

Next, let's turn this data structure into something we can paste back into Roam. We can materialize a string by recursively materializing a block's children, increasing the indentation as we recurse:

```clojure
(defn materialize
  [{:keys [block/string] :as page} level]
  (let [indent (* level 4)
        children (->> (:block/children page)
                      (sort-by :block/order)
                      (map #(materialize % (inc level)))
                      (map #(format "%s- %s" (apply str (repeat indent " ")) %))
                      (string/join "\n"))]
    (cond
      (and string (not-empty children)) (str string "\n" children)
      (not-empty children) children
      string string
      :else "")))

(defn recover
  [db]
  (let [conn (d/conn-from-db db)
        note-eid (ffirst (d/q `[:find ?e :where [?e :block/uid ~missing-date]] @conn))
        page (d/pull db '[:block/string {:block/children [:block/order :block/string {:block/children ...}]}] note-eid)]
    (materialize page 0)))

(recover db)

;- [[Gym 💪🏽]]
;    - #[[weight room]]
;        - bench 5x5x225
;        - seated rows 4x12x100
```

That's it! Now we can copy that string into Roam, and we've fully recovered our lost Roam page - structure and all! You can find the full code [here](https://github.com/jchen1/roam-restore).

## Final thoughts

What a way to spend a morning! I'm super thankful that I was able to recover my lost notes. I was lucky that Roam hadn't snapshotted my database post-deletion - that would have made this method impossible. I'm also grateful to Tristan from Readwise and everyone else who was in the Roam Slack for helping isolate and debug the problem. I hope that I was able to help at least a couple of them recover their data.
