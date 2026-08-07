import { definitions } from "mdast-util-definitions";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import { remove } from "unist-util-remove";
import { all, createLowlight } from "lowlight";
import GithubSlugger from "github-slugger";

import { isAbsoluteURL, replace, sizeImage } from "./util/server";
import imageConfig from "./imageConfig";

import type { ElementContent } from "hast";
import type { Code, Html, Image, Link, LinkReference, Root } from "mdast";
// registers the hName/hProperties/hChildren fields on mdast node data
import type {} from "mdast-util-to-hast";

declare module "mdast" {
  interface Data {
    /** heading anchor, mirrored into hProperties.id */
    id?: string;
    /** marks images already wrapped in a <figure> */
    processed?: boolean;
  }
}

// a synthetic node rendered purely via its hName by remark-html
interface HNamedNode {
  type: string;
  data: { hName: string };
  children: unknown[];
}

export interface TrackingLinksOptions {
  trackingObject?: string;
  category?: string;
  action?: string;
  label?: string;
}

export function trackingLinks(opts?: TrackingLinksOptions) {
  const options = opts || {};

  const trackingObject = options.trackingObject || "window.gtag";

  const category = options.category;
  const action = options.action || "link-click";
  const label = options.label || "markdown";

  return function (tree: Root) {
    const definition = definitions(tree);
    visit(tree, ["link", "linkReference"], node => {
      const link = node as Link | LinkReference;
      const ctx = link.type === "link" ? link : definition(link.identifier);

      if (
        ctx &&
        isAbsoluteURL(ctx.url) &&
        ["http", "https"].includes(ctx.url.slice(0, ctx.url.indexOf(":")))
      ) {
        link.data = link.data || {};
        link.data.hProperties = link.data.hProperties || {};

        const obj = {
          event_category: category,
          event_label: label,
          value: ctx.url,
        };

        link.data.hProperties.onclick =
          link.data.hProperties.onclick ||
          `${trackingObject}("event", "${action}", ${JSON.stringify(obj)})`;
      }
    });
  };
}

const lowlight = createLowlight(all);

// gives every heading a github-slugger id, unique per document
export function headingIds() {
  return function (tree: Root) {
    const slugger = new GithubSlugger();
    visit(tree, "heading", node => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.id = node.data.hProperties.id = slugger.slug(toString(node));
    });
  };
}

// opens absolute http(s) links in a new tab with safe rel attributes
export function externalLinks() {
  return function (tree: Root) {
    const definition = definitions(tree);
    visit(tree, ["link", "linkReference"], node => {
      const link = node as Link | LinkReference;
      const ctx = link.type === "link" ? link : definition(link.identifier);

      if (
        ctx &&
        isAbsoluteURL(ctx.url) &&
        ["http", "https"].includes(ctx.url.slice(0, ctx.url.indexOf(":")))
      ) {
        link.data = link.data || {};
        link.data.hProperties = link.data.hProperties || {};
        link.data.hProperties.target = "_blank";
        link.data.hProperties.rel = ["nofollow", "noopener", "noreferrer"];
      }
    });
  };
}

// syntax-highlights fenced code blocks with lowlight/highlight.js, emitting
// <code class="hljs language-*"> with highlighted hast children
export function highlightCode() {
  return function (tree: Root) {
    visit(tree, ["code"], node => {
      const code = node as Code;
      if (!code.lang) return;

      code.data = code.data || {};
      code.data.hProperties = code.data.hProperties || {};

      code.data.hChildren = lowlight.highlight(code.lang, code.value)
        .children as ElementContent[];
      code.data.hProperties.className = [
        "hljs",
        ...((code.data.hProperties.className as string[] | undefined) || []),
        `language-${code.lang}`,
      ];
    });
  };
}

// truncates the tree at the first <!-- excerpt --> style comment
// (also accepts more/preview/teaser as the marker)
export function excerpt() {
  const markers = ["excerpt", "more", "preview", "teaser"];
  const commentRegex = /<!--([\s\S]*?)-->/;

  return function (tree: Root) {
    let index = -1;

    visit(tree, "html", node => {
      if (index !== -1) return;
      const comment = commentRegex.exec(node.value);
      if (comment && markers.includes(comment[1].trim())) {
        index = tree.children.indexOf(node);
      }
    });

    if (index > -1) {
      tree.children.splice(index);
    }
  };
}

