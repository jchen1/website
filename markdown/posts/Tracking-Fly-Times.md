---
layout: post
title: "Am I Getting Faster Over Time?"
date: "2021-09-26"
author: Jeff Chen
tags: track, code
heroImage: /images/tracking-fly-times/date_rep.png
---

Last winter, I published [Temperature and Speed](https://jeffchen.dev/posts/Temperature-And-Speed/), which looked at the correlation between my 30-meter fly times and the ambient temperature. Since then, I've gathered a lot more data: I have 49 Freelap-timed fly workouts and 245 reps across 11 months. I've also collected other metrics to help answer some questions I've had about speed:

## Did I get faster?

![date_rep](/images/tracking-fly-times/date_rep.png)

There's a relatively significant negative trend line between time of the year and rep—it sure looks like I got faster, at least at 30-meter flies, over the past year. This definitely wasn't clear in my day-to-day workouts: my per-workout graph looks really spiky:

![date_rep_line](/images/tracking-fly-times/date_rep_line.png)

The lesson here is to not read too much into individual reps and workouts—zooming out onto the overall trend is better.

<!-- excerpt -->

## Does sleep matter?

![sleep_rep](/images/tracking-fly-times/sleep_rep.png)

I don't have enough variance in my data to definitively answer this question. Although the R^2 seems to point towards "sleep doesn't matter at all", only 4 of my datapoints aren't between the 7:00-9:00 range, and I only got under 6 hours of sleep once. I suspect that if I let my sleep habits deteriorate, I'd see a much stronger correlation between speed and sleep.

## What about temperature?

![temperature_rep](/images/tracking-fly-times/temperature_rep.png)

[Last time](https://jeffchen.dev/posts/Temperature-And-Speed/) I found an R^2 of 0.21 between temperature and speed. With another few months of data, the R^2 has dropped to a more modest, but still impactful 0.13.

## How important is workout time?

![workouttime_rep](/images/tracking-fly-times/workouttime_rep.png)

[This recent Harvard meta-analysis](https://pubmed.ncbi.nlm.nih.gov/34431827/) found that "there is strong evidence that anerobic power as well as jump height are maximal between 13:00 and 19:00". Of the measurements studied, those two are most strongly correlated with sprint performance.

I don't have enough (or any) afternoon data to confirm this, but there's definitely a correlation between later workouts and faster times for me. In the upcoming season, I may experiment with afternoon workouts, especially on the weekend, to see if I can confirm the meta-analysis any more.

## WHOOP recovery—useful or not?

![whooprecovery_rep](/images/tracking-fly-times/whooprecovery_rep.png)

I've been using a [WHOOP](https://whoop.com) tracker, which reports a recovery score based on my HRV from 0-100% every day. In theory, lower HRV should mean that my body is less prepared for a tough workout than normal. Looking at the data, it doesn't seem like that's the case—the R^2 is basically 0, and I have just as many strong workouts in the 40-60% recovery range as I do in the 70%+ range.

## Conclusion

I started tracking most of these things not because I thought they'd be helpful, but because I could. It's definitely cool to look back and see that my training was actually helping me get faster!

I was surprised to see no correlation between fly times and either WHOOP recovery or sleep. It's not clear to me whether the lack of relationship is just noise from just 50 data points, or if there truly isn't any connection.

There are a couple things I didn't have the opportunity to check—first, ambient temperature and workout time are themselves strongly correlated. I didn't do any sort of multivariate analysis to account for this. I recently started recording how I feel qualitatively from a scale of 1-10 before I start my workout—but I didn't have enough data points to plot anything reasonable.

You can find the data I used on GitHub [here](https://github.com/jchen1/fly-times).
