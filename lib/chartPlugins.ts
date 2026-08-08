import styles from "../styles/components/PlacementOverlay.module.scss";
import placement from "./placement";
import { prettifyData } from "./metricsUtils";
import { formatClockTime, formatMonthDay } from "./util/dateFormat";

import type uPlot from "uplot";

const typesToDisplay: Record<string, (d: number) => string> = {
  unixSecs: d => formatClockTime(new Date(d * 1000)),
  unixDays: d => formatMonthDay(new Date(d * 1000)),
};

function typeToDisplay(type: string, data: number) {
  const fn = typesToDisplay[type] || ((x: number) => x);
  return fn(data);
}

function getOrCreateOverlay() {
  const existing = document.querySelector<HTMLElement>(`.${styles.overlay}`);
  if (existing) return existing;

  const overlay = document.createElement("div");
  overlay.className = styles.overlay;
  overlay.style.display = "none";
  (overlay.style as unknown as Record<string, string>)["z-index"] = "999";
  document.body.appendChild(overlay);

  return overlay;
}

export interface TooltipOptions {
  xFormatter?: (x: number) => string | number;
  yFormatter?: (y: number) => string | number;
  xType?: string;
  yPrecision?: number;
  unit?: string;
}

export function tooltipsPlugin(tooltipOpts: TooltipOptions = {}): uPlot.Plugin {
  const xFormatter =
    tooltipOpts.xFormatter ||
    ((x: number) => typeToDisplay(tooltipOpts.xType || "unixSecs", x));

  const yFormatter =
    tooltipOpts.yFormatter ||
    ((x: number) => prettifyData(x, tooltipOpts.yPrecision || 2));

  let bound: HTMLElement, bLeft: number, bTop: number, overlay: HTMLElement;

  return {
    hooks: {
      init: u => {
        const can = u.root.querySelector<HTMLElement>(".u-over")!;
        overlay = getOrCreateOverlay();

        bound = can;

        can.onmouseenter = () => {
          overlay.style.display = "block";
        };

        can.onmouseleave = () => {
          overlay.style.display = "none";
        };

        const bbox = can.getBoundingClientRect();
        bLeft = bbox.left;
        bTop = bbox.top;
      },
      setCursor: u => {
        const { idx } = u.cursor;
        const x = u.data[0][idx!];
        const y = u.data[1][idx!];
        if (x && y && overlay) {
          const left = Math.round(u.valToPos(x, "x"));
          const top = Math.round(u.valToPos(y, u.series[1].scale!));
          const anchor = { left: left + bLeft, top: top + bTop };

          overlay.innerHTML = `${xFormatter(x)}<br> ${yFormatter(y)}${
            tooltipOpts.unit ? tooltipOpts.unit : ""
          }`;

          placement(overlay, anchor, "right", "start", { bound });
        }
      },
    },
  };
}
