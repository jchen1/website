---
layout: post
title: Markdown Image Captions
date: "2020-11-25"
author: Jeff Chen
tags: code,2020,november
---

Although HTML lets developers define `<figure>` elements with images and captions, Markdown doesn't provide a built-in syntax for it. Instead, authors need to insert raw `<figure>` HTML elements into their Markdown files. This is pretty painful - it breaks up the flow of Markdown files and is a non-starter for non-developers. This post details an alternative: by writing a [remark](https://github.com/remarkjs/remark) plugin, we can extend Markdown's syntax to support image captions!

<!-- excerpt -->

Specifically, let's use this syntax for captions: `![alt text{caption=some caption}](path/to/img.jpg)`. If an image has a caption, instead of producing just an `<img>` HTML element, we'll output a `<figure>` element wrapping an `<img>` and `<figcaption>`. For example,

`![example 1{caption=Example caption - here's a picture from my recent trip to Wyoming.}](/images/markdown-image-captions/example-1.jpg)`

produces:

![example 1{caption=Example caption - here's a picture from my recent trip to Wyoming.}](/images/markdown-image-captions/example-1.jpg)

By using Markdown's existing syntax for image alt tags, we can use `remark`'s built-in AST parser and add nodes to the output tree instead of needing to extend the parser itself.

## Skeleton code

`remark` converts a Markdown string into an AST, and, after optionally passing the AST through a series of plugins, converts that AST into the desired output format. For this post, we use `remark-html`, which outputs an HTML string. We'll be writing a plugin that rewrites `image` nodes in our AST. A remark plugin is a higher-order function of type `(opts: any) -> ((tree: MDAST) => void)` - the plugin modifies the AST in place. Here's some skeleton code:

```javascript
import remark from "remark";
import html from "remark-html";

function addCaptionsToImages(opts) {
  return tree => {
    // TODO!
  };
}

async function markdownToHTML(markdown) {
  return await remark().use(addCaptionsToImages).use(html).toString();
}
```

Although it wouldn't be particularly hard to walk the tree ourselves, we'll use the NPM package `unist-util-visit` to do it for us. By setting its second argument to `["image"]`, we can run our processing function only on `image` Markdown nodes:

```javascript
import visit from "unist-util-visit";

function addCaptionsToImages(opts) {
  return tree => {
    visit(tree, ["image"], node => {
      // TODO: modify image nodes in place
    });
  };
}
```

## Processing captions

Upon encountering an image node, our first step is to extract the caption from the rest of the alt text. Nodes are in the [mdast](https://github.com/syntax-tree/mdast) format - so the alt text is just in `node.alt`. Then, we can use a regex to extract the caption, if it exists, and return both caption and alt:

```javascript
function extractCaption(node) {
  const captionRegex = /(\{caption=([^\{\}]+)\})/;
  if (!node.alt || !captionRegex.text(node.alt)) {
    return { alt: node.alt };
  }

  const [captionWithControl, _, caption] = captionRegex.exec(node.alt);

  return {
    caption,
    alt: node.alt.replace(captionWithControl, ""),
  };
}
```

If a node doesn't have a caption, our `visit` function can just exit. If it does, however, we'll need to create two new nodes and modify our existing image node:

- `<figure>` parent node with two children: - `<caption>` node - `<img>` node, with the correct alt tag
  `mdast` nodes are just Javascript objects, so let's build some!

```javascript
const { alt, caption } = extractCaption(node);

// shallow copy the existing node, since we're going to replace it
const imgElement = { ...node, alt };
const captionElement = {
  type: "element",
  data: { hName: "figcaption" },
  children: [{ type: "text", value: caption }],
};
const figureElement = {
  type: "element",
  data: { hName: "figure" },
  children: [imgElement, captionElement],
};
```

Note that we define the HTML tag by setting `data.hName` on each element.
Because we're editing the image node in place and because JS is pass-by-reference - we need to modify our input image `node` to become our `figure` node. We can do this by removing all source properties and adding all properties of the `figure` object, like so:

```javascript
// replaces all properties of source with those of target
function replace(source, target) {
  for (const property in source) {
    delete source[property];
  }

  Object.assign(source, target);
}

replace(node, figureElement);
```

## All together

Let's pull all these snippets together into a cohesive plugin:

```javascript
import remark from "remark";
import html from "remark-html";
import visit from "unist-util-visit";

// replaces all properties of source with those of target
function replace(source, target) {
  for (const property in source) {
    delete source[property];
  }

  Object.assign(source, target);
}

function extractCaption(node) {
  const captionRegex = /(\{caption=([^\{\}]+)\})/;
  if (!node.alt || !captionRegex.text(node.alt)) {
    return { alt: node.alt };
  }

  const [captionWithControl, _, caption] = captionRegex.exec(node.alt);

  return {
    caption,
    alt: node.alt.replace(captionWithControl, "")
  }
}

function addCaptionsToImages(opts) {
  return tree => {
    visit(tree, ["image"], node => {
      const { alt, caption } = extractCaption(node);
      // do nothing if there's no caption
      if (!caption) return;

      const imgElement = { ...node, alt };

      const captionElement = {
        type: "element",
        data: { hName: "figcaption" },
        children: [{ type: "text", value: caption }],
      };

      const figureElement = {
        type: "element",
        data: { hName: "figure" },
        children: [imgElement, captionElement],
      };

      // in-place replacement of the image node with figure
      replace(node, figureElement);
    });
  };
}

function markdownToHTML(markdown) {
  return (await remark().use(addCaptionsToImages)).toString();
}
```

And - one more picture showing off the end result!

![example image 2{caption=Some buffalo outside Jackson, Wyoming.}](/images/markdown-image-captions/example-2.jpg)
