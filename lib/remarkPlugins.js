import definitions from "mdast-util-definitions";
import visit from "unist-util-visit";

import { isAbsoluteURL, sizeImage, replace } from "./util";

export function trackingLinks(opts) {
  const options = opts || {};

  const trackingObject = options.trackingObject || "window.gtag";

  const category = options.category;
  const action = options.action || "link-click";
  const label = options.label || "markdown";

  return function (tree) {
    const definition = definitions(tree);
    visit(tree, ["link", "linkReference"], node => {
      const ctx = node.type === "link" ? node : definition(node.identifier);

      if (
        ctx &&
        isAbsoluteURL(ctx.url) &&
        ["http", "https"].includes(ctx.url.slice(0, ctx.url.indexOf(":")))
      ) {
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};

        const obj = {
          event_category: category,
          event_label: label,
          value: ctx.url,
        };

        node.data.hProperties.onclick =
          node.data.hProperties.onclick ||
          `${trackingObject}("event", "${action}", ${JSON.stringify(obj)})`;
      }
    });
  };
}

// adds loading=lazy to images (doesn't support raw HTML)
export function lazyImages(opts) {
  const options = opts || {};

  return function (tree) {
    visit(tree, ["image"], node => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties.loading = node.data.hProperties.loading || "lazy";
    });
  };
}

export function addCaptionsToImages(opts) {
  const options = opts || {};
  const captionRegex = /(\{caption=([^\{\}]+)\})/;

  return function (tree) {
    visit(tree, ["image"], node => {
      if (!node.alt || !captionRegex.test(node.alt)) return;

      const [captionWithControl, _, caption] = captionRegex.exec(node.alt);

      const img = { ...node };
      img.alt = img.alt.replace(captionWithControl, "");

      const captionElement = {
        type: "element",
        tagName: "figcaption",
        data: {
          hName: "figcaption",
        },
        children: [{ type: "text", value: caption }],
      };

      const figure = {
        type: "element",
        tagName: "figure",
        data: {
          hName: "figure",
        },
        children: [img, captionElement],
      };

      replace(node, figure);
    });
  };
}

// adds intrinsic size to locally served images
export function addSizeToLocalImages(opts) {
  const options = opts || {};
  const basepath = options.basepath || "";

  return function (tree) {
    visit(tree, ["image"], node => {
      const size = sizeImage(node.url, { basepath });
      if (size && size.width && size.height) {
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        if (!node.data.hProperties.width && !node.data.hProperties.height) {
          node.data.hProperties.width = size.width;
          node.data.hProperties.height = size.height;
        }
      }
    });
  };
}
