import { useEffect, useState } from "react";
import NProgress from "lib/nprogress";
import Router, { useRouter } from "next/router";

import "styles/main.scss";
import { BASE_URL, SITE_TITLE, SITE_DESCRIPTION } from "lib/constants";
import { pageview } from "lib/gtag";

import Header from "components/Header";
import Footer from "components/Footer";
import Meta from "components/Meta";

import BlogContainer from "components/containers/BlogContainer";
import MainContainer from "components/containers/MainContainer";
import { canonicalize } from "lib/util";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", url => {
  NProgress.done();
  pageview(url);
});
Router.events.on("routeChangeError", () => NProgress.done());

// to prevent a strange FOUC, only load transition CSS after the rest of the app has loaded
const transitionStyle =
  "*{-webkit-transition:color .25s ease,background-color .25s ease,fill .25s ease;transition:color .25s ease,background-color .25s ease,fill .25s ease}";

const fullWidthRoutes = ["/metrics"];

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const useFullWidth = fullWidthRoutes.includes(router.pathname);

  const metas = {
    title: SITE_TITLE,
    "twitter:creator": "@iambald",
    "twitter:site": "@iambald",
    "twitter:card": "summary",
    "og:url": `https://${BASE_URL}${canonicalize(router)}`,
    description: SITE_DESCRIPTION,
    "og:image": `https://${BASE_URL}/images/headshot-1200.jpg`,
    "og:type": "website",
    viewport: "width=device-width",
  };
  const Container = useFullWidth ? MainContainer : BlogContainer;
  return (
    <div className="root">
      <Meta {...metas} />
      <Header />
      <Container>
        <Component {...pageProps} />
      </Container>
      <Footer />
      {loaded && <style>{transitionStyle}</style>}
    </div>
  );
}

export default MyApp;
