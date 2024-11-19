---
layout: post
title: Temperature and Speed—Redux
date: "2024-11-18"
author: Jeff Chen
tags: track
heroImage: /images/temperature-and-speed-redux/acceleration-time-vs-temperature.png
---

Almost four years ago, I wrote a post about the relationship between [temperature and speed](/temperature-and-speed), finding a linear relationship on 30m fly times with an R² of 0.21. I've kept tracking every rep since then—instead of 150 data points, I now have almost a thousand. I've also gotten more sophisticated with how I estimate fly and acceleration times from single reps that deserves its own blogpost. For now, what's important is that across this four-year dataset, I have 642 30m acceleration reps and 451 10m fly reps, with temperatures ranging from 14° to 95° F.

<!-- excerpt -->

I trained linear and polynomial regressions with temperature as the independent variable and both fly time and 30m acceleration time as the dependent variable, and found that the most appropriate regression was quadratic for both. The R² values for flies and accelerations were 0.316 and 0.777, respectively.

![{caption=Fly time vs. temperature}](/images/temperature-and-speed-redux/fly-time-vs-temperature.png)

![{caption=30m acceleration time vs. temperature}](/images/temperature-and-speed-redux/acceleration-time-vs-temperature.png)

These are both higher R² values than I found in my previous analysis, due to the larger dataset. The acceleration regression is especially strong, which is interesting and counterintuitive—I would have expected fly times to be more sensitive to temperature than accelerations.

As always, there are significant limitations in this work. First, this data is all from a single athlete (me), which may not be representative of the general population. Second, I have relatively little data at either end of the temperature range, so those data may have an outsize impact on the learned regressions.

The effect sizes remain relatively small but noticeable. For example, the below equations predict that I'd run a 3.935 30m acceleration at 70° F, 4.071 at 30° F, and 3.882 at 90° F. 10m flies change even less, which makes sense given their shorter distance.

For posterity, here are the learned regressions as of this writing:

- 30m acceleration: `4.2 - 0.00468t + 0.0000127t²`, where `t` is temperature in °F. Note that the constant 4.2 is applicable only to myself, and will be different for other athletes.
- 10m fly: `1.02 + 0.0000933t - 0.00000806t²`, where `t` is temperature in °F. Note that the constant 1.02 is applicable only to myself, and will be different for other athletes.
