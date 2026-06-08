import React, { useCallback, useEffect, useMemo, useState } from "react";

import { getAllPages } from "lib/track/pages";

import { useRouter } from "next/router";

import Meta from "components/Meta";
import RelatedPosts from "components/RelatedPosts";
import Title from "components/Title";
import UnitInput from "components/UnitInput";

import blogStyles from "styles/components/Blog.module.scss";
import styles from "styles/pages/track-calculators.module.scss";

function useSearchParams() {
  const router = useRouter();
  return useMemo(() => new URLSearchParams(router.query), [router.query]);
}

// Wind's effect on a mark, from Moinat, Fabius & Emanuel (2018):
// effect(w) = a*w + b*w^2, in the event's native units, expressed as a signed
// benefit — positive means the wind improved the performance (a faster time or
// a longer jump). The 100m linear term scales with the mark because faster
// athletes spend less time exposed to the wind.
const windEffect = {
  "100m": (mark, w) => (0.009459 * mark - 0.0449) * w - 0.0042 * w * w,
  "200m": (mark, w) => 0.09 * w - 0.01 * w * w,
  "100mH": (mark, w) => 0.093 * w - 0.01 * w * w,
  "110mH": (mark, w) => 0.093 * w - 0.01 * w * w,
  "Long Jump": (mark, w) => 0.029 * w,
  "Triple Jump": (mark, w) => 0.069 * w - 0.009 * w * w,
};

// A tailwind makes timed events faster (lower time) but jumps longer, so the
// benefit is subtracted from a time and added to a distance.
const eventIsTimed = {
  "100m": true,
  "200m": true,
  "100mH": true,
  "110mH": true,
  "Long Jump": false,
  "Triple Jump": false,
};

const units = {
  "100m": "s",
  "200m": "s",
  "100mH": "s",
  "110mH": "s",
  "Long Jump": "m",
  "Triple Jump": "m",
};

// Convert a mark achieved in the given wind to its still-air equivalent.
function toStillAir(event, mark, wind) {
  const markNum = parseFloat(mark);
  const windNum = parseFloat(wind || "0");

  if (isNaN(markNum) || isNaN(windNum) || !windEffect[event]) {
    return null;
  }

  const benefit = windEffect[event](markNum, windNum);
  return eventIsTimed[event] ? markNum + benefit : markNum - benefit;
}

// Apply a wind to a still-air mark.
function fromStillAir(event, stillAirMark, wind) {
  if (stillAirMark == null || !windEffect[event]) {
    return null;
  }

  const benefit = windEffect[event](stillAirMark, wind);
  return eventIsTimed[event] ? stillAirMark - benefit : stillAirMark + benefit;
}

export const metas = {
  title: "Wind Correction Calculator",
  description:
    "Corrects sprint and jump marks for wind based on Moniat, Fabius, and Emanuel (2018).",
};

export default function WindCorrection({ pages }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params if they exist
  const [event, setEvent] = useState(() => searchParams.get("event") || "100m");
  const [wind, setWind] = useState(
    () => parseFloat(searchParams.get("wind")) || 0
  );
  const [mark, setMark] = useState(
    () => parseFloat(searchParams.get("mark")) || 9.58
  );
  const [hasShared, setHasShared] = useState(false);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (event) {
      params.set("event", event);
    }
    if (mark) {
      params.set("mark", mark.toString());
    }
    if (wind) {
      params.set("wind", wind.toString());
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, undefined, { shallow: true });
      setHasShared(false);
    }
  }, [event, mark, wind, router]);

  // Add share button functionality
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setHasShared(true);
    setTimeout(() => setHasShared(false), 2000);
  }, []);

  const correctedMark = toStillAir(event, mark, wind);
  const maxLegalMark = fromStillAir(event, correctedMark, 2.0);

  const unit = units[event];

  return (
    <article className={blogStyles.article}>
      <Meta {...metas} />
      <Title title={metas.title} />
      <p>
        Corrects sprint and jump marks for wind, based on{" "}
        <a
          href="https://www.tandfonline.com/doi/full/10.1080/17461391.2018.1480062?scroll=top&needAccess=true"
          target="_blank"
          rel="noreferrer"
        >
          M. Moinat, O. Fabius & K. S. Emanuel (2018) Data-driven quantification
          of the effect of wind on athletics performance, European Journal of
          Sport Science, 18:9, 1185-1190, DOI: 10.1080/17461391.2018.1480062
        </a>
        .
      </p>
      <label className={styles.formContainer}>
        <strong>Event</strong>
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
            value={event}
            onChange={e => setEvent(e.target.value)}
          >
            {Object.keys(windEffect).map(c => (
              <option value={c} key={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </label>
      <label className={styles.formContainer}>
        <strong>Mark</strong>
        <UnitInput
          className={styles.input}
          type="number"
          step="0.01"
          value={mark}
          onChange={v => setMark(v)}
          unit={unit}
        />
      </label>
      <label className={styles.formContainer}>
        <strong>Wind</strong>
        <UnitInput
          className={styles.input}
          type="number"
          step="0.01"
          value={wind}
          onChange={v => setWind(v)}
          unit="m/s"
        />
      </label>
      <label className={styles.formContainer}>
        <strong>Predicted Mark at +0.0 m/s</strong>
        <UnitInput
          className={styles.input}
          disabled={true}
          type="number"
          value={correctedMark?.toFixed(2)}
          unit={unit}
        />
      </label>
      <label className={styles.formContainer}>
        <strong>Predicted Mark at +2.0 m/s</strong>
        <UnitInput
          className={styles.input}
          disabled={true}
          type="number"
          value={maxLegalMark?.toFixed(2)}
          unit={unit}
        />
      </label>
      <button
        className={styles.shareButton}
        onClick={handleShare}
        aria-label="Copy link to clipboard"
        disabled={hasShared}
      >
        {hasShared ? "Copied link!" : "Share"}
      </button>
      <RelatedPosts
        title="Other Utilities"
        posts={pages
          .filter(({ title }) => title !== metas.title)
          .map(({ title, page }) => ({
            fullSlug: `/projects/track/${page}`,
            title,
          }))}
      />
    </article>
  );
}

export async function getStaticProps() {
  const pages = getAllPages();
  return {
    props: {
      pages,
    },
  };
}
