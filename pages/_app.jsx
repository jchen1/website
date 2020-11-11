import NProgress from "nprogress";
import Router, { useRouter } from "next/router";

import "../styles/main.scss";
import "uplot/dist/uPlot.min.css";

import { RootContainer } from "../components/containers";
import Header from "../components/Header";
import Footer from "../components/Footer";

import { BASE_URL, SITE_TITLE, SITE_DESCRIPTION } from "../lib/constants";
import { pageview } from "../lib/gtag";
import Meta from "../components/Meta";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", url => {
  NProgress.done();
  pageview(url);
});
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const metas = {
    title: SITE_TITLE,
    "twitter:creator": "@iambald",
    "twitter:site": "@iambald",
    "twitter:card": "summary",
    "og:url": `https://${BASE_URL}${router.asPath}`,
    description: SITE_DESCRIPTION,
    "og:image": `https://${BASE_URL}/images/profile.jpg`,
    "og:type": "website",
  };
  return (
    <RootContainer>
      <Meta {...metas} />
      <Header />
      <Component {...pageProps} />
      <Footer />
    </RootContainer>
  );
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp;
