import { createGlobalState } from "react-hooks-global-state";

const { setGlobalState, useGlobalState } = createGlobalState({
  ws: null,
  frequentMetrics: [],
  infrequentMetrics: [],
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

export function addInfrequentMetrics(metrics) {
  setGlobalState("infrequentMetrics", m => dedupMetrics(m.concat(metrics)));
}

export function addFrequentMetrics(metrics) {
  setGlobalState("frequentMetrics", m => dedupMetrics(m.concat(metrics)));
}

export { useGlobalState };
