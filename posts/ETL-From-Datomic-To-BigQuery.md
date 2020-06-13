---
layout: post
title: ETL from Datomic to BigQuery
date: "2019-08-05"
author: Jeff Chen
tags: datomic,bigquery,etl,streaming,clojure
---

This post is cross-posted from [Ladder's engineering blog](https://ladderlife.github.io/blog/2019/08/etl-datomic-bigquery/). Shout out Ladder for forcing me to write something!

At [Ladder](https://www.ladderlife.com), we use [Datomic](https://www.datomic.com/) as our primary data store and [Google BigQuery](https://cloud.google.com/bigquery/) as our data warehouse. We've iterated on how we send data from Datomic to BigQuery - starting from a nightly job dumping every entity and ending with a streaming solution with just seconds of latency. In this post, we'll walk through bucketing Datomic entities into BigQuery tables, transforming entities into rows, and using one of Datomic's superpowers to stream changed entities into BigQuery.

<!--more-->

In this post, we'll cover:

- [Classifying Datomic entities by attribute](#whats-the-schema)
- [Converting Datomic entities into BigQuery rows](#converting-entities-to-rows)
- [Streaming changed entities to BigQuery](#streaming-datomic-changes-to-bigquery)

## [What's the schema?](#whats-the-schema)

Let's get started with a simple Datomic schema. We have a couple entity types:

- A `user` has a `name`, an `email` and several `applications`.
- An `email` has an email address and a set of login tokens.
- Each (life insurance) `application` has a list of `answers`.

```clojure
(def datomic-schema
  [{:db/ident :user/id
    :db/valueType :db.type/uuid
    :db/cardinality :db.cardinality/one
    :db/unique :db.unique/identity}
   {:db/ident :user/name
    :db/valueType :db.type/string
    :db/cardinality :db.cardinality/one}
   {:db/ident :user/apps
    :db/valueType :db.type/ref
    :db/cardinality :db.cardinality/many
    :db/doc "Applications that belong to the user."}
   {:db/ident :user/email
    :db/valueType :db.type/ref
    :db/cardinality :db.cardinality/one
    :db/doc "User's current email address"}
   {:db/ident :email/address
    :db/valueType :db.type/string
    :db/cardinality :db.cardinality/one
    :db/unique :db.unique/identity
    :db/doc "Email address - can be owned by at most one user"}
   {:db/ident :email/tokens
    :db/valueType :db.type/string
    :db/cardinality :db.cardinality/many
    :db/doc "Login tokens sent to an email address"}
   {:db/ident :app/id
    :db/valueType :db.type/uuid
    :db/cardinality :db.cardinality/one
    :db/unique :db.unique/identity}
   {:db/ident :app/answers
    :db/valueType :db.type/ref
    :db/cardinality :db.cardinality/many}])
```

Unlike SQL (and BigQuery) rows, any Datomic entity can have any attribute in the schema. So, before we can upload anything, we need to categorize and transform our entities into something BigQuery can understand.

First, let's define a function to categorize an entity based on its attributes:

```clojure
(def attribute->entity-type
  {:user/id :user
   :app/id :application
   :email/address :email})

(defn classify-entity
  [entity]
  (let [all-attributes (set (q '[:find [?attr ...]
                                 :in $ ?e
                                 :where
                                 [?e ?attr-eid]
                                 [?attr-eid :db/ident ?attr]]
                               (entity-db ent) (:db/id ent)))]
    (->> attribute->entity-type
         (keep (fn [[attr _]] (contains? all-attributes attr)))
         (first)
         (second))))
```

## Converting entities to rows

Next, we need a way to transform a Datomic entity into a BigQuery row given its type:

```clojure
(defmulti entity->row* (fn [entity] (classify-entity entity)))

(defmethod entity->row* :email
  [{:email/keys [address tokens] :as entity}]
  {:email/address address
   ;; We only care about the token value, not their uses
   :email/tokens tokens})

(defmethod entity->row* :user
  [{:user/keys [id name apps email] :as entity}]
  {:user/id id
   :user/name name
   :user/apps (map :db/id apps)
   :user/email (:db/id email))})

(defmethod entity->row* :application
  [{:app/keys [id answers] :as entity}]
  {:app/id id
   :app/answers (map str answers)})

(defn entity->row
  [entity]
  (json/encode (merge {:db/id (:db/id entity)}
                      (entity->row* entity))))
```

That's it! To run a single ETL job, all that's left is to run `entity->row` against every entity in the database and upload the result to BigQuery:

```clojure
(defn db->rows
  [db]
  (->> (q '[:find (distinct ?e) . :where [?e]] db)
       (mapcat (comp entity->row (partial entity db)))))
```

## Streaming Datomic changes to BigQuery

Eventually, we'll outgrow a daily ETL job. With more data, the job will take many hours to complete (or fail!), leaving our data warehouse woefully out of date. Daily jobs also slow down feedback cycles when making changes. Fortunately, Datomic can help us out here!

Datomic [stores a log](https://docs.datomic.com/on-prem/log.html) of all transaction data in time order. This lets us efficiently ask the question "What changed betweeen `t1` and `t2`?" with [`tx-range`](https://docs.datomic.com/on-prem/clojure/index.html#datomic.api/tx-range). With this primitive, we can upload only those entities that have changed since the last time we ran our ETL job. In fact, we can go one step further: by running our upload function in a tight loop, we can achieve data latency of just a few seconds! Let's sketch it out:

```clojure
(defn upload-changed-entities-to-bigquery
  [db last-streamed-t]
  (let [last-t (db/next-t db)
        all-txes (->> (db/tx-range (db/log (:connection db)) last-streamed-t last-t)
                      (sort-by :t)
                      vec)
        entities-to-stream (->> all-txes
                                (mapcat :data)
                                (map first)                 ; get the entity id
                                (distinct)
                                (map #(db/entity db %))
                                (group-by classify-entity))]
    (run! (fn [[class entities]]
            (bq/stream! (bq/class->table class) (map entity->row entities)))
          entities-to-stream)))

(defn streaming-etl
  [db-conn]
  (while true
    (let [last-streamed-t (bq/last-streamed-t)
          latest-db (db/db db-conn)]
      (upload-changed-entities-to-bigquery latest-db last-streamed-t))))

```

With this last piece, we've built a system that:

- classifies entities into BigQuery tables based on their attributes
- converts entities into well-formed BigQuery rows
- uploads new and changed entities to BigQuery (almost) instantly

We've also expressed one of our core engineering values - to shorten feedback loops: engineers can see effects of their changes once their code is deployed rather than waiting for a nightly ETL job to run. More imporantly, our data science and product teams can analyze our data **as it's generated**!
