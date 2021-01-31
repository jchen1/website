import { join } from "path";
import imageSize from "image-size";

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

// https://github.com/sindresorhus/is-absolute-url/blob/master/index.js
export function isAbsoluteURL(url) {
  if (typeof url !== "string") {
    throw new TypeError(`Expected a \`string\`, got \`${typeof url}\``);
  }

  // Don't match Windows paths `c:\`
  if (/^[a-zA-Z]:\\/.test(url)) {
    return false;
  }

  // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
  // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
}

export function sizeImage(image, opts = {}) {
  // only supports local images with absolute paths
  if (!isAbsoluteURL(image) && image.startsWith("/")) {
    const path = join(process.cwd(), opts.basepath || "", image);
    try {
      return imageSize(path);
    } catch (e) {
      console.warn(`Error getting dimensions for ${image} (path: ${path})!`, e);
    }
  }
}

// replaces all properties of source with those of target
export function replace(source, target) {
  for (const property in source) {
    delete source[property];
  }

  Object.assign(source, target);
}

export function canonicalize(router) {
  return router.asPath.split(/[?#]/)[0];
}