export function setHighlightLang() {
  return function (tree: Root) {
    visit(tree, ["code"], node => {
      const code = node as Code;
      if (code.lang) {
        // data.hProperties exists here: highlightCode runs earlier in the
        // pipeline and creates it for every code block with a lang
        code.data!.hProperties!["data-language"] = code.lang;
      }
    });
  };
}

export function addCaptionsToImages(opts?: unknown) {
  const options = opts || {};
  const captionRegex = /(\{caption=([^\{\}]+)\})/;

  return function (tree: Root) {
    visit(tree, ["image"], node => {
      const image = node as Image;
      if (image.data && image.data.processed === true) return;

      const [img, caption] = (function (): [Image, string | null] {
        if (!image.alt || !captionRegex.test(image.alt))
          return [{ ...image }, null];

        const [captionWithControl, _, caption] = captionRegex.exec(image.alt)!;

        const img = { ...image };
        img.alt = img.alt!.replace(captionWithControl, "");

        return [img, caption];
      })();

      img.data = img.data || {};
      img.data.processed = true;
      img.data.hProperties = img.data.hProperties || {};
      img.data.hProperties.className = (
        (img.data.hProperties.className as string[] | undefined) || []
      ).concat("background");

      const captionElement: HNamedNode = {
        type: "element",
        data: {
          hName: "figcaption",
        },
        children: [{ type: "text", value: caption }],
      };

      const figure: HNamedNode = {
        type: "element",
        data: {
          hName: "figure",
        },
        children: [img],
      };

      if (caption) {
        figure.children.push(captionElement);
      }

      replace(image, figure);
    });
  };
}

export interface OptimizeImagesOptions {
  basepath?: string;
  eagerLoad?: boolean;
}

// adds intrinsic size & srcset to locally served images
// adds loading=lazy to images (doesn't support raw HTML)
// uses vercel's built-in image optimizer
export function optimizeImages(opts?: OptimizeImagesOptions) {
  const options = opts || {};
  const basepath = options.basepath || "";
  const loading = options.eagerLoad ? "eager" : "lazy";

  const { deviceSizes, path } = imageConfig;
  const allSizes = [...deviceSizes].sort((a, b) => a - b);

  const last = allSizes.length - 1;

  return function (tree: Root) {
    visit(tree, ["image"], node => {
      const image = node as Image;
      const size = sizeImage(image.url, { basepath });
      if (size && size.width && size.height) {
        image.data = image.data || {};
        image.data.hProperties = image.data.hProperties || {};
        if (!image.data.hProperties.width && !image.data.hProperties.height) {
          image.data.hProperties.width = size.width;
          image.data.hProperties.height = size.height;
        }
        image.data.hProperties = {
          decoding: "async",
          loading,
          srcset: allSizes
            .map(
              w =>
                `${path}?url=${encodeURIComponent(image.url)}&w=${w}&q=75 ${w}w`,
            )
            .join(", "),

          ...image.data.hProperties,
        };

        image.url = `/_next/image?url=${encodeURIComponent(image.url)}&w=${
          allSizes[last]
        }&q=75`;
      }
    });
  };
}

export function anchorPostExcerpt(opts?: { returnAnchor?: boolean }) {
  const regex = /<!--(.*?)-->/;
  return function (tree: Root) {
    let index = -1;
    visit(tree, ["html"], node => {
      const html = node as Html;
      if (index === -1 && regex.test(html.value)) {
        const [_, comment] = regex.exec(html.value)!;
        if (comment.trim() === "excerpt") {
          index = tree.children.indexOf(html);
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

        // replaces the whole tree, so the processor's output is the anchor
        return { type: "text", value: anchor } as unknown as Root;
      }
    }
  };
}

export function removeImages(opts?: unknown) {
  return function (tree: Root) {
    return remove(tree, { cascade: false }, node => node.type === "image");
  };
}
