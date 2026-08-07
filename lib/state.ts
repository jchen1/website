import { createGlobalState } from "react-hooks-global-state";

import type { MetricEvent } from "./types";

interface GlobalState {
  ws: WebSocket | null;
  metrics: MetricEvent[];
  activeTab: string;
}

const { setGlobalState, getGlobalState, useGlobalState } =
  createGlobalState<GlobalState>({
    ws: null,
    metrics: [],
    activeTab: "Personal",
  });

function metricKey(metric: MetricEvent) {
  return `${metric.source.major}.${metric.source.minor}.${metric.event}.${metric.time}`;
}

function dedupMetrics(metrics: MetricEvent[]) {
  return metrics.reduce<[Record<string, boolean>, MetricEvent[]]>(
    (acc, metric) => {
      const [m, r] = acc;
      const k = metricKey(metric);

      if (!m[k]) {
        m[k] = true;
        r.push(metric);
      }

      return [m, r];
    },
    [{}, []],
  )[1];
}

export function addMetrics(metrics: MetricEvent[]) {
  setGlobalState("metrics", m => dedupMetrics(m.concat(metrics)));
}

export { useGlobalState, getGlobalState };
