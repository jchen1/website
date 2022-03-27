---
layout: post
title: Measuring Bundle Sizes with Next.js and GitHub Actions
date: "2021-02-26"
author: Jeff Chen
tags: code
---

Measuring your Javascript bundle size is an important way to keep client load times low. These days, load times matter for more than just user experience: [load times can affect SEO](https://moz.com/learn/seo/page-speed). In this article, I'll share my workflow for measuring this website's bundle size with every change that I make!

**Update 5/21**: I wrote a [Part 2](https://jeffchen.dev/posts/Measuring-Bundle-Sizes-With-Next-js-And-Github-Actions-Part-2/) that details how to diff your bundle sizes against `master`. Check it out!

<!-- excerpt -->

![](/images/measuring-bundle-sizes-with-next-js-and-github-actions/screenshot.png)

## Step 1: Getting bundle stats

My website uses [Next.js](https://nextjs.org/), which generates a set of Javascript and JSON files that can be statically served. Our first step is to generate a production bundle, which we can do with `npm run build`:

```javascript
jeff at Jeffs-MacBook-Pro in ~/Documents/Projects/website (master)
$ npm run build

> website@0.1.0 build
> next build

Loaded env from /Users/jeff/Documents/Projects/website/.env
info  - Using external babel configuration from /Users/jeff/Documents/Projects/website/.babelrc
info  - Creating an optimized production build
info  - Compiled successfully
info  - Collecting page data
info  - Generating static pages (86/86)
info  - Finalizing page optimization

[truncated page stats]
```

On each build, Next.js saves a JSON file with build information to `.next/build-manifest.json`. To get the size of each bundle we serve, we can parse that JSON file!

```bash
jeff at Jeffs-MacBook-Pro in ~/Documents/Projects/website (master)
$ cat .next/build-manifest.json
{
  "polyfillFiles": [
    "static/chunks/polyfills-043c4c16954531320324.js"
  ],
  "devFiles": [],
  "ampDevFiles": [],
  "lowPriorityFiles": [
    "static/zrQpFp5tShzm6j3i443-C/_buildManifest.js",
    "static/zrQpFp5tShzm6j3i443-C/_ssgManifest.js"
  ],
  "pages": {
    "/": [
      "static/chunks/main-6321d85bcb5a240192ec.js",
      "static/chunks/webpack-586d44af55dd3ccdba24.js",
      "static/chunks/framework.bfda0494689794281996.js",
      "static/chunks/12b1b61689470b41191fc95d3f01ada93a898dae.c617e36d09fc94c17cf5.js",
      "static/chunks/70221a550d607c5865d944fb6aa4c4ec9c0303b3.d92a920c01229e8ad598.js",
      "static/chunks/316ced6385d2d49a7711546558b605da4e710165.71291815b91bac8d6f72.js",
      "static/css/9302be182a8c20152319.css",
      "static/chunks/pages/index-f167e284c0eaca7164f5.js"
    ],
    ...
```

Each item in the `pages` dictionary is an array containing all of the Javascript and CSS files necessary to render any given Next.js [page](https://nextjs.org/docs/basic-features/pages), including dynamic routes. Our approach to getting bundle stats for any page will be to sum the gzipped size of each file in the page's dependencies:

```javascript
const pageSizes = Object.keys(bundle.pages).map(p => {
  const files = bundle.pages[p];
  const size = files
    .map(filename => {
      const fn = path.join(process.cwd(), prefix, filename);
      const bytes = fs.readFileSync(fn);
      const gzipped = zlib.gzipSync(bytes);
      return gzipped.byteLength;
    })
    .reduce((s, b) => s + b, 0);

  return { path: p, size };
});
```

We'll add some ceremony to this kernel and save it to `scripts/analyze-bundles.js` so that it can take a `build-manifest.json` and write its output as JSON to `.next/bundle.json`:

```javascript
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const bundle = require("../.next/build-manifest.json");

const prefix = ".next";
const outdir = path.join(process.cwd(), prefix, "analyze");
const outfile = path.join(outdir, "bundle-sizes.txt");

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

const pageSizes = Object.keys(bundle.pages).map(p => {
  const files = bundle.pages[p];
  const size = files
    .map(filename => {
      const fn = path.join(process.cwd(), prefix, filename);
      const bytes = fs.readFileSync(fn);
      const gzipped = zlib.gzipSync(bytes);
      return gzipped.byteLength;
    })
    .reduce((s, b) => s + b, 0);

  return { path: p, size };
});

// Produce a Markdown table with each page & its size
const sizes = pageSizes
  .map(({ path, size }) => `| \`${path}\` | ${formatBytes(size)} |`)
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

We'll also add this to the `scripts` key of our `package.json`:

```javascript
{
  ...
  "scripts": {
    ...
    "analyze": "ANALYZE=true NODE_ENV=production next build && node scripts/analyze-bundles.js",
  },
  ...
}
```

## Step 2: GitHub Actions

Now that we can get our bundle sizes for each page, we need to show it on each pull request. For that, we can write a [GitHub Action](https://github.com/features/actions)! Actions let you run arbitrary Docker containers on your code—most often for CI/CD. It has a fairly generous free tier (unlimited for public repos and 2,000 minutes per month for private repos) that will more than suffice for our purposes.

It's probably best to just share my entire Action workflow here, annotated with comments:

```yml
# .github/workflows/bundle-size.yml
name: Analyze Bundle Size

# Run this workflow on every Pull Request action as well as all pushes to master
on:
  pull_request:
  push:
    branches:
      - master

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "analyze"
  analyze:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
      # Checks-out your repository under $GITHUB_WORKSPACE, so your job can access it
      - uses: actions/checkout@v2

      # Next.js runs on Node—we need to set this up first.
      - name: Setup Node
        uses: actions/setup-node@v1
        with:
          node-version: "15.x"

      # Run `npm install`, using a cache
      - name: Install
        uses: bahmutov/npm-install@v1

      - name: Build & analyze
        run: mkdir -p .next/analyze/master && npm run analyze | tee .next/analyze/output.txt

      - name: Upload bundle
        uses: actions/upload-artifact@v2
        with:
          name: bundle
          path: |
            .next/analyze/client.html
            .next/analyze/bundle.json

      # A bit of find & replace on our output text for displaying properly. Save this to an Action variable.
      - name: Get comment body
        id: get-comment-body
        if: success() && github.event.number
        run: |
          body=$(cat .next/analyze/bundle-sizes.txt)
          body="${body//'%'/'%25'}"
          body="${body//$'\n'/'%0A'}"
          body="${body//$'\r'/'%0D'}"
          echo ::set-output name=body::$body

      # Looks for a comment with <!-- GH BOT --> somewhere in its body.
      - name: Find Comment
        uses: peter-evans/find-comment@v1
        if: success() && github.event.number
        id: fc
        with:
          issue-number: ${{ github.event.number }}
          body-includes: "<!-- GH BOT -->"

      # If no comment exists, make one with the previously saved Action variable!
      - name: Create Comment
        uses: peter-evans/create-or-update-comment@v1.4.4
        if: success() && github.event.number && steps.fc.outputs.comment-id == 0
        with:
          issue-number: ${{ github.event.number }}
          body: ${{ steps.get-comment-body.outputs.body }}

      # Otherwise, if a comment already exists, replace its body.
      - name: Update Comment
        uses: peter-evans/create-or-update-comment@v1.4.4
        if: success() && github.event.number && steps.fc.outputs.comment-id != 0
        with:
          issue-number: ${{ github.event.number }}
          body: ${{ steps.get-comment-body.outputs.body }}
          comment-id: ${{ steps.fc.outputs.comment-id }}
          edit-mode: replace
```

This workflow will automatically run the script we built in Part 1 on every PR action (creation, push, delete) and every push to `master`. It'll either create or update an already-existing bot comment with each page's bundle size!
