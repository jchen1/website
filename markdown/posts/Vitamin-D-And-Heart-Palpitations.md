---
layout: post
title: "Vitamin D and Heart Palpitations"
date: "2020-12-19"
author: Jeff Chen
tags: 2020,december,personal,whoop,health
ogImage: /images/vitamin-d-and-heart-palpitations/hero.jpg
---

**This isn’t medical advice. Talk to your doctor if you notice any health problems.**

![HRV over time{caption=My HRV over time. Outliers are days I had heart palpitations.}](/images/vitamin-d-and-heart-palpitations/hero.jpg)
In mid-2019, I experienced my first heart palpitations. "Palpitation" doesn't do the feeling justice: your heart literally skips a beat. For me, each skipped beat comes with a surge of panic and the sense that something is **wrong**. I was suddenly aware of a part of my body I'd never thought about before.

At first, I only noticed them at night, especially after big, greasy meals. But over the next couple months, the palpitations grew in frequency. Throughout most of 2020, I experienced palpitations regularly -- multiple times a week. There wasn't a link between heavy meals and palpitations anymore; they'd strike without any apparent pattern. At just 25, I was legitimately worried about dying early.

<!-- excerpt -->

## Vitamin D

Although I've never been diagnosed with a Vitamin D deficiency, I'd read [enough](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3068797/) [studies](https://www.nature.com/articles/s41430-020-0558-y) linking Vitamin D deficiencies with all sorts of negative health outcomes that I'd started supplementing Vitamin D in college. I started with 2000 IU daily but soon moved up to 5800 IU between a dedicated pill and my multivitamin. 5800 IU seemed to be a safe amount: [studies](https://pubmed.ncbi.nlm.nih.gov/22414585/) [indicated](https://pubmed.ncbi.nlm.nih.gov/10232622/) that supplementing up to even 10000 IU every day was safe. There's no way Vitamin D supplementation and my heart palpitations were connected, right?

## Putting the puzzle together

There was! In September, I happened upon an [essay by Dr. Deva Boone](https://www.devaboone.com/post/vitamin-d-part-2-shannon-s-story?postId=5f39453f8d01fe00170023fe) on Hacker News. Dr. Boone told the story of Shannon, who had been supplementing Vitamin D for 5 years before starting to experience anxiety, insomnia, and, crucially, heart palpitations. Her symptoms progressed to difficulty speaking and "catatonia". Six months after stopping her Vitamin D supplementation, Shannon's serum Vitamin D levels had fallen to normal levels, and her symptoms had disappeared completely.

Dr. Boone suggested that high-dose Vitamin D can increase the body's calcium absorption. High calcium levels can cause a long list of scary symptoms -- including heart palpitations. When caused by high Vitamin D levels, blood calcium can take a long time to decrease, because Vitamin D is fat soluble.

Shannon's initial symptoms and backstory pretty much matched mine: five years of 5000 IU Vitamin D supplementation followed by heart palpitations. And although I didn't have my serum Vitamin D numbers, my most recent bloodwork showed blood calcium levels at the high end of "normal" (typically hovering around 10.0 mg/dL inside a reference range of 8.7-10.2 mg/dL).

I stopped supplementing Vitamin D that day.

## Tracking and recovery

I've worn a [Whoop](https://whoop.com) band for unrelated reasons since right after my palpitations started. Whoop measures, among other things, your daily heart rate variability (HRV) and resting heart rate (RHR). I'd noticed that when I had heart palpitations at night, Whoop would report strange readings: HRV or RHR numbers that were way out of my normal range (>110ms HRV or <50bpm RHR). This came in handy, since I didn't have any historical data around my palpitation frequency.

I'd [previously used Whoop's undocumented API](https://github.com/jchen1/api/blob/master/apiserver/src/providers/whoop.ts) on a [quantified self project of mine](https://jeffchen.dev/metrics). With that, I set up a spreadsheet with Whoop's reported HRV and RHR numbers to track my palpitations over time. The numbers were striking: in February, I had had heart palpitations basically every other day. And in every tracked month up until I stopped Vitamin D supplementation, I had had at least one palpitation event a week.
![Palpitations over time{caption=Palpitations over time, as measured by Whoop}](/images/vitamin-d-and-heart-palpitations/palpitations-over-time.jpg)

My palpitations continued throughout September at its normal rate. But by October, they'd become noticeably less frequent. By November, they'd disappeared entirely!

## Lessons

What did I learn from this? A few things:

- **Be careful with supplements.** Supplementation is personal and what works for some people won't work for others. I should have kept a closer eye on my serum Vitamin D levels. In the future, I'll consult my doctor before starting any new supplements.
- **Health is a privilege.** I'd never seriously considered my own mortality before this. And in the grand scheme of things, heart palpitations aren't that serious. I'm grateful to have had this experience. In the end, as health issues go, this was pretty much as neat and low-impact as one can be.
- **Data is powerful.** I was fortunate that Whoop let me retroactively measure palpitations. If I hadn't had the data to back it up, I wouldn't have been able to measure the problem and isolate Vitamin D as the culprit. It's possible that I could have even resumed Vitamin D supplementation!
