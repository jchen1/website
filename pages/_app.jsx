import NProgress from "nprogress";
import Router, { useRouter } from "next/router";
import Head from "next/head";

import "../styles/main.scss";
import "uplot/dist/uPlot.min.css";

import { RootContainer } from "../components/containers";
import Header from "../components/Header";
import Footer from "../components/Footer";

import { BASE_URL, SITE_TITLE, SITE_DESCRIPTION } from "../lib/constants";
import { pageview } from "../lib/gtag";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", (url) => {
  NProgress.done();
  pageview(url);
});
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  return (
    <RootContainer>
      <Head>
        <title key="title">Jeff Chen</title>
        <meta name="twitter:creator" content="@iambald" />
        <meta name="twitter:site" content="@iambald" />
        <meta name="twitter:card" content="summary" />
        <meta name="og:title" property="og:title" content={SITE_TITLE} />
        <meta
          name="og:url"
          property="og:url"
          content={`https://${BASE_URL}${router.asPath}/`}
        />
        <meta
          name="og:description"
          property="og:description"
          content={SITE_DESCRIPTION}
        />;
        <meta
          name="og:image"
          property="og:image"
          content="https://jeffchen.dev/images/profile.jpg"
        />
        <meta name="og:type" property="og:type" content="website" />
      </Head>
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
