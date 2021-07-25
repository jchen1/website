---
layout: post
title: Bitrot
date: "2021-07-04"
author: Jeff Chen
tags: code
---

I've spent the last couple hours trying to rebuild my [mood tracker](https://github.com/jchen1/mood)—although notifications still work, opening the app throws the error "'mood' Is No Longer Available". I think this is because I last built the app a year ago, and apps installed with a paid developer account only last for a year. (Sidenote—it's ridiculously hard to find definitive information about this. Instead, I had to trawl through the Apple Developer Forums and Reddit to try to figure out what's going on.)

<!-- excerpt -->

Even though I hadn't touched the code in that year or even my local project folder with installed dependencies, it's taken several hours to successfully rebuild my app. Apparently, the new Xcode version (automatically updated) broke compatibility with the React Native version I was on. Upgrading was even more of a mess than usual—after the normal song and dance of updating my developer certificates and profiles, manually reconciling version differences, deleting and reinstalling Node and CocoaPod dependencies many times over, and cleaning the Xcode build folder, Xcode builds still hung without any visible errors. In the end, it was because of a misbehaving `find` command looking for `firebase.json` outside of my project directory—and into my overall Projects directory, which happened to have a subdirectory with 11.8 million files (don't ask).

Why all this headache? I see two reasons: first, as far as I can tell, there's no way to save Xcode build assets to sideload later—the only way to save an asset in an installable format is to send it to the App Store. Second, Xcode updates itself automatically with other system upgrades, and doesn't check whether its new version will break existing projects.

The hardest part of a software project usually isn't writing code--it's bootstrapping the project, or installing and managing dependencies, or interpreting arcane build errors. Building competence here is completely orthogonal to computer science or writing code. I think it explains a lot of the variation between (especially newer) software engineers. Obviously, you'll be better at solving immediate non-programming-related issues. Moreover, if you can unblock yourself, your learning curve will be much steeper. You'll develop a can-do mentality which will pay dividends down the line.

Does software engineering have to be this way? There are lots of promising initiatives: web-based IDEs like [replit](https://replit.com/) make it easier to get started than ever before. Tools like [AWS Lambda](https://aws.amazon.com/lambda/) mean you don't need to understand how to stand up a webserver to write meaningful code. From the other side, [Nix](https://nixos.org/) and [Bazel](https://bazel.build/) are moving closer to truly hermetic builds. Despite this progres, I'm skeptical that we'll fully eliminate the need to dive deep into tubes: [all abstractions are leaky](https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/).
