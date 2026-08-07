import { useCallback, useEffect, useState } from "react";
import NProgress from "lib/nprogress";
import Router, { useRouter } from "next/router";
import type { AppProps } from "next/app";
import type { ComponentType } from "react";
import type { CommandPaletteProps } from "components/CommandPalette";

import "styles/main.scss";
import { BASE_URL, SITE_TITLE, SITE_DESCRIPTION } from "lib/constants";
import { pageview } from "lib/gtag";

import Header from "components/Header";
import Footer from "components/Footer";
import Meta from "components/Meta";

import BlogContainer from "components/containers/BlogContainer";
import MainContainer from "components/containers/MainContainer";
import { canonicalize } from "lib/util";

Router.events.on(
  "routeChangeStart",
  (_: string, { shallow }: { shallow: boolean }) =>
    !shallow && NProgress.start(),
);
Router.events.on(
  "routeChangeComplete",
  (url: string, { shallow }: { shallow: boolean }) => {
    if (!shallow) {
      NProgress.done();
      pageview(url);
    }
  },
);
Router.events.on("routeChangeError", (_: Error) => NProgress.done());

// to prevent a strange FOUC, only load transition CSS after the rest of the app has loaded
const transitionStyle =
  "*{-webkit-transition:color .25s ease,background-color .25s ease,fill .25s ease;transition:color .25s ease,background-color .25s ease,fill .25s ease}";

const fullWidthRoutes = ["/metrics"];

// Warms the palette's async chunk and the search-index fetch cache
function preloadPalette() {
  void import("components/CommandPalette")
    .then(mod => mod.preloadSearchIndex())
    .catch(() => undefined);
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [Palette, setPalette] =
    useState<ComponentType<CommandPaletteProps> | null>(null);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!paletteOpen || Palette) return;
    let cancelled = false;
    import("components/CommandPalette")
      .then(mod => !cancelled && setPalette(() => mod.default))
      .catch((err: unknown) => {
        console.error("Failed to load command palette", err);
        if (!cancelled) setPaletteOpen(false);
      });
    return () => {
      cancelled = true;
    };
  }, [paletteOpen, Palette]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (e.repeat) return;
        setPaletteOpen(open => !open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(preloadPalette);
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(preloadPalette, 2000);
    return () => window.clearTimeout(id);
  }, [loaded]);

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
      <Header onOpenPalette={openPalette} onPreloadPalette={preloadPalette} />
      <Container>
        <Component {...pageProps} />
      </Container>
      <Footer />
      {paletteOpen && Palette && <Palette onClose={closePalette} />}
      {loaded && <style>{transitionStyle}</style>}
    </div>
  );
}

export default MyApp;
