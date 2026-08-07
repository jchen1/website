import React from "react";
import type { GetStaticProps } from "next";

import IndexPageComponent, * as IndexPage from "./[page]";
import type { IndexPageProps } from "./[page]";

export default function Home(props: IndexPageProps) {
  return <IndexPageComponent {...props} />;
}

export const getStaticProps: GetStaticProps<IndexPageProps> = async () => {
  return IndexPage.getStaticProps({ params: { page: "1" } });
};
