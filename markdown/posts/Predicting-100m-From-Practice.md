---
layout: post
title: Predicting 100m from Practice Results
date: "2024-11-03"
author: Jeff Chen
tags: track
---

I built a [tool](/projects/track/100m-predictor) that predicts your 100m time given practice results—go check it out! This post details the development process, including data parsing and training and validating the model.

<!-- excerpt -->

## Gathering data

I was fortunate to find a dataset of FAT 100m times and their 10m split breakdowns [here](https://www.athletefirst.org/?page_id=308). And though the data is a PDF, I have [plenty](/posts/Effect-of-Lane-Draw-In-200m-Sprinters/) of [experience](/posts/Calculating-World-Athletics-Coefficients/) converting semi-structured PDFs into CSVs. This time, for fun, after grabbing the text from the PDF, I wrote the [parser](https://github.com/jchen1/100m-analysis) in F#.

After removing Paralympic athletes, results without 10m splits (plenty of races only had 30m splits), injuries, and outliers, I had a total of 834 races, ranging from 9.58 to 11.66.
Most of the subelite times were Japanese athletes, which likely introduces some bias into the model—at least as far as I know, many of the top Japanese athletes favor stride frequency to length, which causes them to hit peak velocity earlier in the race.

## Choosing inputs

A 100m race can be decomposed into inputs a million different ways. One obvious decomposition is reaction time, max velocity, distance at max velocity, and acceleration and deceleration parameters, another might be to use stride frequency and length at maximum velocity plus acceleration/deceleration parameters. Unfortunately, many of these qualities are difficult to measure directly without advanced equipment (or computer vision, which also remains inaccessible to ordinary athletes).

Therefore, I chose two input measures: 30m time from blocks, and 10m fly time. These inputs are 1) mostly independent, 2) measure important qualities of sprinting, and 3) are easy to measure to reasonable accuracy with just a Freelap or 240fps video (which many high-end phones can capture these days). I favored a 10m fly time over, say, 20m or 30m flies, for two main reasons. First, I wanted to capture true maximum velocity in that input parameter, while 20/30m flies necessarily include speed endurance. Second, despite 10m flies being relatively difficult to measure with accuracy, they're more easily derivable from the longer fly times given enough data.

To reconcile the 10m split data with these inputs, I computed 30m block and 10m fly times with simple aggregations. I removed the given reaction time from races that included that data, and removed the average reaction across my dataset (0.149s) from those that didn't.

## Regression types

I played with many different model types, ranging from simple linear and polynomial regressions through more advanced techniques like SVMs and even a simple neural net.
The more complex approaches proved to be less accurate and extremely prone to overfitting—with only two input variables and a single output, the relationship between inputs and outputs is necessarily not very complicated.

In the end, I used an exponential regression using 30m block and maximum velocity as inputs, which was calculated by inverting 10m fly times, i.e. `10 / fly_time`.
This produced an R&sup2; of 0.964 and mean squared error of just 0.004. Interestingly, training a regression against each single input (i.e. 30m block and 10m fly) produced R&sup2; values of just under 0.9, indicating that even a single
This had the extra advantage of being extremely simple to port over to Javascript for the [online calulator](/projects/track/100m-predictor).

## Future work

The biggest missing piece is additional data, especially sub-elite times. Despite being linear, I expect this model to fall apart at the boundaries. Unfortunately, only elite meets capture and release 10m split data, apparently except in Japan.

I'll likely also end up building a converter between various fly distances; the initial validation I've done here is promising.
