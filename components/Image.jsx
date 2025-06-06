// stripped-down next/image, only supports responsive and fixed layout
import Head from "next/head";

const { deviceSizes, imageSizes, path } = process.env.__NEXT_IMAGE_OPTS;

// sort smallest to largest
const allSizes = [...deviceSizes, ...imageSizes].sort((a, b) => a - b);

function closestSize(w) {
  return allSizes.find(p => p >= w) || allSizes[allSizes.length - 1];
}

function getWidths(width, layout) {
  if (layout === "responsive") {
    return { widths: deviceSizes, kind: "w" };
  }

  width = parseInt(width, 10);
  const widths = [...new Set([width, width * 2, width * 3].map(closestSize))];
  return { widths, kind: "x" };
}

function loader({ src, unoptimized, width, quality }) {
  if (unoptimized) {
    return src;
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

function generateImgAttrs({
  src,
  layout,
  width,
  quality,
  viewportWidthMultiplier,
}) {
  const { widths, kind } = getWidths(width, layout);
  const last = widths.length - 1;
  const srcSet = widths.map(
    (w, i) =>
      `${loader({
        src,
        quality,
        width: closestSize(w * viewportWidthMultiplier),
      })} ${kind === "w" ? w : i + 1}${kind}`
  );

  src = loader({ src, quality, width: widths[last] });

  return { src, srcSet, decoding: "async" };
}

export default function Image({
  src,
  priority = false,
  layout = "responsive",
  className,
  quality,
  width,
  height,
  viewportWidthMultiplier = 1,
  ...rest
}) {
  if (process.env.NODE_ENV !== "production") {
    const VALID_LAYOUT_VALUES = ["responsive", "fixed"];

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
    if (!height || !width) {
      throw new Error(
        `Image with src ${src} is missing height (${height}) or width (${width}).`
      );
    }
  }

  const unoptimized = src.startsWith("data:");
  const isLazy = !priority && !unoptimized;

  const imgAttributes = generateImgAttrs({
    src,
    unoptimized,
    layout,
    width,
    quality,
    viewportWidthMultiplier,
  });

  const wrapperStyle = {
    // overflow: "hidden",
    position: "relative",
  };

  const quotient = parseInt(height, 10) / parseInt(width, 10);
  const sizerStyle = {
    paddingTop: isNaN(quotient) ? "100%" : `${quotient * 100}%`,
  };

  return (
    <div style={wrapperStyle}>
      {!isLazy && (
        <Head>
          <link
            rel="preload"
            as="image"
            href={imgAttributes.src}
            key={src}
            imageSrcSet={imgAttributes.srcSet}
          />
        </Head>
      )}
      {sizerStyle && <div style={sizerStyle} />}
      <img
        {...rest}
        {...imgAttributes}
        loading={isLazy ? "lazy" : "eager"}
        className={className}
        style={{
          position: "absolute",
          height: 0,
          width: 0,
          minWidth: "100%",
          maxWidth: "100%",
          minHeight: "100%",
          maxHeight: "100%",
          left: 0,
          top: 0,
        }}
      />
    </div>
  );
}
