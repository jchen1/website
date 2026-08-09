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
 * fetches the Next runtime on the first user input (pointer, click, key,
 * focus, form input, touch, scroll) or on idle (~3s cap). Activation walks
 * the `script[data-src]` placeholders in document order and appends a real
 * `<script>` for each with its preserved attributes; `.async = false` is
 * required because dynamically created scripts are async by default and the
 * chunks must execute in order. The `nonce` IDL property is copied
 * explicitly: a header-delivered CSP nonce is hidden from the content
 * attribute, so the attribute-copying loop misses it. (Under a real CSP this
 * inline activator would itself need a nonce; no CSP exists today.)
 *
 * Pages whose body is inserted by an effect (`[data-eager-hydrate]`, see the
 * InnerHTML helper in components/BlogPost.tsx) render an empty shell until
 * the runtime executes, so deferral only hurts there: the activator fires
 * immediately instead of arming listeners and the idle callback.
 *
 * Between the first interaction and hydration there is a gap where the page
 * has no handlers yet. Three capture-phase listeners live until hydration and
 * record what the user did, then replay it once the app signals hydration via
 * `window.__NEXT_HYDRATED` (polled at 50ms, up to 15s):
 *
 * - click: the most recent click whose target is not inside a
 *   native-interactive context (anchors and forms already work in static
 *   HTML and must never be double-fired) is re-dispatched as a fresh
 *   MouseEvent if the element is still connected.
 * - input: the last value (and text selection) of each form control the user
 *   edited. On replay the value is put back if a hydration re-render
 *   clobbered it, and an `input` event is dispatched either way so the
 *   framework's controlled-input state adopts what the user typed.
 * - ⌘K/^K: has to be separate from activation — a physical ⌘K emits a
 *   keydown for the modifier first, so the modifier activates and the K
 *   keystroke lands in the gap. Each ⌘K in the gap is preventDefault-ed and
 *   held (key repeats keep being suppressed but don't update the replay);
 *   the last one is replayed as a fresh KeyboardEvent. If the poll times
 *   out, ⌘K stops being intercepted so the browser's native shortcut works
 *   again.
 *
 * A `pageshow` from the bfcache re-arms the idle timer when the page returns
 * not yet activated; arm() cancels any pending idle callback first so
 * repeated re-arms never stack.
 */
const ACTIVATOR = `(function () {
  var done = 0;
  var idle = 0;
  var gaveUp = 0;
  var activationEvents = [
    "pointermove", "pointerdown", "click", "keydown",
    "touchstart", "scroll", "focusin", "input",
  ];

  function inject() {
    var placeholders = document.querySelectorAll('script[data-src^="/_next/"]');
    for (var i = 0; i < placeholders.length; i++) {
      var s = placeholders[i];
      var t = document.createElement("script");
      for (var j = 0; j < s.attributes.length; j++) {
        var a = s.attributes[j];
        if (a.name !== "data-src") t.setAttribute(a.name, a.value);
      }
      if (s.nonce) t.nonce = s.nonce;
      t.src = s.getAttribute("data-src");
      t.async = false;
      document.body.appendChild(t);
    }
  }

  function cancelIdle() {
    if (idle) {
      (window.cancelIdleCallback || clearTimeout)(idle);
      idle = 0;
    }
  }

  function activate() {
    if (done) return;
    done = 1;
    for (var i = 0; i < activationEvents.length; i++) {
      removeEventListener(activationEvents[i], activate, true);
    }
    cancelIdle();
    inject();
  }

  var pendingClick = null;
  var pendingKey = null;
  var edits = [];
  var poll = 0;

  function removeCaptureListeners() {
    removeEventListener("keydown", onKeyDown, true);
    removeEventListener("click", onClick, true);
    removeEventListener("input", onInput, true);
  }

  function replay() {
    for (var i = 0; i < edits.length; i++) {
      var rec = edits[i];
      if (!rec.el.isConnected) continue;
      if (rec.el.value !== rec.value) {
        rec.el.value = rec.value;
        if (rec.start != null) {
          try {
            rec.el.setSelectionRange(rec.start, rec.end);
          } catch (err) {}
        }
      }
      rec.el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (pendingClick && pendingClick.isConnected) {
      pendingClick.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true })
      );
    }
    if (pendingKey) {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: pendingKey.key,
          metaKey: pendingKey.meta,
          ctrlKey: pendingKey.ctrl,
          bubbles: true,
          cancelable: true,
        })
      );
    }
  }

  function ensurePoll() {
    if (poll) return;
    var t0 = Date.now();
    poll = setInterval(function () {
      if (window.__NEXT_HYDRATED) {
        clearInterval(poll);
        removeCaptureListeners();
        replay();
      } else if (Date.now() - t0 > 15e3) {
        clearInterval(poll);
        gaveUp = 1;
      }
    }, 50);
  }

  function onClick(e) {
    if (window.__NEXT_HYDRATED) {
      removeEventListener("click", onClick, true);
      return;
    }
    var el = e.target;
    if (
      el && el.closest &&
      !el.closest("a, form, input, select, textarea, [type=submit]")
    ) {
      pendingClick = el;
      ensurePoll();
    }
  }

  function onInput(e) {
    if (window.__NEXT_HYDRATED) {
      removeEventListener("input", onInput, true);
      return;
    }
    var el = e.target;
    var tag = el && el.tagName;
    if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") return;
    var rec = null;
    for (var i = 0; i < edits.length; i++) {
      if (edits[i].el === el) rec = edits[i];
    }
    if (!rec) {
      rec = { el: el };
      edits.push(rec);
    }
    rec.value = el.value;
    rec.start = null;
    rec.end = null;
    try {
      if (typeof el.selectionStart === "number") {
        rec.start = el.selectionStart;
        rec.end = el.selectionEnd;
      }
    } catch (err) {}
    ensurePoll();
  }

  function onKeyDown(e) {
    if (window.__NEXT_HYDRATED) {
      removeEventListener("keydown", onKeyDown, true);
      return;
    }
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      if (!gaveUp) e.preventDefault();
      if (e.repeat) return;
      pendingKey = { key: e.key, meta: e.metaKey, ctrl: e.ctrlKey };
      ensurePoll();
    }
  }

  function arm() {
    if (done) return;
    cancelIdle();
    if (window.requestIdleCallback) {
      idle = requestIdleCallback(activate, { timeout: 3e3 });
    } else {
      idle = setTimeout(activate, 3e3);
      if (document.readyState === "complete") setTimeout(activate, 0);
      else
        addEventListener("load", function () {
          setTimeout(activate, 0);
        }, { once: true });
    }
  }

  addEventListener("keydown", onKeyDown, true);
  addEventListener("click", onClick, true);
  addEventListener("input", onInput, true);

  if (document.querySelector("[data-eager-hydrate]")) {
    activate();
    return;
  }

  for (var i = 0; i < activationEvents.length; i++) {
    addEventListener(activationEvents[i], activate, true);
  }
  addEventListener("pageshow", function (p) {
    if (p.persisted && !done) arm();
  });
  arm();
})();`;

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
