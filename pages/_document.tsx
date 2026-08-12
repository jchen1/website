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
 * has no handlers yet. Capture-phase listeners record what the user did into
 * an ordered journal, then replay it once the app signals hydration via
 * `window.__NEXT_HYDRATED` (a 50ms poll for the first 15s, then an
 * indefinite 500ms slow poll — recorded interactions are never abandoned,
 * they replay whenever hydration eventually completes; a bfcache freeze
 * pauses the poll and can burn the fast window, which only means the restore
 * lands straight on the slow poll):
 *
 * - click: every click whose target is not inside a native-interactive
 *   context (anchors and forms already work in static HTML, and a click in a
 *   <label> is forwarded to its control natively, so all of those must never
 *   be double-fired) is journaled in order and re-dispatched as a fresh
 *   MouseEvent if the element is still connected.
 * - input/change: the value (and text selection) of the form control being
 *   edited — `change` is what a <select> fires, `input` covers the
 *   text-likes. Consecutive edits of one element coalesce into a single
 *   journal entry holding the latest value, but only while no click or ⌘K
 *   has been journaled since that entry: an action record freezes every
 *   entry before it as a snapshot, so edit → click → edit yields two entries
 *   for the element and the click replays against the first value, exactly
 *   as the handlers would have seen it live. On replay each entry puts its
 *   value back if a hydration re-render clobbered it, and dispatches both an
 *   `input` and a `change` event so the framework's controlled state adopts
 *   it whichever event name the component listens on. A `focusout` recorder
 *   marks the entry that was current when the user left the element; replay
 *   follows a marked entry with `focusout` + `blur` (unless the element is
 *   focused again) so commit-on-blur components run their commit path.
 * - ⌘K/^K: has to be separate from activation — a physical ⌘K emits a
 *   keydown for the modifier first, so the modifier activates and the K
 *   keystroke lands in the gap. Each ⌘K in the gap is preventDefault-ed and
 *   held (key repeats keep being suppressed but don't update the replay);
 *   the last one is replayed as a fresh KeyboardEvent, after everything
 *   else in the journal. When the fast poll window ends, ⌘K stops being
 *   intercepted so the browser's native shortcut works again, but a held
 *   replay still fires when hydration completes.
 *
 * Replay is sequential: one journal entry per step, with a gap between steps
 * (and before the first) so each dispatched event's state updates —
 * including effects, which preact flushes after the next frame — settle
 * before the next entry fires against them. The gap is a double rAF while
 * the document is visible; rAF suspends in hidden tabs, so a hidden document
 * gets a ~2-frame timeout instead, and a 250ms backstop timer covers a tab
 * hidden between scheduling and the frames arriving — whichever fires first
 * wins, so replay always drains even in the background.
 *
 * The recorders stay attached until the replay backlog fully drains, not
 * merely until hydration: a real event landing mid-replay is journaled (and
 * stopped from propagating, so live handlers don't see it out of order) and
 * replays after the backlog, preserving the total order the user produced.
 * Mid-replay edits never coalesce — splicing around the replay cursor could
 * corrupt it — and a mid-replay blur only marks (and suppresses) when its
 * entry has not replayed yet. Everything detaches once hydration is set and
 * the journal is empty; replayed events themselves are skipped by the
 * recorders via a dispatch flag, so nothing is journaled twice. Replayed
 * events carry no user activation, so gated APIs (clipboard, fullscreen,
 * popups) invoked by a replayed handler may reject.
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

  var pendingKey = null;
  var journal = [];
  var poll = 0;
  var seq = 0;
  var lastAction = 0;
  var replaying = 0;
  var replayIndex = 0;
  var dispatching = 0;

  function removeCaptureListeners() {
    removeEventListener("keydown", onKeyDown, true);
    removeEventListener("click", onClick, true);
    removeEventListener("input", onEdit, true);
    removeEventListener("change", onEdit, true);
    removeEventListener("focusout", onFocusOut, true);
  }

  // 0 = journal (pre-hydration), 1 = journal + suppress (hydrated, but the
  // replay backlog has not drained — a live event must not race it),
  // 2 = live (nothing left to replay; the recorders detach and stand aside).
  function recorderState() {
    if (!window.__NEXT_HYDRATED) return 0;
    if (replaying || journal.length || pendingKey) return 1;
    removeCaptureListeners();
    return 2;
  }

  function gap(fn) {
    var fired = 0;
    function run() {
      if (fired) return;
      fired = 1;
      fn();
    }
    if (document.hidden || !window.requestAnimationFrame) {
      setTimeout(run, 32);
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(run);
    });
    setTimeout(run, 250);
  }

  function replayRecord(rec) {
    if (!rec.el.isConnected) return;
    dispatching = 1;
    try {
      if (rec.kind === "click") {
        rec.el.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true })
        );
        return;
      }
      if (rec.el.value !== rec.value) {
        rec.el.value = rec.value;
        if (rec.start != null) {
          try {
            rec.el.setSelectionRange(rec.start, rec.end);
          } catch (err) {}
        }
      }
      rec.el.dispatchEvent(new Event("input", { bubbles: true }));
      rec.el.dispatchEvent(new Event("change", { bubbles: true }));
      if (rec.blurred && document.activeElement !== rec.el) {
        rec.el.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
        rec.el.dispatchEvent(new FocusEvent("blur"));
      }
    } finally {
      dispatching = 0;
    }
  }

  function replay() {
    replaying = 1;
    replayIndex = 0;
    function step() {
      if (replayIndex < journal.length) {
        replayRecord(journal[replayIndex++]);
        gap(step);
        return;
      }
      if (pendingKey) {
        var k = pendingKey;
        pendingKey = null;
        dispatching = 1;
        try {
          document.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: k.key,
              metaKey: k.meta,
              ctrlKey: k.ctrl,
              bubbles: true,
              cancelable: true,
            })
          );
        } finally {
          dispatching = 0;
        }
        if (replayIndex < journal.length) {
          gap(step);
          return;
        }
      }
      journal = [];
      replaying = 0;
      removeCaptureListeners();
    }
    gap(step);
  }

  function ensurePoll() {
    if (poll) return;
    var t0 = Date.now();
    function tick() {
      if (window.__NEXT_HYDRATED) {
        clearInterval(poll);
        poll = 0;
        replay();
      } else if (!gaveUp && Date.now() - t0 > 15e3) {
        gaveUp = 1;
        clearInterval(poll);
        poll = setInterval(tick, 500);
      }
    }
    poll = setInterval(tick, 50);
  }

  function onClick(e) {
    if (dispatching) return;
    var state = recorderState();
    if (state === 2) return;
    var el = e.target;
    if (
      !el || !el.closest ||
      el.closest("a, form, label, input, select, textarea, [type=submit]")
    ) {
      return;
    }
    if (state === 1) e.stopPropagation();
    journal.push({ kind: "click", el: el, seq: ++seq });
    lastAction = seq;
    if (state === 0) ensurePoll();
  }

  function onEdit(e) {
    if (dispatching) return;
    var state = recorderState();
    if (state === 2) return;
    var el = e.target;
    var tag = el && el.tagName;
    if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") return;
    if (state === 1) e.stopPropagation();
    var rec = null;
    if (state === 0) {
      for (var i = journal.length - 1; i >= 0; i--) {
        if (journal[i].kind === "edit" && journal[i].el === el) {
          if (journal[i].seq > lastAction) rec = journal.splice(i, 1)[0];
          break;
        }
      }
    }
    if (!rec) rec = { kind: "edit", el: el, blurred: 0 };
    rec.seq = ++seq;
    journal.push(rec);
    rec.value = el.value;
    rec.start = null;
    rec.end = null;
    try {
      if (typeof el.selectionStart === "number") {
        rec.start = el.selectionStart;
        rec.end = el.selectionEnd;
      }
    } catch (err) {}
    if (state === 0) ensurePoll();
  }

  function onFocusOut(e) {
    if (dispatching) return;
    var state = recorderState();
    if (state === 2) return;
    for (var i = journal.length - 1; i >= 0; i--) {
      if (journal[i].kind === "edit" && journal[i].el === e.target) {
        if (state === 0 || i >= replayIndex) {
          journal[i].blurred = 1;
          if (state === 1) e.stopPropagation();
        }
        break;
      }
    }
  }

  function onKeyDown(e) {
    if (dispatching) return;
    var state = recorderState();
    if (state === 2) return;
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      if (state === 0 && gaveUp) return;
      e.preventDefault();
      if (state === 1) e.stopPropagation();
      if (state === 0) ensurePoll();
      if (e.repeat) return;
      pendingKey = { key: e.key, meta: e.metaKey, ctrl: e.ctrlKey };
      lastAction = ++seq;
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
  addEventListener("input", onEdit, true);
  addEventListener("change", onEdit, true);
  addEventListener("focusout", onFocusOut, true);

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
            href="/fonts/Inter-Var.b95cd252.woff2"
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
