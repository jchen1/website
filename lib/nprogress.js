/* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
 * @license MIT */

// vendored from https://raw.githubusercontent.com/rstacruz/nprogress/e1a8b7fb6e059085df5f83c45d3c2308a147ca18/nprogress.js
// to reduce the bundle size

function css(element, properties) {
  for (let prop in properties) {
    element.style[prop] = properties[prop];
  }
}

const queue = (function () {
  const pending = [];

  function next() {
    const fn = pending.shift();
    if (fn) {
      fn(next);
    }
  }

  return function (fn) {
    pending.push(fn);
    if (pending.length === 1) next();
  };
})();

const NProgress = {};

const Settings = {
  speed: 200,
  barSelector: '[role="bar"]',
};

/**
 * Last number.
 */

NProgress.status = null;

/**
 * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
 *
 *     NProgress.set(0.4);
 *     NProgress.set(1.0);
 */

NProgress.set = function (n) {
  const started = typeof NProgress.status === "number";

  n = clamp(n, 0.08, 1);
  NProgress.status = n === 1 ? null : n;

  const progress = NProgress.render(!started),
    speed = Settings.speed;

  progress.offsetWidth; /* Repaint */

  queue(function (next) {
    // Add transition
    css(progress.querySelector(Settings.barSelector), {
      transform: "translate3d(" + toBarPerc(n) + "%,0,0)",
      transition: "all " + speed + "ms linear",
    });

    if (n === 1) {
      // Fade out
      css(progress, {
        transition: "none",
        opacity: 1,
      });
      progress.offsetWidth; /* Repaint */

      setTimeout(function () {
        css(progress, {
          transition: "all " + speed + "ms linear",
          opacity: 0,
        });
        setTimeout(function () {
          const progress = document.getElementById("nprogress");
          progress &&
            progress.parentNode &&
            progress.parentNode.removeChild(progress);
          next();
        }, speed);
      }, speed);
    } else {
      setTimeout(next, speed);
    }
  });

  return this;
};

/**
 * Shows the progress bar.
 * This is the same as setting the status to 0%, except that it doesn't go backwards.
 *
 *     NProgress.start();
 *
 */
NProgress.start = function () {
  if (!NProgress.status) NProgress.set(0);

  const work = function () {
    setTimeout(function () {
      if (!NProgress.status) return;
      NProgress.inc();
      work();
    }, Settings.speed);
  };

  work();

  return this;
};

/**
 * Hides the progress bar.
 * This is the *sort of* the same as setting the status to 100%, with the
 * difference being `done()` makes some placebo effect of some realistic motion.
 *
 *     NProgress.done();
 *
 * If `true` is passed, it will show the progress bar even if its hidden.
 *
 *     NProgress.done(true);
 */

NProgress.done = function () {
  if (!NProgress.status) return this;

  return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
};

/**
 * Increments by a random amount.
 */

NProgress.inc = function (amount) {
  let n = NProgress.status;

  if (!n) {
    return NProgress.start();
  } else if (n > 1) {
    return;
  } else {
    if (typeof amount !== "number") {
      if (n >= 0 && n < 0.2) {
        amount = 0.1;
      } else if (n >= 0.2 && n < 0.5) {
        amount = 0.04;
      } else if (n >= 0.5 && n < 0.8) {
        amount = 0.02;
      } else if (n >= 0.8 && n < 0.99) {
        amount = 0.005;
      } else {
        amount = 0;
      }
    }

    n = clamp(n + amount, 0, 0.994);
    return NProgress.set(n);
  }
};

/**
 * (Internal) renders the progress bar markup based on the `template`
 * setting.
 */

NProgress.render = function (fromStart) {
  const existing = document.getElementById("nprogress");
  if (!!existing) {
    return existing;
  }

  const progress = document.createElement("div");
  progress.id = "nprogress";
  progress.innerHTML = '<div class="bar" role="bar" />';

  let bar = progress.querySelector(Settings.barSelector),
    perc = fromStart ? "-100" : toBarPerc(NProgress.status || 0),
    parent = document.querySelector("body");

  css(bar, {
    transition: "all 0 linear",
    transform: "translate3d(" + perc + "%,0,0)",
  });

  parent.appendChild(progress);
  return progress;
};

/**
 * Helpers
 */

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

/**
 * (Internal) converts a percentage (`0..1`) to a bar translateX
 * percentage (`-100%..0%`).
 */

function toBarPerc(n) {
  return (-1 + n) * 100;
}

module.exports = NProgress;
