import NProgress from "nprogress";
import Router from "next/router";

import "../styles/main.scss";
import "uplot/dist/uPlot.min.css";

import { RootContainer } from "../components/containers";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { pageview } from "../lib/gtag";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", url => {
  NProgress.done();
  pageview(url);
});
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }) {
  return (
    <RootContainer>
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
