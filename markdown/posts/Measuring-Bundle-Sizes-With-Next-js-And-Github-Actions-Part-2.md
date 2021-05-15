---
layout: post
title: Measuring Bundle Sizes with Next.js and GitHub Actions, Part 2
date: "2021-05-15"
author: Jeff Chen
tags: code
ogImage: /images/measuring-bundle-sizes-with-next-js-and-github-actions/screenshot.png
---

I wrote [Part 1](https://jeffchen.dev/posts/Measuring-Bundle-Sizes-With-Next-js-And-Github-Actions/) of this post back in February, demonstrating how to measure Next.js bundle sizes with GitHub Actions. Today, I'll walk through how to show a bundle size diff against `master`:

![](/images/measuring-bundle-sizes-with-next-js-and-github-actions/screenshot.png)

<!-- excerpt -->

We'll start from the final code from [part 1](https://jeffchen.dev/posts/Measuring-Bundle-Sizes-With-Next-js-And-Github-Actions/), which comments your project's bundle sizes on every PR action and push to `master`. The first thing we need to do is grab something to compare against: we'll use whatever is currently on `master`.

Since we're running our Action on every push to `master`, we don't need to recalculate `master`'s bundle size—we can just use the previously calculated sizes! For this, we can use the Action [action-download-artifact](https://github.com/dawidd6/action-download-artifact):

```yaml
- name: Download master JSON
  uses: dawidd6/action-download-artifact@v2
  if: success() && github.event.number
  with:
    workflow: bundle-size.yml
    branch: master
    path: .next/analyze/master
```

This downloads all artifacts from the most recent run of our Action workflow on `master` into the folder `.next/analyze/master`. Note that Part 1's `Build & analyze` step creates the folder `.next/analyze/master`—this is necessary for this step to succeed.

Now, we can write a script that compares the `bundle.json` files across `master` and our new PR:

```javascript
const currentBundle = require("../.next/analyze/bundle.json");
const masterBundle = require("../.next/analyze/master/bundle/bundle.json");

const sizes = currentBundle
  .map(({ path, size }) => {
    const masterSize = masterBundle.find(x => x.path === path);
    // if a file exists in our bundle but not master's, it was added
    const diff = masterSize ? size - masterSize.size : "added";
  })
  // if a file exists in master's bundle but not ours, it was removed
  .concat(
    masterBundle
      .filter(({ path }) => !currentBundle.find(x => x.path === path))
      .map(({ path }) => "removed")
  );
```

Then, using the same code from part 1, we can output a Markdown table of this diff to publish to a GitHub comment:

```javascript
const fs = require("fs");
const path = require("path");

const currentBundle = require("../.next/analyze/bundle.json");
const masterBundle = require("../.next/analyze/master/bundle/bundle.json");

const prefix = ".next";
const outdir = path.join(process.cwd(), prefix, "analyze");
const outfile = path.join(outdir, "bundle-comparison.txt");

function formatBytes(bytes, signed = false) {
  const sign = signed ? (bytes < 0 ? "-" : "+") : "";
  if (bytes === 0) return `${sign}0B`;

  const k = 1024;
  const dm = 2;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

  return `${sign}${parseFloat(Math.abs(bytes / Math.pow(k, i)).toFixed(dm))}${
    sizes[i]
  }`;
}

const sizes = currentBundle
  .map(({ path, size }) => {
    const masterSize = masterBundle.find(x => x.path === path);
    const diffStr = masterSize
      ? formatBytes(size - masterSize.size, true)
      : "added";
    return `| \`${path}\` | ${formatBytes(size)} (${diffStr}) |`;
  })
  .concat(
    masterBundle
      .filter(({ path }) => !currentBundle.find(x => x.path === path))
      .map(({ path }) => `| \`${path}\` | removed |`)
  )
  .join("\n");

const output = `# Bundle Size
| Route | Size (gzipped) |
| --- | --- |
${sizes}
<!-- GH BOT -->`;

try {
  fs.mkdirSync(outdir);
} catch (e) {
  // may already exist
}

fs.writeFileSync(outfile, output);
```

The last step is to include this script in our Actions workflow:

```yaml
# Place this after "Download master JSON"
- name: Compare bundle size
  if: success() && github.event.number
  run: ls -laR .next/analyze/master && node scripts/compare-bundles.js

# Modify this step to use `bundle-comparison.txt`, the new file we're uploading
- name: Get comment body
  id: get-comment-body
  if: success() && github.event.number
  run: |
    body=$(cat .next/analyze/bundle-comparison.txt)
    body="${body//'%'/'%25'}"
    body="${body//$'\n'/'%0A'}"
    body="${body//$'\r'/'%0D'}"
    echo ::set-output name=body::$body
```

If all goes well, you'll see a bundle size diff in your PR!

![](/images/measuring-bundle-sizes-with-next-js-and-github-actions/screenshot.png)
