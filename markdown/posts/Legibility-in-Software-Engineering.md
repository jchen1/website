---
layout: post
title: "Legibility in Software Engineering"
date: "2021-08-28"
author: Jeff Chen
tags: management,code

---

The central concept in James C. Scott's [Seeing Like a State](https://www.goodreads.com/book/show/20186.Seeing_Like_a_State) is **legibility**, and how states' desire to make their societies more legible often leads to disaster. [Others](https://www.ribbonfarm.com/2010/07/26/a-big-little-idea-called-legibility/) [have](https://www.nateliason.com/notes/seeing-like-a-state-james-c-scott) [detailed](https://slatestarcodex.com/2017/03/16/book-review-seeing-like-a-state/) the main points of Seeing Like a State far better than I could—please start with those three if you're not familiar (or just read the book, which is excellent!)

<!-- excerpt -->

If you didn't read any of those, here's a brief overview of legibility:

- Premodern states had very little visibility into what was actually going on in their society—how rich a given citizen was, where they lived, how many citizens they even had. It was therefore difficult for states to effectively wage war or collect taxes.
- To improve their hold on society, states imposed measures like standardizing weights and measures, censuses, permanent last names, and many more—all of these convert complicated and local social practices into unified and legibile ones that can be centrally monitored.
- When taken too far, states' attempts to create legibility can cause disaster—like [19th century scientific forestry](https://www.tandfonline.com/doi/abs/10.1080/09505431.2010.519866?journalCode=csac20), the [exceptionally beautiful city of Brasilia](https://slatestarcodex.com/blog_images/state_brasilia1.png), and [the reorganization and collectivization of farms in the USSR which created devastating famine](https://en.wikipedia.org/wiki/Collectivization_in_the_Soviet_Union).

There are clear parallels between legibility in states and legibility in software companies. First and perhaps most obvious are the tools of the program manager, like Gantt charts, sprint points, and code velocity metrics. The program manager creates legibility for themselves and leaders by imposing structure on the development process of individual engineers. Engineers are often treated as interchangeable, chess pieces  that can be swapped between tickets depending on priority.

Like all abstractions, this one is [leaky](https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/). Software engineering is fundamentally complex and opaque: no engineer can perfectly predict how long a project will take. It's so bad, in fact, that common advice to engineers is to [double your true estimate](https://fibery.io/blog/software-development-time-estimation/), and Agile best practice is to abstract estimations into time-unitless "points" or "T-shirt sizes". Taken to an extreme, organizational tools like the above can create strange incentives, busy work, and a poor engineering culture.

[Leveling systems](https://jeffchen.dev/posts/A-Taxonomy-of-Software-Engineering-Taxonomies/) are another way that companies create legibility in engineering organizations. Of course, leveling is important! But it can become farcical—engineers at FAANG companies spend weeks or even months writing promotion packets and Amazon managers are [judged on whether they can stack-rank and fire their "bottom 6%"](https://www.seattletimes.com/business/amazon/internal-amazon-documents-shed-light-on-how-company-pressures-out-6-of-office-workers/).

The lesson in software engineering is the same that Scott imparts in Seeing Like a State. Legibility isn't inherently bad—things get out of hand when leaders reject the complexities of reality and attempt to substitute their own, "rational", simpler vision.