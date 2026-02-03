import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";

import { getAllPages } from "lib/track/pages";
import {
  events,
  eventDisplayNames,
  femaleFactors,
  maleFactors,
  markTypes,
} from "lib/track/age-grading/constants";

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

function parseTimeToSeconds(timeStr) {
  if (!timeStr) return null;
  const trimmed = timeStr.trim();

  // Handle mm:ss.xx or h:mm:ss.xx format
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length === 2) {
      // mm:ss.xx
      const minutes = parseFloat(parts[0]);
      const seconds = parseFloat(parts[1]);
      if (isNaN(minutes) || isNaN(seconds)) return null;
      return minutes * 60 + seconds;
    } else if (parts.length === 3) {
      // h:mm:ss.xx
      const hours = parseFloat(parts[0]);
      const minutes = parseFloat(parts[1]);
      const seconds = parseFloat(parts[2]);
      if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
      return hours * 3600 + minutes * 60 + seconds;
    }
  }

  // Plain seconds
  const seconds = parseFloat(trimmed);
  return isNaN(seconds) ? null : seconds;
}

function formatTime(seconds) {
  if (seconds == null || isNaN(seconds)) return "";

  if (seconds >= 3600) {
    // h:mm:ss.xx
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = (seconds % 60).toFixed(2);
    return `${h}:${m.toString().padStart(2, "0")}:${s.padStart(5, "0")}`;
  } else if (seconds >= 60) {
    // mm:ss.xx
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(2);
    return `${m}:${s.padStart(5, "0")}`;
  } else {
    return seconds.toFixed(2);
  }
}

function formatDistance(meters) {
  if (meters == null || isNaN(meters)) return "";
  return meters.toFixed(2);
}

function calculateAgeGraded(mark, age, event, gender) {
  const factors = gender === "male" ? maleFactors : femaleFactors;
  const factor = factors[age]?.[event];
  if (factor == null || mark == null) return null;

  const isTimeEvent = markTypes[event] === "time";

  if (isTimeEvent) {
    // For time events, multiply by factor (factor < 1 means adjustment down)
    return mark * factor;
  } else {
    // For distance events, divide by factor (factor > 1 means boost)
    return mark / factor;
  }
}

function calculatePredictedMark(mark, currentAge, targetAge, event, gender) {
  const factors = gender === "male" ? maleFactors : femaleFactors;
  const currentFactor = factors[currentAge]?.[event];
  const targetFactor = factors[targetAge]?.[event];
  if (currentFactor == null || targetFactor == null || mark == null)
    return null;

  const isTimeEvent = markTypes[event] === "time";

  if (isTimeEvent) {
    // Predicted time at target age
    return mark * (currentFactor / targetFactor);
  } else {
    // Predicted distance at target age
    return mark * (targetFactor / currentFactor);
  }
}

export const metas = {
  title: "Age Grading Calculator",
  description:
    "Calculate age-graded equivalents and predict performance at different ages using WMA 2023 coefficients.",
};

