// stripped-down next/image, only supports responsive and fixed layout
import Head from "next/head";

import { deviceSizes, imageSizes, path } from "lib/imageConfig";

import type { ComponentProps } from "react";

// Hostnames the optimizer is allowed to fetch from; unset here, so remote
// sources are rejected by the development-only validation in `loader`.
declare const configDomains: string[] | undefined;

export type ImageLayout = "responsive" | "fixed";

type Dimension = number | string;

// sort smallest to largest
const allSizes = [...deviceSizes, ...imageSizes].sort((a, b) => a - b);

function closestSize(w: number) {
  return allSizes.find(p => p >= w) || allSizes[allSizes.length - 1];
}

function getWidths(width: Dimension | undefined, layout: ImageLayout) {
  if (layout === "responsive") {
    return { widths: deviceSizes, kind: "w" };
  }

  width = parseInt(width as string, 10);
  const widths = [...new Set([width, width * 2, width * 3].map(closestSize))];
  return { widths, kind: "x" };
}

interface LoaderOptions {
  src: string;
  unoptimized?: boolean;
  width?: number;
  quality?: number;
}

function loader({ src, unoptimized, width, quality }: LoaderOptions) {
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
          ", ",
        )} to be provided. Make sure you pass them as props to the \`next/image\` component. Received: ${JSON.stringify(
          { src, width, quality },
        )}`,
      );
    }

    if (src.startsWith("//")) {
      throw new Error(
        `Failed to parse src "${src}" on \`next/image\`, protocol-relative URL (//) must be changed to an absolute URL (http:// or https://)`,
      );
    }

    if (!src.startsWith("/") && configDomains) {
      let parsedSrc;
      try {
        parsedSrc = new URL(src);
      } catch (err) {
        console.error(err);
        throw new Error(
          `Failed to parse src "${src}" on \`next/image\`, if using relative image it must start with a leading slash "/" or be an absolute URL (http:// or https://)`,
        );
      }

      if (!configDomains.includes(parsedSrc.hostname)) {
        throw new Error(
          `Invalid src prop (${src}) on \`next/image\`, hostname "${parsedSrc.hostname}" is not configured under images in your \`next.config.js\`\n` +
            `See more info: https://err.sh/next.js/next-image-unconfigured-host`,
        );
      }
    }
  }

  return `${path}?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}

interface ImgAttrsOptions {
  src: string;
  unoptimized?: boolean;
  layout: ImageLayout;
  width?: Dimension;
  quality?: number;
}

function generateImgAttrs({ src, layout, width, quality }: ImgAttrsOptions) {
  const { widths, kind } = getWidths(width, layout);
  const last = widths.length - 1;
  const srcSet = widths.map(
    (w, i) =>
      `${loader({ src, quality, width: w })} ${
        kind === "w" ? w : i + 1
      }${kind}`,
  );

  src = loader({ src, quality, width: widths[last] });

  return {
    src,
    // an array stringifies to the comma-separated srcset attribute value
    srcSet: srcSet as unknown as string,
    decoding: "async" as const,
  };
}

export interface ImageProps extends Omit<
  ComponentProps<"img">,
  "src" | "width" | "height" | "loading" | "srcSet" | "decoding" | "style"
> {
  src: string;
  /** dev-time validation throws when width or height is missing */
  width?: Dimension;
  height?: Dimension;
  layout?: ImageLayout;
  priority?: boolean;
  quality?: number;
  /**
   * rendered width the image occupies, e.g. "(max-width: 780px) 100vw, 720px";
   * without it browsers assume a w-descriptor srcset spans 100vw
   */
  sizes?: string;
  className?: string;
}

export default function Image({
  src,
  priority = false,
  layout = "responsive",
  className,
  quality,
  width,
  height,
  sizes,
  ...rest
}: ImageProps) {
  if (process.env.NODE_ENV !== "production") {
    const VALID_LAYOUT_VALUES = ["responsive", "fixed"];

    if (!src) {
      throw new Error(
        `Image is missing required "src" property. Make sure you pass "src" in props to the \`next/image\` component. Received: ${JSON.stringify(
          { width, height, quality },
        )}`,
      );
    }
    if (!VALID_LAYOUT_VALUES.includes(layout)) {
      throw new Error(
        `Image with src "${src}" has invalid "layout" property. Provided "${layout}" should be one of ${VALID_LAYOUT_VALUES.map(
          String,
        ).join(",")}.`,
      );
    }
    if (!height || !width) {
      throw new Error(
        `Image with src ${src} is missing height (${height}) or width (${width}).`,
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
  });

  const wrapperStyle = {
    // overflow: "hidden",
    position: "relative" as const,
  };

  const quotient =
    parseInt(height as string, 10) / parseInt(width as string, 10);
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
            imageSizes={sizes}
          />
        </Head>
      )}
      {sizerStyle && <div style={sizerStyle} />}
      <img
        {...rest}
        {...imgAttributes}
        sizes={sizes}
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
