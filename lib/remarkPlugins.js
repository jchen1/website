import { join } from "path";
import imageSize from "image-size";
import definitions from "mdast-util-definitions";
import visit from "unist-util-visit";

// https://github.com/sindresorhus/is-absolute-url/blob/master/index.js
function isAbsoluteURL(url) {
  if (typeof url !== "string") {
    throw new TypeError(`Expected a \`string\`, got \`${typeof url}\``);
  }

  // Don't match Windows paths `c:\`
  if (/^[a-zA-Z]:\\/.test(url)) {
    return false;
  }

  // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
  // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
}

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

function sizeImage(image, { basepath = "" }) {
  // only supports local images with absolute paths
  if (!isAbsoluteURL(image) && image.startsWith("/")) {
    const path = join(process.cwd(), basepath, image);
    try {
      return imageSize(path);
    } catch (e) {
      console.warn(`Error getting dimensions for ${image} (path: ${path})!`, e);
    }
  }
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