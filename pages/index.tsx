import React from "react";

import IndexPageComponent, * as IndexPage from "./[page]";

export default function Home(props) {
  return <IndexPageComponent {...props} />;
}

export async function getStaticProps() {
  return IndexPage.getStaticProps({ params: { page: "1" } });
}
