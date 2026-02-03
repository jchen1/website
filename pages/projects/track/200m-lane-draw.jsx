import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";

import { getAllPages } from "lib/track/pages";

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

const LANE_EFFECT = 0.018;
const LANES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function convertLaneTime(time, currentLane, targetLane) {
  const timeNum = parseFloat(time);
  const currentNum = parseInt(currentLane, 10);
  const targetNum = parseInt(targetLane, 10);

  if (isNaN(timeNum) || isNaN(currentNum) || isNaN(targetNum)) {
    return null;
  }

  return timeNum + (currentNum - targetNum) * LANE_EFFECT;
}

export const metas = {
  title: "200m Lane Draw Converter",
  description:
    "Converts 200m times between lanes based on lane draw advantage.",
};

export default function LaneDrawConverter({ pages }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [time, setTime] = useState(
    () => parseFloat(searchParams.get("time")) || 19.79
  );
  const [currentLane, setCurrentLane] = useState(
    () => parseInt(searchParams.get("currentLane"), 10) || 5
  );
  const [targetLane, setTargetLane] = useState(
    () => parseInt(searchParams.get("targetLane"), 10) || 5
  );
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (time) params.set("time", time.toString());
    if (currentLane) params.set("currentLane", currentLane.toString());
    if (targetLane) params.set("targetLane", targetLane.toString());

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, undefined, { shallow: true });
      setHasShared(false);
    }
  }, [time, currentLane, targetLane, router]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setHasShared(true);
    setTimeout(() => setHasShared(false), 2000);
  }, []);

  const convertedTime = convertLaneTime(time, currentLane, targetLane);

  return (
    <article className={blogStyles.article}>
      <Meta {...metas} />
      <Title title={metas.title} />
      <p>
        Converts outdoor 200m times between lanes. Outside lanes have an
        advantage of approximately 0.018 seconds per lane, based on{" "}
        <a
          href="/posts/Effect-of-Lane-Draw-In-200m-Sprinters/"
          target="_blank"
          rel="noreferrer"
        >
          analysis of Diamond League results from 2015-2021
        </a>
        .
      </p>
      <label className={styles.formContainer}>
        <strong>200m Time</strong>
        <UnitInput
          className={styles.input}
          type="number"
          step="0.01"
          value={time}
          onChange={v => setTime(v)}
          unit="s"
        />
      </label>
      <label className={styles.formContainer}>
        <strong>Current Lane</strong>
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
            value={currentLane}
            onChange={e => setCurrentLane(parseInt(e.target.value, 10))}
          >
            {LANES.map(lane => (
              <option value={lane} key={lane}>
                Lane {lane}
              </option>
            ))}
          </select>
        </div>
        <small>The lane the time was run in.</small>
      </label>
      <label className={styles.formContainer}>
        <strong>Target Lane</strong>
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
            value={targetLane}
            onChange={e => setTargetLane(parseInt(e.target.value, 10))}
          >
            {LANES.map(lane => (
              <option value={lane} key={lane}>
                Lane {lane}
              </option>
            ))}
          </select>
        </div>
        <small>The lane to convert the time to.</small>
      </label>
      <label className={styles.formContainer}>
        <strong>Converted Time</strong>
        <UnitInput
          className={styles.input}
          disabled={true}
          type="number"
          value={convertedTime?.toFixed(2)}
          unit="s"
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
