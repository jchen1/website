import React, { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { useInitialQueryParams } from "lib/hooks";
import { getAllPages } from "lib/track/pages";
import type { TrackPage } from "lib/track/pages";
import { laneSlope } from "lib/track/laneDraw";
import type { Gender, LaneEvent } from "lib/track/laneDraw";

import Meta from "components/Meta";
import RelatedPosts from "components/RelatedPosts";
import Title from "components/Title";
import UnitInput from "components/UnitInput";

import blogStyles from "styles/components/Blog.module.scss";
import styles from "styles/pages/track-calculators.module.scss";

import type { GetStaticProps } from "next";
import type { Metas } from "lib/types";

const LANES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// World-class marks, used as the starting point for each cohort
const defaultTimes: Record<LaneEvent, Record<Gender, string>> = {
  "200m": { men: "19.79", women: "21.87" },
  "400m": { men: "44.15", women: "49.50" },
};

function isLaneEvent(value: string | null): value is LaneEvent {
  return value === "200m" || value === "400m";
}

function isGender(value: string | null): value is Gender {
  return value === "men" || value === "women";
}

interface Conversion {
  time: number;
  /** half-width of the converted time's 95% interval, seconds */
  uncertainty: number;
}

function convertLaneTime(
  event: LaneEvent,
  gender: Gender,
  time: string | number,
  currentLane: number,
  targetLane: number,
): Conversion | null {
  const timeNum = parseFloat(time as string);
  if (isNaN(timeNum)) {
    return null;
  }

  const { slope, ci95 } = laneSlope({ event, gender });
  const lanes = targetLane - currentLane;

  return {
    time: timeNum + slope * lanes,
    uncertainty: (Math.abs(lanes) * (ci95[1] - ci95[0])) / 2,
  };
}

export const metas: Metas = {
  title: "Lane Draw Converter",
  description:
    "Converts 200m and 400m times between lanes based on lane draw advantage.",
};

interface LaneDrawConverterProps {
  pages: TrackPage[];
}

export default function LaneDrawConverter({ pages }: LaneDrawConverterProps) {
  const router = useRouter();

  const [event, setEvent] = useState<LaneEvent>("200m");
  const [gender, setGender] = useState<Gender>("men");
  const [time, setTime] = useState<string | number>(defaultTimes["200m"].men);
  // a time that came from the user or a link is never replaced by a cohort
  // default
  const [timeIsUserSet, setTimeIsUserSet] = useState(false);
  const [currentLane, setCurrentLane] = useState(5);
  const [targetLane, setTargetLane] = useState(5);
  const [hasShared, setHasShared] = useState(false);

  const loadedFromUrl = useInitialQueryParams(params => {
    const urlEvent = params.get("event");
    const urlGender = params.get("gender");
    const cohortEvent = isLaneEvent(urlEvent) ? urlEvent : "200m";
    const cohortGender = isGender(urlGender) ? urlGender : "men";
    setEvent(cohortEvent);
    setGender(cohortGender);

    const urlTime = parseFloat(params.get("time") ?? "");
    if (isNaN(urlTime)) {
      setTime(defaultTimes[cohortEvent][cohortGender]);
    } else {
      setTime(urlTime);
      setTimeIsUserSet(true);
    }

    const urlCurrentLane = parseInt(params.get("currentLane") ?? "", 10);
    if (LANES.includes(urlCurrentLane)) {
      setCurrentLane(urlCurrentLane);
    }

    const urlTargetLane = parseInt(params.get("targetLane") ?? "", 10);
    if (LANES.includes(urlTargetLane)) {
      setTargetLane(urlTargetLane);
    }
  });

  useEffect(() => {
    if (!loadedFromUrl) {
      return;
    }

    const params = new URLSearchParams();
    params.set("event", event);
    params.set("gender", gender);
    if (time) params.set("time", time.toString());
    if (currentLane) params.set("currentLane", currentLane.toString());
    if (targetLane) params.set("targetLane", targetLane.toString());

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, undefined, { shallow: true });
      setHasShared(false);
    }
  }, [loadedFromUrl, event, gender, time, currentLane, targetLane, router]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setHasShared(true);
    setTimeout(() => setHasShared(false), 2000);
  }, []);

  const handleEvent = useCallback(
    (value: LaneEvent) => {
      setEvent(value);
      if (!timeIsUserSet) {
        setTime(defaultTimes[value][gender]);
      }
    },
    [gender, timeIsUserSet],
  );
  const handleGender = useCallback(
    (value: Gender) => {
      setGender(value);
      if (!timeIsUserSet) {
        setTime(defaultTimes[event][value]);
      }
    },
    [event, timeIsUserSet],
  );
  const handleTime = useCallback((value: string) => {
    setTime(value);
    setTimeIsUserSet(true);
  }, []);

  const conversion = convertLaneTime(
    event,
    gender,
    time,
    currentLane,
    targetLane,
  );

  return (
    <article className={blogStyles.article}>
      <Meta {...metas} />
      <Title title={metas.title} />
      <p>
        Converts outdoor 200m and 400m times between lanes. Outer lanes are
        faster, by an amount per lane that depends on the event and the sex of
        the athlete. The constants come from within-athlete comparisons — the
        same athlete running the same event out of different lanes — across{" "}
        <a
          href="/posts/Effect-of-Lane-Draw-In-200m-Sprinters/"
          target="_blank"
          rel="noreferrer"
        >
          Diamond League results from 2015-2025
        </a>{" "}
        and 26,000+ NCAA results from 2016-2026. Naive lane comparisons that do
        not control for who is in each lane overstate the effect several-fold,
        and the women&apos;s elite estimates are the least precise of the four.
      </p>
      <label className={styles.formContainer}>
        <strong>Event</strong>
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
            value={event}
            onChange={e =>
              handleEvent((e.target as HTMLSelectElement).value as LaneEvent)
            }
          >
            <option value="200m">200m</option>
            <option value="400m">400m</option>
          </select>
        </div>
      </label>
      <label className={styles.formContainer}>
        <strong>Sex</strong>
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
            value={gender}
            onChange={e =>
              handleGender((e.target as HTMLSelectElement).value as Gender)
            }
          >
            <option value="men">Men</option>
            <option value="women">Women</option>
          </select>
        </div>
      </label>
      <label className={styles.formContainer}>
        <strong>{event} Time</strong>
        <UnitInput
          className={styles.input}
          type="number"
          step="0.01"
          value={time}
          onChange={handleTime}
          unit="s"
        />
      </label>
      <label className={styles.formContainer}>
        <strong>Current Lane</strong>
        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
            value={currentLane}
            onChange={e =>
              setCurrentLane(
                parseInt((e.target as HTMLSelectElement).value, 10),
              )
            }
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
            onChange={e =>
              setTargetLane(parseInt((e.target as HTMLSelectElement).value, 10))
            }
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
          value={conversion?.time.toFixed(2)}
          unit="s"
        />
        {conversion && conversion.uncertainty > 0 && (
          <small>
            range {(conversion.time - conversion.uncertainty).toFixed(2)}&ndash;
            {(conversion.time + conversion.uncertainty).toFixed(2)} s
          </small>
        )}
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

export const getStaticProps: GetStaticProps<
  LaneDrawConverterProps
> = async () => {
  const pages = getAllPages();
  return {
    props: {
      pages,
    },
  };
};
