import Head from "next/head";

import type { Metas } from "lib/types";

// Every meta needs `name`: next/head dedupes same-key metas emitted by both
// _app and a page via the `name` attribute (its React-key dedupe never fires
// under Preact, whose keys lack the `$` prefix it looks for). Open Graph
// metas additionally need `property`, which is how the OG spec identifies
// them.
function meta(key: string, content: string | undefined) {
  return key.startsWith("og:") ? (
    <meta key={key} name={key} property={key} content={content} />
  ) : (
    <meta key={key} name={key} content={content} />
  );
}

export default function Meta(props: Metas) {
  const metas = Object.keys(props)
    .map(key => {
      const val = props[key];
      switch (key) {
        case "title":
          return [<title key={key}>{val}</title>, meta("og:title", val)];
        case "description":
          return [meta("description", val), meta("og:description", val)];
        default:
          return meta(key, val);
      }
    })
    .flat();

  return <Head>{metas}</Head>;
}
