---
layout: post
title: Infrastructure & Business Monitoring
date: "2021-03-20"
author: Jeff Chen
tags: engineering,code
---

At [Ladder](https://www.ladderlife.com), our approach to observability and monitoring has matured a lot over the three years I've been part of the team. One distinction that we've started to draw is the difference between **infrastructure** and **business** monitoring. To explore that distinction and how a company's monitoring systems might evolve over time, let's consider the hypothetical company Stairway, a hot new insurtech focusing on [longevity insurance](https://en.wikipedia.org/wiki/Longevity_insurance).

<!-- excerpt -->

Let's say Stairway just launched to the public, and its engineering team is taking their first steps towards monitoring and alerts. Stairway should probably take the low-hanging fruit first. This will probably look like using tools like [Site24x7](https://www.site24x7.com/) or [Pingdom](https://www.pingdom.com/) to make sure that they're alerted if their site goes down.

As they build alerts and monitoring around downtime, Stairway engineering will find that their outages go from "the whole site is down" to "some types of requests are erroring for some sets of users". They'll build more granular alerts, paging when the 5xx rate is too high, latency spikes, and more. Maybe as their application grows they'll start measuring things like their [application bundle size](https://jeffchen.dev/posts/Measuring-Bundle-Sizes-With-Next-js-And-Github-Actions/) that affect site load times. The common theme about Stairway's early monitors is that they directly measure **infrastructure**. They're meaningful to engineers and easy to set up, but they're only proximally related to the business. If the site goes down and there's nobody around to see it, does it make a sound?

After Stairway's invested in infrastructure-level monitoring, it'll find that its outages are increasingly business-related: logic errors or misconfigurations that prevent users from taking revenue-generating actions. Maybe a feature launches prematurely because of a misconfigured feature flag, or a blocking third-party API request starts to fail silently. These errors are particularly insidious because they're invisible to the infrastructure monitoring Stairway engineers spent so much time building. Often, the first indication that something is wrong will be a support agent surfacing a customer bug report. That erodes goodwill and trust towards the engineering team. Even though the types of outages are different from the early days of Stairway, they're equally damaging to the business.

Stairway doesn't care if the site is down or if requests are taking 10 seconds to complete: Stairway cares that they're spending marketing dollars on users who can't access the site and buy insurance policies. There's no difference to the bottom line between "the whole site is down" and "the user is blocked from entering their payment information".

At this point, Stairway should focus on developing **business monitoring**. These metrics can alert on questions like "how many users have signed up today?" and "where are users dropping off in our funnel?" This way, Stairway engineering will get alerted when business metrics change abnormally. They'll be able to respond more quickly to business-level outages, before too many users are affected and before losing out on too much revenue.

Business metrics, of course, have downsides compared to infrastructure metrics. The biggest downside is that business metrics aren't specific: when a business alert fires, it's not easily clear what actions an engineer should take to fix them. Often it's necessary to dive into logs or look at infrastructure-level metrics—business metrics should be set up **after** infrastructure metrics.

Our story has a happy ending—Stairway engineers set up business-level monitors and alerts, they were able to detect and respond to outages much faster. Eventually, Stairway became the next tech decacorn, and everybody lived happily after ever.

## Recap

- As a company matures, it may find that infrastructure-level monitors aren't alerting engineers about outages. This isn't because the monitors are bad, it's because the nature of the outages have changed.
- Companies should set up business-level monitoring around its revenue-generating and funnel events.
- Business and infrastructure monitors work together: neither is sufficient to protect companies from outages.
