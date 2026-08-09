import Document, { Html, Head, Main, NextScript } from "next/document";
import { cloneElement } from "react";

import { GA_TRACKING_ID } from "../lib/gtag";

import type { HTMLAttributeCrossOrigin, ScriptHTMLAttributes } from "react";

// An empty crossorigin attribute selects anonymous mode; the JSX attribute
// type only lists the two explicit keywords.
const ANONYMOUS_CROSSORIGIN = "" as unknown as HTMLAttributeCrossOrigin;

const IS_PROD = process.env.NODE_ENV === "production";

type NextChunkScript = ReturnType<Head["getScripts"]>[number];

/**
 * Rewrites a Next.js chunk `<script src>` into an inert placeholder: the URL
 * moves to `data-src` — the one form the browser's preload scanner ignores —
 * and the loading attributes (`src`, `async`, `defer`) are dropped. Every
 * other attribute (`crossorigin`, `nonce`, ...) stays on the tag so the
 * activator can copy it onto the real script it creates. Inline scripts (no
 * `src`, e.g. `__NEXT_DATA__`) and the `noModule` polyfill bundle — which
 * modern browsers never fetch — pass through untouched.
 */
function toInertScript<T extends NextChunkScript | null>(el: T): T {
  if (!el) return el;
  const props = el.props as ScriptHTMLAttributes<HTMLScriptElement>;
  if (typeof props.src !== "string" || props.noModule) return el;
  return cloneElement(el, {
    src: undefined,
    async: undefined,
    defer: undefined,
    "data-src": props.src,
  } as Partial<typeof props>) as T;
}

/**
 * A `Head` that emits the Next runtime as inert `data-src` placeholders and
 * never emits `<link rel="preload" as="script">` for them. With optimized
 * loading on (the default), Head is where the chunk `<script defer>` tags
 * live and JS preloads are already disabled, so the script overrides are the
 * live path; the preload overrides guard the other configuration, where a
 * surviving preload would silently re-fetch every chunk up front.
 */
class DeferredHead extends Head {
  getPreloadDynamicChunks() {
    return [];
  }
  getPreloadMainLinks() {
    return [];
  }
  getDynamicChunks(files: Parameters<Head["getDynamicChunks"]>[0]) {
    return super.getDynamicChunks(files).map(toInertScript);
  }
  getScripts(files: Parameters<Head["getScripts"]>[0]) {
    return super.getScripts(files).map(toInertScript);
  }
}

/**
 * The body-end counterpart: renders the chunk scripts only when optimized
 * loading is disabled, in which case they get the same inert treatment. The
 * inline `__NEXT_DATA__` JSON it also renders is untouched.
 */
class DeferredNextScript extends NextScript {
  getDynamicChunks(files: Parameters<NextScript["getDynamicChunks"]>[0]) {
    return super.getDynamicChunks(files).map(toInertScript);
  }
  getScripts(files: Parameters<NextScript["getScripts"]>[0]) {
    return super.getScripts(files).map(toInertScript);
  }
}

/**
 * Inline activator: the page arrives as working static HTML, and this script
 * fetches the Next runtime on the first user input (pointer, key, touch,
 * scroll) or on idle (~3s cap). Activation walks the `script[data-src]`
 * placeholders in document order and appends a real `<script>` for each with
 * its preserved attributes; `.async = false` is required because dynamically
 * created scripts are async by default and the chunks must execute in order.
 *
 * Fast path for the command palette: a separate capture listener lives until
 * hydration and watches for ⌘K/^K. It has to be independent of activation —
 * a physical ⌘K emits a keydown for the Meta/Ctrl modifier first, so the
 * modifier keystroke is what activates, and the K keystroke lands in the gap
 * before the app's own handler exists. Any ⌘K seen in that gap is
 * preventDefault-ed, held, and — once the app signals hydration via
 * `window.__NEXT_HYDRATED` (polled at 50ms up to 5s) — replayed as a fresh
 * KeyboardEvent so the palette opens. A `pageshow` from the bfcache re-arms
 * the idle timer when the page returns not yet activated.
 */
const ACTIVATOR = `(function(){var done=0,idle=0,evs=['pointermove','pointerdown','keydown','touchstart','scroll'];function inject(){var l=document.querySelectorAll('script[data-src]');for(var i=0;i<l.length;i++){var s=l[i],t=document.createElement('script');for(var j=0;j<s.attributes.length;j++){var a=s.attributes[j];if(a.name!=='data-src')t.setAttribute(a.name,a.value)}t.src=s.getAttribute('data-src');t.async=false;document.body.appendChild(t)}}function activate(){if(done)return;done=1;for(var i=0;i<evs.length;i++)removeEventListener(evs[i],activate,true);if(idle)(window.cancelIdleCallback||clearTimeout)(idle);inject()}function onKey(e){if(window.__NEXT_HYDRATED){removeEventListener('keydown',onKey,true);return}if((e.metaKey||e.ctrlKey)&&(e.key==='k'||e.key==='K')){e.preventDefault();removeEventListener('keydown',onKey,true);var k=e.key,m=e.metaKey,c=e.ctrlKey,t0=Date.now(),iv=setInterval(function(){if(window.__NEXT_HYDRATED){clearInterval(iv);document.dispatchEvent(new KeyboardEvent('keydown',{key:k,metaKey:m,ctrlKey:c,bubbles:true,cancelable:true}))}else if(Date.now()-t0>5e3)clearInterval(iv)},50)}}function arm(){idle=window.requestIdleCallback?requestIdleCallback(activate,{timeout:3e3}):setTimeout(activate,3e3)}addEventListener('keydown',onKey,true);for(var i=0;i<evs.length;i++)addEventListener(evs[i],activate,true);addEventListener('pageshow',function(p){if(p.persisted&&!done)arm()});arm()})();`;

// Deferral is production-only: dev fast refresh (prefresh) needs the stock
// eagerly-executing scripts.
const DocumentHead = IS_PROD ? DeferredHead : Head;
const DocumentScripts = IS_PROD ? DeferredNextScript : NextScript;

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <DocumentHead>
          <link
            rel="alternate"
            type="application/rss+xml"
            title="RSS feed for blog posts"
            href="https://jeffchen.dev/rss-feed.xml"
          />
          <link
            rel="apple-touch-icon"
            sizes="120x120"
            href="/apple-icon-120x120.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="152x152"
            href="/apple-icon-152x152.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-icon-180x180.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/android-icon-192x192.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="96x96"
            href="/favicon-96x96.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#ffffff" />
          <link
            rel="preload"
            href="/fonts/Inter-Var.woff2"
            as="font"
            crossOrigin={ANONYMOUS_CROSSORIGIN}
          />
        </DocumentHead>
        <body>
          <Main />
          <DocumentScripts />
          {IS_PROD && (
            <script dangerouslySetInnerHTML={{ __html: ACTIVATOR }} />
          )}
        </body>

        {/* Global Site Tag (gtag.js) - Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_TRACKING_ID}',{page_path:window.location.pathname});`,
          }}
        />
      </Html>
    );
  }
}
