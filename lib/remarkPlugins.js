import definitions from "mdast-util-definitions";
import visit from "unist-util-visit";
import remove from "unist-util-remove";

import { isAbsoluteURL, replace, sizeImage } from "./util/server";

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

export function setHighlightLang() {
  return function (tree) {
    visit(tree, ["code"], node => {
      if (node.lang) {
        node.data.hProperties["data-language"] = node.lang;
      }
    });
  };
}

export function addCaptionsToImages(opts) {
  const options = opts || {};
  const captionRegex = /(\{caption=([^\{\}]+)\})/;

  return function (tree) {
    visit(tree, ["image"], node => {
      if (node.data && node.data.processed === true) return;

      const [img, caption] = (function () {
        if (!node.alt || !captionRegex.test(node.alt))
          return [{ ...node }, null];

        const [captionWithControl, _, caption] = captionRegex.exec(node.alt);

        const img = { ...node };
        img.alt = img.alt.replace(captionWithControl, "");

        return [img, caption];
      })();

      img.data = img.data || {};
      img.data.processed = true;
      img.data.hProperties = img.data.hProperties || {};
      img.data.hProperties.className = (
        img.data.hProperties.className || []
      ).concat("background");

      const captionElement = {
        type: "element",
        data: {
          hName: "figcaption",
        },
        children: [{ type: "text", value: caption }],
      };

      const figure = {
        type: "element",
        data: {
          hName: "figure",
        },
        children: [img],
      };

      if (caption) {
        figure.children.push(captionElement);
      }

      replace(node, figure);
    });
  };
}

// adds intrinsic size & srcset to locally served images
// adds loading=lazy to images (doesn't support raw HTML)
// uses vercel's built-in image optimizer
export function optimizeImages(opts) {
  const options = opts || {};
  const basepath = options.basepath || "";
  const loading = options.eagerLoad ? "eager" : "lazy";

  const { deviceSizes, path } = process.env.__NEXT_IMAGE_OPTS || {
    deviceSizes: [],
    path: "",
  };
  const allSizes = [...deviceSizes].sort((a, b) => a - b);

  const last = allSizes.length - 1;

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
        node.data.hProperties = {
          decoding: "async",
          loading,
          srcset: allSizes
            .map(
              w =>
                `${path}?url=${encodeURIComponent(node.url)}&w=${w}&q=75 ${w}w`
            )
            .join(", "),

          ...node.data.hProperties,
        };

        node.url = `/_next/image?url=${encodeURIComponent(node.url)}&w=${
          allSizes[last]
        }&q=75`;
      }
    });
  };
}

export function anchorPostExcerpt(opts) {
  const regex = /<!--(.*?)-->/;
  return function (tree) {
    let index = -1;
    visit(tree, ["html"], node => {
      if (index === -1 && regex.test(node.value)) {
        const [_, comment] = regex.exec(node.value);
        if (comment.trim() === "excerpt") {
          index = tree.children.indexOf(node);
        }
      }
    });

    if (index > -1 && index !== tree.children.length - 1) {
      const postNode = tree.children[index + 1];
      postNode.data = postNode.data || {};
      postNode.data.hProperties = postNode.data.hProperties || {};
      postNode.data.hProperties.id =
        postNode.data.hProperties.id || "read-more";

      if (opts && opts.returnAnchor) {
        const anchor = postNode.data.hProperties.id;

        return { type: "text", value: anchor };
      }
    }
  };
}

export function removeImages(opts) {
  return function (tree) {
    return remove(tree, { cascade: false }, node => node.type === "image");
  };
}
