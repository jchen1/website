import React from "react";

import { Colors } from "../../lib/metrics";

import styles from "styles/components/GithubPlot.module.scss";

import type { SeriesData } from "../../lib/metricsUtils";

function hexPair(value: number): string {
  const hex = Math.round(value * 255).toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function rgbToHex(red: number, green: number, blue: number): string {
  const value = `#${hexPair(red)}${hexPair(green)}${hexPair(blue)}`;
  if (value[1] === value[2] && value[3] === value[4] && value[5] === value[6]) {
    return `#${value[1]}${value[3]}${value[5]}`;
  }
  return value;
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  if (saturation === 0) {
    return rgbToHex(lightness, lightness, lightness);
  }

  const huePrime = (((hue % 360) + 360) % 360) / 60;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));
  let red = 0;
  let green = 0;
  let blue = 0;
  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = secondComponent;
  } else if (huePrime >= 1 && huePrime < 2) {
    red = secondComponent;
    green = chroma;
  } else if (huePrime >= 2 && huePrime < 3) {
    green = chroma;
    blue = secondComponent;
  } else if (huePrime >= 3 && huePrime < 4) {
    green = secondComponent;
    blue = chroma;
  } else if (huePrime >= 4 && huePrime < 5) {
    red = secondComponent;
    blue = chroma;
  } else if (huePrime >= 5 && huePrime < 6) {
    red = chroma;
    blue = secondComponent;
  }

  const lightnessModification = lightness - chroma / 2;
  return rgbToHex(
    red + lightnessModification,
    green + lightnessModification,
    blue + lightnessModification,
  );
}

// Raises a 6-digit hex color's HSL lightness by `amount` (clamped at white)
// and returns the shortest equivalent hex string.
export function lighten(amount: number, color: string): string {
  const red = parseInt(color.slice(1, 3), 16) / 255;
  const green = parseInt(color.slice(3, 5), 16) / 255;
  const blue = parseInt(color.slice(5, 7), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  let hue = 0;
  let saturation = 0;
  if (max !== min) {
    const delta = max - min;
    saturation =
      lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }
    hue *= 60;
  }

  return hslToHex(
    hue,
    saturation,
    Math.max(0, Math.min(1, lightness + amount)),
  );
}

interface GithubPlotProps {
  data: SeriesData;
}

export default function GithubPlot({ data }: GithubPlotProps) {
  data[0] = data[0].map(t => Math.floor(t / 60 / 60 / 24) * 60 * 60 * 24);

  const start = new Date(data[0][0] * 1000);
  const end = new Date(data[0][data[0].length - 1] * 1000);

  const numSquares =
    Math.floor(end.getTime() / 1000 / 60 / 60 / 24) -
    Math.floor(start.getTime() / 1000 / 60 / 60 / 24);

  const max = Math.max(...data[1]);

  // only ever show full rows
  const squares = new Array(numSquares - (numSquares % 7))
    .fill(0)
    .map((_, idx) => {
      const time =
        (start.getTime() + (idx + (numSquares % 7)) * 1000 * 60 * 60 * 24) /
        1000;
      const dataIdx = data[0].indexOf(time);

      const val = dataIdx >= 0 ? data[1][dataIdx] : 0;
      // todo hover tooltips
      return (
        <div
          key={idx}
          className={styles.square}
          style={{ backgroundColor: lighten(val / max, Colors.YELLOW) }}
        />
      );
    });

  return <div className={styles.container}>{squares}</div>;
}
