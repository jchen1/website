---
layout: post
title: "Effect of Lane Draw in 200m Sprinters"
date: "2022-01-25"
author: Jeff Chen
tags: track
heroImage: /images/effect-of-lane-draw-in-200m-sprinters/diff_by_lane.png
---

There's a growing consensus within the sprinting world that 200- and 400-meter sprinters have an advantange in the outer lanes. Famously, Wayde van Niekerk ran his world record 400m out of lane 8, and Karsten Warholm is known for preferring lane 7.

Surprisingly for such a data-driven culture, there's almost nothing in the current literature to back this up. So, using data from Diamond League results from 2015-2021, I estimated the effect of lane assignment on elite male sprinters in the 200m, and found that the advantage per lane was about 0.018 seconds—meaning that **outdoor 200m sprinters in lane 9 have an advantage of 0.14s over those in lane 1**.

<!-- excerpt -->

## Methodology

I downloaded results from the [Diamond League](https://www.diamondleague.com/lists-results/archive/2015/), the only reliable source of meet results I could find that included lane assignments. Since the results are PDFs, I wrote some [custom parsing logic](https://github.com/jchen1/200m-lane-analysis/blob/master/src/lane_analysis/pdf.clj) to gather the results.

Diamond League meets are elite: the average 200m time across 425 results was a blazing 20.55!

![](/images/effect-of-lane-draw-in-200m-sprinters/box_by_lane.png)

Note that this data is corrected for wind, using the quadratic model from [this paper](https://www.tandfonline.com/doi/full/10.1080/17461391.2018.1480062). A simple linear regression finds a difference of 0.07 seconds per lane:

![](/images/effect-of-lane-draw-in-200m-sprinters/regression_by_lane.png)

It's clear from this data that runners in outside lanes are, on average, faster than those on the inside. However, this data is biased: the Diamond League gives the fastest sprinters their preferred lanes to (hopefully) produce faster times. Since sprinters are likely to prefer middle or outer lanes, we are likely overestimating the actual effect size.

To correct for this, I used [World Athletics](https://www.worldathletics.org/athletes) to find each athlete's season-best time, and compared each Diamond League result against that season-best time. Now, the downward trend is smaller but still clear:

![](/images/effect-of-lane-draw-in-200m-sprinters/diff_by_lane.png)

While our estimated effect size decreased from 0.074 to 0.018 seconds per lane, our R² increased from 0.65 to 0.84!

## Future Work

While I think the analysis here is solid, there's more work to be done:

- Fringe athletes are likely to run their fastest times in races not recorded by World Athletics—this might artificially reduce our effect size as those athletes are also more likely to run in an inside lane in the Diamond League.
- I didn't look at women or at 400m runners, though my work should be easily extendable to both of those. For anybody interested in this, the code I used for this analysis is available [here](https://github.com/jchen1/200m-lane-analysis).
- I couldn't find any source of data for indoor 200m results that included lane draws.

## Conclusion

The data clearly show that outside lanes produce faster results—and meaningfully faster results. In the 2020 Olympics, Noah Lyles ran 19.74 out of lane 3 for the bronze medal, while Kenny Bednarek ran 19.68 out of lane 7. The regression above shows that Lyles was at a disadvantage of ~0.07 seconds compared to Bednarek—which, if removed, would have given Lyles the silver instead!