import React from "react";

import LinePlot from "./plots/LinePlot";
import GithubPlot from "./plots/GithubPlot";
import LatestPlot from "./plots/LatestPlot";

import styles from "styles/components/Plot.module.scss";

import type { ComponentType } from "react";
import type { PlotConfig } from "../lib/metrics";
import type { SeriesData } from "../lib/metricsUtils";

export interface PlotProps {
  type?: PlotConfig["plotType"];
  title?: string;
  data: SeriesData;
  opts?: PlotConfig;
}

export default function Plot(props: PlotProps) {
  const { type, title, opts } = props;

  const Element: ComponentType<PlotProps> = (() => {
    switch (type) {
      case "line":
        return LinePlot;
      case "github":
        return GithubPlot;
      case "latest":
        return LatestPlot;
      default:
        return LinePlot;
    }
  })();

  if (opts?.noContainer === true) {
    return <Element {...props} />;
  }

  return (
    <div className={styles.container}>
      <h3>{title || opts?.datatypes[0]}</h3>
      <Element {...props} />
    </div>
  );
}
