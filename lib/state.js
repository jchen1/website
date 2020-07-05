import { createGlobalState } from "react-hooks-global-state";

const { setGlobalState, getGlobalState, useGlobalState } = createGlobalState({
  ws: null,
  metrics: [],
  activeTab: "Personal",
});

function metricKey(metric) {
  return `${metric.source.major}.${metric.source.minor}.${metric.event}.${metric.time}`;
}

function dedupMetrics(metrics) {
  return metrics.reduce(
    (acc, metric) => {
      const [m, r] = acc;
      const k = metricKey(metric);

      if (!m[k]) {
        m[k] = true;
        r.push(metric);
      }

      return [m, r];
    },
    [{}, []]
  )[1];
}

export function addMetrics(metrics) {
  setGlobalState("metrics", m => dedupMetrics(m.concat(metrics)));
}

export { useGlobalState, getGlobalState };
