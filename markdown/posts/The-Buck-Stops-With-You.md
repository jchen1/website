---
layout: post
title: The Buck Stops With You
date: "2021-04-24"
author: Jeff Chen
tags: engineering
---

One important difference between junior and senior engineers is that senior engineers **take responsibility for the software the team ships**. They understand that they are the only line of defense between the company and catastrophic outages, a slow death through tech debt, and losing product-market fit by building the wrong things. Without responsible engineers, teams will ship slower, buggier, less-aligned products.

<!-- excerpt -->

## Shipping bugs

Engineers invariably ship bugs. And that's fine! What's important is 1) how you prevent bugs from entering production and 2) how you detect, triage and fix bugs that do make it to production. Experienced engineers will go beyond writing tests. Instead of blindly trusting their CI/CD infrastructure, they'll have a plan, explicitly or implicitly, for detecting outages and fixing them if necessary. Seniors minimize risk with each feature they ship.

One level up, junior engineers treat CI, deploys, and alerting as fixed entities. They'll talk about "fighting tests" and slow deploys, but are resigned to the current state of the world. Seniors realize that these are malleable. If a test is flaky, they fix it. If spurious alerts are waking engineers up at night, they delete them. All engineers know that engineering infrastructure is never perfect and always subject to bit rot. But while juniors accept the slowly decaying infrastructure, focusing on their specific tickets, seniors will fight against the tide, improving the whole team's productivity.

## Go outside your lane

This mentality shift doesn't just apply to outages and internal engineering tools. Junior engineers can be ticket machines, cranking out code week after week. Seniors understand that it's more important to be building the right thing than it is to build lots of things. Senior engineers, therefore, have as good or better of a grasp on the product and business as the company's PMs. Instead of leaving the hard work of product iteration to the product team, seniors work with PMs as peers with a different perspective.

## You're not in school anymore

Junior engineers mostly are recent college graduates. They've spent their entire lives in the lazy river that is the school system: there's a strong current pushing students to at least pass their classes and graduate. Projects and classes are self-contained; no single failure within the system is catastrophic. Once in the ocean of post-collegiate life, things are different.

There's nobody stopping you from breaking production. There's no guardrails against a bad product. No deus ex machina to save the day if you run out of runway. The buck stops with you.