export default function AgeGrading({ pages }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [gender, setGender] = useState(
    () => searchParams.get("gender") || "male"
  );
  const [event, setEvent] = useState(() => searchParams.get("event") || "100m");
  const [age, setAge] = useState(() => searchParams.get("age") || "35");
  const [mark, setMark] = useState(() => searchParams.get("mark") || "");
  const [targetAge, setTargetAge] = useState(
    () => searchParams.get("targetAge") || "50"
  );
  const [hasShared, setHasShared] = useState(false);

  const isTimeEvent = markTypes[event] === "time";
  const unit = isTimeEvent ? "s" : "m";

  const parsedMark = isTimeEvent ? parseTimeToSeconds(mark) : parseFloat(mark);
  const ageNum = parseInt(age, 10);
  const targetAgeNum = parseInt(targetAge, 10);

  const ageGraded = calculateAgeGraded(parsedMark, ageNum, event, gender);
  const predictedMark = calculatePredictedMark(
    parsedMark,
    ageNum,
    targetAgeNum,
    event,
    gender
  );

  const formattedAgeGraded = isTimeEvent
    ? formatTime(ageGraded)
    : formatDistance(ageGraded);
  const formattedPredicted = isTimeEvent
    ? formatTime(predictedMark)
    : formatDistance(predictedMark);

  useEffect(() => {
    const params = new URLSearchParams();
    if (gender) params.set("gender", gender);
    if (event) params.set("event", event);
    if (age) params.set("age", age);
    if (mark) params.set("mark", mark);
    if (targetAge) params.set("targetAge", targetAge);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, undefined, { shallow: true });
      setHasShared(false);
    }
  }, [gender, event, age, mark, targetAge, router]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setHasShared(true);
    setTimeout(() => setHasShared(false), 2000);
  }, []);

  return (
    <article className={blogStyles.article}>
      <Meta {...metas} />
      <Title title={metas.title} />
      <section>
        <p>
          Calculate age-graded performance equivalents using the{" "}
          <a
            href="https://world-masters-athletics.com/wp-content/uploads/2023/01/Age-grading-2023-WMA-Outdoor-Factors-and-Standards.pdf"
            target="_blank"
            rel="noreferrer"
          >
            WMA 2023 age grading coefficients
          </a>
          . Enter your mark and age to see what its open standard equivalent, or
          predict what you might run at a different age.
        </p>

        <label className={styles.formContainer}>
          <strong>Gender</strong>
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={gender}
              onChange={e => setGender(e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </label>

        <label className={styles.formContainer}>
          <strong>Event</strong>
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={event}
              onChange={e => setEvent(e.target.value)}
            >
              {events.map(e => (
                <option key={e} value={e}>
                  {eventDisplayNames[e] || e}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className={styles.formContainer}>
          <strong>Age</strong>
          <UnitInput
            className={styles.input}
            type="number"
            min="30"
            max="110"
            step="1"
            value={age}
            onChange={setAge}
            unit="years"
          />
        </label>

        <label className={styles.formContainer}>
          <strong>Mark</strong>
          <UnitInput
            className={styles.input}
            type="text"
            value={mark}
            onChange={setMark}
            unit={unit}
          />
        </label>

        <hr className={styles.divider} />

        <label className={styles.formContainer}>
          <strong>Age-Graded Equivalent</strong>
          <UnitInput
            className={styles.input}
            disabled={true}
            type="text"
            value={formattedAgeGraded}
            unit={unit}
          />
        </label>

        <hr className={styles.divider} />

        <label className={styles.formContainer}>
          <strong>Target Age</strong>
          <UnitInput
            className={styles.input}
            type="number"
            min="30"
            max="110"
            step="1"
            value={targetAge}
            onChange={setTargetAge}
            unit="years"
          />
        </label>

        <label className={styles.formContainer}>
          <strong>Predicted Mark at Target Age</strong>
          <UnitInput
            className={styles.input}
            disabled={true}
            type="text"
            value={formattedPredicted}
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
      </section>

      <section className={styles.methodology}>
        <h2>About Age Grading</h2>
        <p>
          Age grading allows comparison of performances across different ages by
          applying coefficients that account for the natural decline in
          performance with age. A factor of 1.0 represents peak performance
          years. Factors begin to change starting at age 35.
        </p>
        <p>
          For <strong>running events</strong>, the age-graded time is calculated
          by multiplying your actual time by the age factor. As factors decrease
          with age, this converts older athletes&apos; times to faster
          equivalents.
        </p>
        <p>
          For <strong>field events</strong>, the age-graded mark is calculated
          by dividing your distance by the age factor. As factors increase with
          age, this converts older athletes&apos; throws/jumps to longer
          equivalents.
        </p>
        <p>
          The coefficients used here are from the{" "}
          <a
            href="https://world-masters-athletics.com/"
            target="_blank"
            rel="noreferrer"
          >
            World Masters Athletics
          </a>{" "}
          2023 age grading tables.
        </p>
      </section>

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
