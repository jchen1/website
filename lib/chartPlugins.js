import moment from "moment";

const typesToDisplay = {
  unix: d => moment(new Date(d * 1000)).format("h:mm:ss A"),
};

function typeToDisplay(type, data) {
  const fn = typesToDisplay[type] || (x => x);
  return fn(data);
}

export function tooltipsPlugin(tooltipOpts = {}) {
  const xFormatter = tooltipOpts.xFormatter || (x => typeToDisplay("unix", x));
  const yFormatter = tooltipOpts.yFormatter || (x => x);

  function init(u, opts, data) {
    const plot = u.root.querySelector(".over");

    u.seriestt = opts.series.map((s, i) => {
      if (i == 0) return;

      const tt = document.createElement("div");
      tt.className = "tooltip";
      tt.textContent = "Tooltip!";
      tt.style.pointerEvents = "none";
      tt.style.position = "absolute";
      tt.style.background = "rgba(0,0,0,0.1)";
      tt.style.color = s.color;
      tt.style.display = s.show ? null : "none";
      plot.appendChild(tt);
      return tt;
    });

    function hideTips() {
      u.seriestt.forEach((tt, i) => {
        if (i == 0) return;

        tt.style.display = "none";
      });
    }

    function showTips() {
      u.seriestt.forEach((tt, i) => {
        if (i == 0) return;

        const s = u.series[i];
        tt.style.display = s.show ? null : "none";
      });
    }

    plot.addEventListener("mouseleave", () => {
      if (!u.cursor.locked) {
        hideTips();
      }
    });

    plot.addEventListener("mouseenter", () => {
      showTips();
    });

    hideTips();
  }

  function setCursor(u) {
    const { idx } = u.cursor;

    // can optimize further by not applying styles if idx did not change
    u.seriestt.forEach((tt, i) => {
      if (i == 0) return;

      const s = u.series[i];

      if (s.show) {
        const xVal = u.data[0][idx];
        const yVal = u.data[i][idx];

        tt.textContent = `${xFormatter(xVal)}, ${yFormatter(yVal)}`;

        tt.style.left = Math.round(u.valToPos(xVal, "x")) + "px";
        tt.style.top = Math.round(u.valToPos(yVal, s.scale)) + "px";
      }
    });
  }

  return {
    hooks: {
      init,
      setCursor,
    },
  };
}
