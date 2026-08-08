import styles from "styles/components/LatestPlot.module.scss";

import { formatDateTime } from "../../lib/util/dateFormat";

import type { PlotConfig } from "../../lib/metrics";
import type { SeriesData } from "../../lib/metricsUtils";

interface LatestPlotProps {
  data: SeriesData;
  title?: string;
  opts?: PlotConfig;
}

export default function LatestPlot({ data, title, opts }: LatestPlotProps) {
  const maxIndex = data[0].indexOf(Math.max.apply(Math, data[0]));
  const latestMeasurement = new Date(data[0][maxIndex] * 1000);
  const currentValue = data[1][maxIndex];

  return (
    <div className={styles.container}>
      <div className={styles.square}>
        <div className={styles.innerContainer}>
          <p className={styles.dataHeading}>{title}</p>
          <svg
            className={styles.data}
            viewBox="0 0 500 200"
            preserveAspectRatio="xMinYMin"
          >
            <text
              y="50%"
              textAnchor="left"
              fontSize="100px"
              alignmentBaseline="central"
              dominantBaseline="central"
            >
              {typeof currentValue === "number"
                ? Math.round(currentValue * 100) / 100
                : currentValue}{" "}
              {opts?.unit}
            </text>
          </svg>
          <p className={styles.dataTime}>{formatDateTime(latestMeasurement)}</p>
        </div>
      </div>
    </div>
  );
}
