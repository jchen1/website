// SVG files are compiled to Preact components by @svgr/webpack
declare module "*.svg" {
  import type { FunctionComponent, SVGProps } from "react";

  const SvgComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default SvgComponent;
}

// Sass modules expose their (minified in prod) class names by key
declare module "*.module.scss" {
  const classNames: Record<string, string>;
  export default classNames;
}

// Google Analytics gtag.js, loaded via an inline script in pages/_document
declare interface Window {
  gtag: (
    command: string,
    targetIdOrEventName: string,
    params?: Record<string, unknown>,
  ) => void;
}

declare module "confetti-js" {
  interface ConfettiSettings {
    target?: string | HTMLCanvasElement;
    max?: number;
    size?: number;
    animate?: boolean;
    respawn?: boolean;
    clock?: number;
    props?: unknown[];
    colors?: number[][];
    start_from_edge?: boolean;
    rotate?: boolean;
  }

  export default class ConfettiGenerator {
    constructor(settings: ConfettiSettings);
    render(): void;
    clear(): void;
  }
}

declare module "css-class-generator" {
  function generateName(index: number): string;
  export = generateName;
}

// Preact's LinkHTMLAttributes types imageSrcSet but omits its companion
// imageSizes (both are HTMLLinkElement IDL attributes for preload links)
declare namespace preact.JSX {
  interface LinkHTMLAttributes {
    imageSizes?: string;
  }
}

// Image-optimizer settings shared with next.config.js, authored as CommonJS
declare module "lib/imageConfig" {
  export const deviceSizes: number[];
  export const imageSizes: number[];
  export const path: string;
}
