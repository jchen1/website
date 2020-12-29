---
layout: post
title: Why Clojure?
date: "2020-10-29"
author: Jeff Chen
tags: code,clojure
---

One piece of unattributed wisdom that's stuck with me is "don't take more than one technology bet". At [Ladder](https://www.ladderlife.com), our big bet is using [Clojure](https://clojure.org/) for fullstack app development. Ladder's used Clojure since day 1 in 2015, and we wouldn't want it any different! In particular, Clojure's Lisp heritage, focus on pure functions and immutable data structures, unified client-server support, and superior developer experience have helped us write higher quality code faster.

**Ladder is hiring! If you're interested, please check out our job description [here](https://grnh.se/5cebfb331us)!**

<!-- excerpt -->

## Pure functions and immutability

One of the challenges with ordinary, imperative programming languages like Javascript or Python is the increasing complexity of state management. As your application grows, it becomes harder and harder to isolate where in the codebase specific changes to your application state occur. This is because with typical application architectures in those languages, any function can perform [side effects](https://en.wikipedia.org/wiki/Side_effect_%28computer_science%29) or modify incoming or global state. On the other hand, Clojure strongly emphasizes working with [pure functions](https://en.wikipedia.org/wiki/Pure_function) (well, if you discount I/O...) and [immutable data structures](https://clojure.org/about/state). A Clojure programmer must be explicit when defining and modifying mutable state - this helps minimize its usage and makes it easier to reason about.

Immutable data structures and pure functions also lend themselves well to concurrent programming. We rarely find ourselves worrying about locks and shared data in a multi-threaded environment, because our functions are rarely modifying shared state. And when we do, Clojure provides `atom`, a thread-safe wrapper around ordinary data structures. Behind the scenes, setting an `atom`'s value calls `compare-and-set!`. That means no fussing around with locks or mutexes and no worrying about your data changing before you modify it. With this one simple construct, Clojure removes 99% of our concurrency headaches.

## Clojure is a Lisp

There are probably enough Lisp arguments on the Internet already - I'll defer to [Rich Hickey](https://clojure.org/about/rationale#_lisp_is_a_good_thing) (Clojure's creator) and [Paul Graham](http://www.paulgraham.com/avg.html) instead of adding another rehash. That said, Clojure provides some advantages over other Lisps like Common Lisp and Scheme:

- CL only includes lists in its core language spec. Clojure introduces vectors, sets, and maps which makes reading and writing code so much less tedious. Of course Scheme has all of these except sets.
- Clojure's core data structures are immutable which, as discussed above, makes reasoning about code, especially concurrent code, much easier.

## Clojure runs everywhere

Clojure provides first class support for sharing code between platforms with [reader conditionals](https://clojure.org/guides/reader_conditionals). Most of our namespaces at Ladder take advantage of this and are shared across our client (Clojurescript) and server (Clojure). In fact, all of our client React code (aside from browser-specific API calls like clipboard, input handlers, etc) supports being run on the JVM. This lets us run what we call "full-stack tests" entirely within a Java process. For example, we can run full user flows like "user can accept a life insurance policy" and assert against both client and server state **in the same test**. The closest analogue without this superpower would be running a Selenium test against a running webserver, which introduces all sorts of potential flakiness. For more on full-stack tests, check out [this talk](https://www.youtube.com/watch?v=qijWBPYkRAQ&t=346s) two of our engineers gave at Clojure West in 2017.

Clojure also provides easy [host interop](https://clojure.org/guides/reader_conditionals#_host_interop) for each supported platform. This lets us leverage the full JVM (and Javascript) ecosystem. For example, we use popular Java libraries like [Jetty](https://www.eclipse.org/jetty/), [kafka-clients](https://mvnrepository.com/artifact/org.apache.kafka/kafka-clients), [Tink](https://github.com/google/tink), and more. On the frontend, we use React, and can easily include other Javascript libraries for analytics, error handling, and session replays.

## Developer experience

When I’ve worked with Typescript and Python in the past, I was constantly waiting for my development server to reload. Clojure makes updating code on your local server as simple as reloading the updated namespace in your REPL. If you want, you can even [update remote, (hopefully) non-production webservers](https://github.com/nrepl/nrepl)! Being able to evaluate code in a REPL and have your running web server update in less than a second makes exploration and iteration on your actual backend so much faster. Instant feedback makes developers more playful and experimental. Ultimately, it helps them write better code faster.

It’s also super easy to run small chunks of code in the REPL. Ladder, like other Clojure shops, has a convention of documenting namespace usage with a `comment` block at the bottom. Developers can use the code within to learn the namespace’s API, run commonly used procedures, or test changes to the rest of the namespace - all without leaving their editor!

## Why not Clojure?

While we're extremely satisfied with our choice of Clojure, we've had our fair share of headaches. First, Clojure processes take a long time to start up - especially as the size of the application grows. Our webserver at Ladder takes a full minute before it can accept web requests. This makes autoscaling in response to load more challenging - some of our load can spike in well under a minute, so we have to be consistently overprovisioned to handle it. Second, Clojure produces pretty big artifacts. This matters less on the backend, where our webserver JAR is over 1.5GB, but hurts us on the frontend. We still have work to do here, but our initial bundle is 7.2MB uncompressed (1.0MB gzipped)! If raw performance or bundle size is your primary concern, you might be better off choosing another language.

## Conclusion

As a small company, we have more ideas to try than we have bandwidth to implement. Using Clojure has helped our team be more iterative and more productive, so we can ship more experiments and projects than we would otherwise be able to. I feel super lucky that Ladder introduced me to Clojure - and I'm excited to see how Clojure and our use of it continues to evolve!
