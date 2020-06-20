import moment from "moment";

import placement from "./placement.ts";
import { prettifyData } from "./util";

const typesToDisplay = {
  unixSecs: d => moment(new Date(d * 1000)).format("h:mm A"),
  unixDays: d => moment(new Date(d * 1000)).format("MM/DD"),
};

function typeToDisplay(type, data) {
  const fn = typesToDisplay[type] || (x => x);
  return fn(data);
}

export function tooltipsPlugin(tooltipOpts = {}) {
  const xFormatter =
    tooltipOpts.xFormatter ||
    (x => typeToDisplay(tooltipOpts.xType || "unixSecs", x));

  const yFormatter =
    tooltipOpts.yFormatter ||
    (x => prettifyData(x, tooltipOpts.yPrecision || 2));

  let bound, bLeft, bTop, overlay;

  return {
    hooks: {
      init: u => {
        let can = u.root.querySelector(".over");
        overlay = document.querySelector(".placement-overlay");
        if (overlay === null) {
          overlay = document.createElement("div");
          overlay.className = "placement-overlay";
          overlay.style.display = "none";
          document.body.appendChild(overlay);
        }

        bound = can;

        can.onmouseenter = () => {
          overlay.style.display = "block";
        };

        can.onmouseleave = () => {
          overlay.style.display = "none";
        };

        let bbox = can.getBoundingClientRect();
        bLeft = bbox.left;
        bTop = bbox.top;
      },
      setCursor: u => {
        const { idx } = u.cursor;
        const x = u.data[0][idx];
        const y = u.data[1][idx];
        if (x && y && overlay) {
          const left = Math.round(u.valToPos(x, "x"));
          const top = Math.round(u.valToPos(y, u.series[1].scale));
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
