import Head from "next/head";

export default function Meta(props) {
  const metas = Object.keys(props)
    .map(key => {
      const val = props[key];
      switch (key) {
        case "title":
          return [
            <title key={key}>{val}</title>,
            <meta name="og:title" property="og:title" content={val} />,
          ];
        case "description":
          return [
            <meta name="description" content={val} />,
            <meta
              name="og:description"
              property="og:description"
              content={val}
            />,
          ];
        default:
          return <meta name={key} property={key} content={val} />;
      }
    })
    .flat();

  return <Head>{metas}</Head>;
}
