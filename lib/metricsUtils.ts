import type { MetricEvent } from "./types";

// paired x/y series arrays, the shape uPlot consumes
export type SeriesData = [number[], number[]];

export interface TransformEventsOptions {
  /** payload shape varies per metric type, so `any` is the honest input */
  mapper?: (data: any) => unknown;
  reducer?: (events: MetricEvent[]) => SeriesData;
  allowedMajorSources?: string[];
  allowedMinorSources?: string[];
}

export function prettifyData(data: number, precision?: number): number;
export function prettifyData(data: unknown, precision?: number): unknown;
export function prettifyData(data: unknown, precision = 2) {
  return isNaN(data as number) ? data : +(data as number).toFixed(precision);
}

export function last<T>(arr: T[], def: T | null = null) {
  return arr.length > 0 ? arr[arr.length - 1] : def;
}

export function transformEvents(
  events: MetricEvent[],
  types: string[],
  opts: TransformEventsOptions = {},
): SeriesData {
  const mapper = opts.mapper || (x => x);
  const reducer = opts.reducer;

  const allowedMajorSources = opts.allowedMajorSources;
  const allowedMinorSources = opts.allowedMinorSources;

  if (opts.reducer) {
    return reducer!(events.filter(e => types.includes(e.event)));
  }

  return events.reduce<SeriesData>(
    (acc, e) => {
      if (types.includes(e.event)) {
        const { time, data, source } = e;
        if (
          allowedMajorSources &&
          !allowedMajorSources.includes(source.major)
        ) {
          return acc;
        }

        if (
          allowedMinorSources &&
          !allowedMinorSources.includes(source.minor)
        ) {
          return acc;
        }

        const val = mapper(data);
        if (typeof val === "number") {
          acc[0].push(new Date(time).getTime() / 1000);
          acc[1].push(mapper(data) as number);
        }
      }

      return acc;
    },
    [[], []],
  );
}

export function frequencies(
  metrics: MetricEvent[],
  keyFn: (metric: MetricEvent) => number,
): SeriesData {
  const fs = metrics.reduce<Record<string, number>>((acc, metric) => {
    const key = keyFn(metric);
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key]++;
    return acc;
  }, {});

  return Object.keys(fs)
    .sort()
    .reduce<SeriesData>(
      (acc, k) => {
        acc[0].push(parseFloat(k));
        acc[1].push(fs[k]);

        return acc;
      },
      [[], []],
    );
}
