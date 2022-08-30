export function prettifyData(data, precision = 2) {
  return isNaN(data) ? data : +data.toFixed(precision);
}

export function last(arr, def = null) {
  return arr.length > 0 ? arr[arr.length - 1] : def;
}

export function transformEvents(events, types, opts = {}) {
  const mapper = opts.mapper || (x => x);
  const reducer = opts.reducer;

  if (opts.reducer) {
    return reducer(events.filter(e => types.includes(e.event)));
  }

  return events.reduce(
    (acc, e) => {
      if (types.includes(e.event)) {
        const { time, data } = e;
        const val = mapper(data);
        if (typeof val === "number") {
          acc[0].push(new Date(time).getTime() / 1000);
          acc[1].push(mapper(data));
        }
      }

      return acc;
    },
    [[], []]
  );
}

export function frequencies(metrics, keyFn) {
  const fs = metrics.reduce((acc, metric) => {
    const key = keyFn(metric);
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key]++;
    return acc;
  }, {});

  return Object.keys(fs)
    .sort()
    .reduce(
      (acc, k) => {
        acc[0].push(parseFloat(k));
        acc[1].push(fs[k]);

        return acc;
      },
      [[], []]
    );
}
