// stripped-down next/image, only supports responsive and fixed layout
import React from "react";
import { useIntersection } from "./useIntersection";

const { deviceSizes, imageSizes, path } = process.env.__NEXT_IMAGE_OPTS;

// sort smallest to largest
const allSizes = [...deviceSizes, ...imageSizes].sort((a, b) => a - b);

function getWidths(width, layout) {
  if (typeof width !== "number" || layout === "responsive") {
    return { widths: deviceSizes, kind: "w" };
  }
  const widths = [
    ...new Set(
      [width, width * 2, width * 3].map(
        w => allSizes.find(p => p >= w) || allSizes[allSizes.length - 1]
      )
    ),
  ];
  return { widths, kind: "x" };
}

function loader({ src, unoptimized, width, quality }) {
  if (unoptimized) {
    return { src };
  }
  if (process.env.NODE_ENV !== "production") {
    const missingValues = [];

    // these should always be provided but make sure they are
    if (!src) missingValues.push("src");
    if (!width) missingValues.push("width");

    if (missingValues.length > 0) {
      throw new Error(
        `Next Image Optimization requires ${missingValues.join(
          ", "
        )} to be provided. Make sure you pass them as props to the \`next/image\` component. Received: ${JSON.stringify(
          { src, width, quality }
        )}`
      );
    }

    if (src.startsWith("//")) {
      throw new Error(
        `Failed to parse src "${src}" on \`next/image\`, protocol-relative URL (//) must be changed to an absolute URL (http:// or https://)`
      );
    }

    if (!src.startsWith("/") && configDomains) {
      let parsedSrc;
      try {
        parsedSrc = new URL(src);
      } catch (err) {
        console.error(err);
        throw new Error(
          `Failed to parse src "${src}" on \`next/image\`, if using relative image it must start with a leading slash "/" or be an absolute URL (http:// or https://)`
        );
      }

      if (!configDomains.includes(parsedSrc.hostname)) {
        throw new Error(
          `Invalid src prop (${src}) on \`next/image\`, hostname "${parsedSrc.hostname}" is not configured under images in your \`next.config.js\`\n` +
            `See more info: https://err.sh/next.js/next-image-unconfigured-host`
        );
      }
    }
  }

  return `${path}?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}

//
function generateImgAttrs({ src, layout, width, quality, sizes }) {
  const { widths, kind } = getWidths(width, layout);
  const last = widths.length - 1;
  const srcSet = widths.map(
    (w, i) =>
      `${loader({ src, quality, width: w })} ${kind === "w" ? w : i + 1}${kind}`
  );
  if (!sizes && kind === "w") {
    sizes = widths
      .map((w, i) => (i === last ? `${w}px` : `(max-width: ${w}px) ${w}px`))
      .join(", ");
  }

  src = loader({ src, quality, width: widths[last] });
  return { src, sizes, srcSet };
}

export default function Image({
  src,
  sizes,
  priority = false,
  loading = "lazy",
  className,
  quality,
  width,
  height,
  ...all
}) {
  let rest = all;
  let layout = "responsive";
  if ("layout" in rest) {
    layout = rest.layout;
    delete rest["layout"];
  }

  if (process.env.NODE_ENV !== "production") {
    const VALID_LAYOUT_VALUES = ["responsive", "fixed"];
    const VALID_LOADING_VALUES = ["eager", "lazy"];

    if (!src) {
      throw new Error(
        `Image is missing required "src" property. Make sure you pass "src" in props to the \`next/image\` component. Received: ${JSON.stringify(
          { width, height, quality }
        )}`
      );
    }
    if (!VALID_LAYOUT_VALUES.includes(layout)) {
      throw new Error(
        `Image with src "${src}" has invalid "layout" property. Provided "${layout}" should be one of ${VALID_LAYOUT_VALUES.map(
          String
        ).join(",")}.`
      );
    }
    if (!VALID_LOADING_VALUES.includes(loading)) {
      throw new Error(
        `Image with src "${src}" has invalid "loading" property. Provided "${loading}" should be one of ${VALID_LOADING_VALUES.map(
          String
        ).join(",")}.`
      );
    }
    if (priority && loading === "lazy") {
      throw new Error(
        `Image with src "${src}" has both "priority" and "loading='lazy'" properties. Only one should be used.`
      );
    }
  }

  const unoptimized = src.startsWith("data:");
  const isLazy = !priority && loading === "lazy" && !unoptimized;

  const [setRef, isIntersected] = useIntersection({
    rootMargin: "200px",
    disabled: !isLazy,
  });
  const isVisible = !isLazy || isIntersected;

  width = parseInt(width, 10);
  height = parseInt(height, 10);
  quality = parseInt(quality, 10);

  let wrapperStyle, sizerStyle;
  let imgStyle = {
    visibility: isVisible ? "visible" : "hidden",

    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,

    boxSizing: "border-box",
    padding: 0,
    border: "none",
    margin: "auto",

    display: "block",
    width: 0,
    height: 0,
    minWidth: "100%",
    maxWidth: "100%",
    minHeight: "100%",
    maxHeight: "100%",
  };

  const quotient = height / width;
  const paddingTop = isNaN(quotient) ? "100%" : `${quotient * 100}%`;
  if (layout === "responsive") {
    // <Image src="i.png" width="100" height="100" layout="responsive" />
    wrapperStyle = {
      display: "block",
      overflow: "hidden",
      position: "relative",

      boxSizing: "border-box",
      margin: 0,
    };
    sizerStyle = { display: "block", boxSizing: "border-box", paddingTop };
  } else if (layout === "fixed") {
    // <Image src="i.png" width="100" height="100" layout="fixed" />
    wrapperStyle = {
      overflow: "hidden",
      boxSizing: "border-box",
      display: "inline-block",
      position: "relative",
      width,
      height,
    };
  }

  let imgAttributes = {
    src:
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  };
  if (isVisible) {
    imgAttributes = generateImgAttrs({
      src,
      unoptimized,
      layout,
      width,
      quality,
      sizes,
    });
  }
  return (
    <div style={wrapperStyle}>
      {sizerStyle && <div style={sizerStyle}></div>}
      <img
        {...rest}
        {...imgAttributes}
        decoding="async"
        className={className}
        ref={setRef}
        style={imgStyle}
      />
    </div>
  );
}
