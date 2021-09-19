---
layout: post
title: "JOTA: syncing MFA app for Apple devices"
date: "2021-09-19"
author: Jeff Chen
tags: code
heroImage: /images/jota-syncing-mfa-app-for-apple-devices/macos.png
---

Multi-factor authentication is becoming increasingly prevalent. Many companies' information security policies require employees to use MFA when available—and it's just good practice.

The mostly commonly used MFA tool, Google Authenticator, is basically unmaintained at this point. I developed JOTA (a backronym for Jeff's One-Time Authenticator) to address some of the pain points I felt with Google Authenticator:

- JOTA supports syncing to all your (Apple) devices with iCloud Keychain. When used in conjunction with a MFA-protected Apple ID, this still fits the factor of "something you have"—you need a device with a valid Apple ID cookie on it, which is itself protected by Apple's separately implemented MFA.
- This means that JOTA has a Mac app! ![caption={JOTA also supports biometric authentication when enabled.}](/images/jota-syncing-mfa-app-for-apple-devices/macos.png)
- On mobile, JOTA can also autofill MFA codes without leaving Safari—a much more convienent user flow than seeing the MFA prompt, quitting Safari, opening Google Authenticator, scrolling to the right code, copying it, returning to Safari, pasting it, and finally continuing. ![{caption={JOTA will suggest MFA codes based on the open webpage.}](/images/jota-syncing-mfa-app-for-apple-devices/ios.png)

You can download JOTA for mobile devices from the App Store [here](https://apps.apple.com/us/app/jota-easy-2fa/id1478072187), and for Macs [here](/assets/jota-macos.app). Let me know what you think!
