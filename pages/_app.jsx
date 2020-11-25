import NProgress from "nprogress";
import Router, { useRouter } from "next/router";

import "styles/main.scss";
import "uplot/dist/uPlot.min.css";

import RootContainer from "../components/containers/RootContainer";
import Header from "../components/Header";
import Footer from "../components/Footer";

import { BASE_URL, SITE_TITLE, SITE_DESCRIPTION } from "../lib/constants";
import { pageview } from "../lib/gtag";
import Meta from "../components/Meta";
import { useEffect, useState } from "react";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", url => {
  NProgress.done();
  pageview(url);
});
Router.events.on("routeChangeError", () => NProgress.done());

// to prevent a strange FOUC, only load transition CSS after the rest of the app has loaded
const transitionStyle =
  "*{-webkit-transition:color .25s ease,background-color .25s ease,fill .25s ease;transition:color .25s ease,background-color .25s ease,fill .25s ease}";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const metas = {
    title: SITE_TITLE,
    "twitter:creator": "@iambald",
    "twitter:site": "@iambald",
    "twitter:card": "summary",
    "og:url": `https://${BASE_URL}${router.asPath}`,
    description: SITE_DESCRIPTION,
    "og:image": `https://${BASE_URL}/images/headshot-1200.jpg`,
    "og:type": "website",
  };
  return (
    <div className="root">
      <Meta {...metas} />
      <Header />
      <RootContainer>
        <Component {...pageProps} />
      </RootContainer>
      <Footer />
      {loaded && <style>{transitionStyle}</style>}
    </div>
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
