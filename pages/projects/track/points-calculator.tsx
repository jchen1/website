import { useCallback, useEffect, useMemo, useState } from "react";

import {
  coefficients,
  eventNames,
  isEventValidForGender,
  markTypes,
  order,
  units,
} from "lib/track/points-calculator/constants";
import { useInitialQueryParams } from "lib/hooks";
import { getAllPages } from "lib/track/pages";
import type { TrackPage } from "lib/track/pages";
import type { MarkType } from "lib/track/points-calculator/constants";

import Meta from "components/Meta";
import RelatedPosts from "components/RelatedPosts";
import Title from "components/Title";
import UnitInput from "components/UnitInput";

import blogStyles from "styles/components/Blog.module.scss";
import styles from "styles/pages/track-calculators.module.scss";

import type { GetStaticProps } from "next";
import type { Metas } from "lib/types";
import Link from "next/link";
import { useRouter } from "next/router";

function score(coefficients: number[], x: number) {
  if (coefficients.length === 2) {
    return coefficients[0] * x + coefficients[1];
  }
  return Math.round(
    coefficients[0] * x * x + coefficients[1] * x + coefficients[2],
  );
}

function getMarkFromScore(coefficients: number[], y: number) {
  let ret = Number(
    (
      (-1 * coefficients[1] -
        Math.sqrt(
          Math.pow(coefficients[1], 2) -
            4 * coefficients[0] * (coefficients[2] - y),
        )) /
      (2 * coefficients[0])
    ).toFixed(2),
  );

  // find the positive result
  if (ret < 0) {
    ret = Number(
      (
        (-1 * coefficients[1] +
          Math.sqrt(
            Math.pow(coefficients[1], 2) -
              4 * coefficients[0] * (coefficients[2] - y),
          )) /
        (2 * coefficients[0])
      ).toFixed(2),
    );
  }

  return ret;
}

function userMarkToMark(userMark: string, markType: MarkType) {
  switch (markType) {
    case "time":
      const [seconds, minutes, hours] = userMark
        .split(":")
        .reverse()
        .map(x => parseFloat(x));
      return 60 * 60 * (hours ?? 0) + 60 * (minutes ?? 0) + seconds;
    case "distance":
      return parseFloat(userMark);
    case "points":
      return parseInt(userMark);
    default:
      throw new Error(`unknown mark type ${markType}`);
  }
}

function zeroPad(num: number, places: number) {
  return String(num).padStart(places, "0");
}

function markToUserMark(mark: number, markType: MarkType) {
  switch (markType) {
    case "time":
      const hours = Math.floor(mark / 60 / 60);
      const minutes = Math.floor(mark / 60) % 60;
      const seconds = Math.floor(mark % 60);
      const ms = (mark % 1).toFixed(2).split(".")[1];

      if (hours > 0) {
        return `${hours}:${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}.${ms}`;
      }
      if (minutes > 0) {
        return `${minutes}:${zeroPad(seconds, 2)}.${ms}`;
      }

      return `${seconds}.${ms}`;
    case "distance":
      return `${mark}`;
    case "points":
      return `${mark}`;
    default:
      throw new Error(`unknown mark type ${markType}`);
  }
}

function equivalentMark(eventType: string, points: number, gender: string) {
  const eventCoefficients = coefficients[gender][eventType];
  if (!eventCoefficients) {
    return null;
  }

  const markType = markTypes[eventType];
  const mark = getMarkFromScore(eventCoefficients, points);
  if (!Number.isFinite(mark) || mark <= 0) {
    return null;
  }

  return markToUserMark(
    markType === "points" ? Math.round(mark) : mark,
    markType,
  );
}

export const metas: Metas = {
  title: "World Athletics Points Calculator",
  description:
    "Converts athletics marks to World Athletics points and vice versa using equations derived from World Athletics' 2022 scoring tables",
};

interface PointsCalculatorProps {
  pages: TrackPage[];
}

export default function PointsCalculator({ pages }: PointsCalculatorProps) {
  const router = useRouter();

  const [category, setCategory] = useState("outdoor");
  const [gender, setGender] = useState("men");
  const [event, setEvent] = useState("100m");
  const [mark, setMark] = useState("");
  const [points, setPoints] = useState("");
  const [hasShared, setHasShared] = useState(false);
  // null follows the main category selector until a tab is clicked
  const [equivalentsCategory, setEquivalentsCategory] = useState<string | null>(
    null,
  );
  const [lastChanged, setLastChanged] = useState<"mark" | "points" | null>(
    null,
  );

  const loadedFromUrl = useInitialQueryParams(params => {
    const urlCategory = params.get("category");
    const category =
      urlCategory && Object.hasOwn(order, urlCategory)
        ? urlCategory
        : "outdoor";
    setCategory(category);

    const urlGender = params.get("gender");
    if (urlGender && Object.hasOwn(coefficients, urlGender)) {
      setGender(urlGender);
    }

    const urlEvent = params.get("event");
    if (urlEvent && order[category].includes(urlEvent)) {
      setEvent(urlEvent);
    }

    const urlMark = params.get("mark");
    if (urlMark) {
      setMark(urlMark);
    }

    const urlPoints = params.get("points");
    if (urlPoints) {
      setPoints(urlPoints);
    }
  });

  // Update URL when state changes
  useEffect(() => {
    if (!loadedFromUrl) {
      return;
    }

    const params = new URLSearchParams();
    if (category) {
      params.set("category", category);
    }
    if (gender) {
      params.set("gender", gender);
    }
    if (event) {
      params.set("event", event);
    }
    if (mark) {
      params.set("mark", mark);
    }
    if (points) {
      params.set("points", points);
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, undefined, { shallow: true });
      setHasShared(false);
    }
  }, [loadedFromUrl, category, gender, event, mark, points, router]);

  // Add share button functionality
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setHasShared(true);
    setTimeout(() => setHasShared(false), 2000);
  }, []);

  // Calculate points from mark
  const calculatePoints = useCallback(
    (markValue: string, eventType: string) => {
      if (markValue === "") return "";
      try {
        const markNum = userMarkToMark(markValue, markTypes[eventType]);
        const points = score(coefficients[gender][eventType], markNum);
        return points >= 0 && points <= 1400 ? points.toString() : "";
      } catch {
        return "";
      }
    },
    [gender],
  );

  // Calculate mark from points
  const calculateMark = useCallback(
    (pointsValue: string, eventType: string) => {
      if (pointsValue === "" || !coefficients[gender][eventType]) return "";
      try {
        const mark = getMarkFromScore(
          coefficients[gender][eventType],
          // the quadratic solve coerces the numeric string
          pointsValue as unknown as number,
        );
        return markToUserMark(mark, markTypes[eventType]);
      } catch {
        return "";
      }
    },
    [gender],
  );

  const onMarkChanged = useCallback(
    (newMark: string) => {
      try {
        // First parse and format the mark
        const markNum = userMarkToMark(newMark, markTypes[event]);
        const formattedMark = markToUserMark(markNum, markTypes[event]);
        setMark(formattedMark);

        // Always calculate points when mark changes
        const newPoints = calculatePoints(formattedMark, event);
        setPoints(newPoints);
        setLastChanged("mark");
      } catch {
        // If mark is invalid (e.g. partial input), just set the raw value
        setMark(newMark);
        setPoints("");
      }
    },
    [event, calculatePoints],
  );

  const onPointsChanged = useCallback(
    (newPoints: string) => {
      setPoints(newPoints);
      // Only calculate mark if mark wasn't the last thing changed
      if (lastChanged !== "mark") {
        setMark(calculateMark(newPoints, event));
      }
      setLastChanged("points");
    },
    [event, calculateMark, lastChanged],
  );

  // Reset lastChanged when event/category/gender changes
  useEffect(() => {
    setLastChanged(null);
  }, [event, category, gender]);

  useEffect(() => {
    if (!loadedFromUrl) {
      return;
    }

    if (!coefficients[gender][event] || !order[category].includes(event)) {
      // Set to the equivalent indoor/outdoor event when possible
      if (category === "indoor" && order[category].includes(`${event} sh`)) {
        setEvent(`${event} sh`);
      } else if (category === "outdoor" && event.endsWith(" sh")) {
        setEvent(event.replace(" sh", ""));
      } else {
        setEvent(order[category][0]);
      }
    }
    onPointsChanged(points);
  }, [loadedFromUrl, category, gender, event, onPointsChanged, points]);

  const unit = units[markTypes[event]];

  const events = useMemo(() => {
    return order[category].filter(k =>
      isEventValidForGender(k, gender === "men"),
    );
  }, [category, gender]);

  const tableCategory = equivalentsCategory ?? category;

  const equivalentMarks = useMemo(() => {
    const pointsNum = Number(points);
    if (points === "" || !Number.isFinite(pointsNum)) {
      return [];
    }
    return order[tableCategory]
      .filter(other => isEventValidForGender(other, gender === "men"))
      .filter(other => tableCategory !== category || other !== event)
      .map(other => ({
        event: other,
        mark: equivalentMark(other, pointsNum, gender),
        unit: units[markTypes[other]],
      }))
      .filter((row): row is { event: string; mark: string; unit: string } =>
        Boolean(row.mark),
      );
  }, [points, tableCategory, category, event, gender]);

  return (
    <article className={blogStyles.article}>
      <Meta {...metas} />
      <Title title={metas.title} />
      <section>
        <p>
          Converts athletics marks to World Athletics points and vice versa
          using equations derived from World Athletic&apos;s{" "}
          <a
            href="https://www.worldathletics.org/about-iaaf/documents/technical-information"
            target="_blank"
            rel="noreferrer"
          >
            2025 scoring tables
          </a>
          .
        </p>
        <label className={styles.formContainer}>
          <strong>Category</strong>
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={category}
              onChange={e => setCategory((e.target as HTMLSelectElement).value)}
            >
              <option value="outdoor">Outdoor</option>
              <option value="indoor">Indoor</option>
            </select>
          </div>
        </label>
        <label className={styles.formContainer}>
          <strong>Gender</strong>
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={gender}
              onChange={e => setGender((e.target as HTMLSelectElement).value)}
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
            </select>
          </div>
        </label>
        <label className={styles.formContainer}>
          <strong>Event</strong>
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={event}
              onChange={e => setEvent((e.target as HTMLSelectElement).value)}
            >
              {events.map(event => (
                <option value={event} key={event}>
                  {eventNames[event]}
                </option>
              ))}
            </select>
          </div>
        </label>
        <label className={styles.formContainer}>
          <strong>Mark</strong>
          <UnitInput
            className={styles.input}
            type="text"
            value={mark}
            onChange={v => onMarkChanged(v)}
            unit={unit}
          />
        </label>
        <label className={styles.formContainer}>
          <strong>Points</strong>
          <UnitInput
            className={styles.input}
            type="number"
            step="1"
            min="0"
            max="1400"
            value={points}
            charBlacklist={["e", ".", "-", "+"]}
            onChange={v => onPointsChanged(v)}
            placeholder="0-1400"
            unit="pts"
          />
        </label>
        <details className={styles.equivalents}>
          <summary>Equivalent marks in other events</summary>
          <div className={styles.tabs}>
            {Object.keys(order).map(c => (
              <button
                key={c}
                type="button"
                className={c === tableCategory ? styles.activeTab : undefined}
                aria-pressed={c === tableCategory}
                onClick={() => setEquivalentsCategory(c)}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
          {equivalentMarks.length > 0 ? (
            <>
              <p>
                Marks worth {points} points in {tableCategory}{" "}
                {gender === "men" ? "men’s" : "women’s"} events.
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Mark</th>
                  </tr>
                </thead>
                <tbody>
                  {equivalentMarks.map(({ event, mark, unit }) => (
                    <tr key={event}>
                      <td>{eventNames[event]}</td>
                      <td>
                        {mark} {unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p>Enter a mark or points above to compare across events.</p>
          )}
        </details>
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
        <h2>Methodology</h2>
        <p>
          Raw point values were parsed from the official{" "}
          <a
            href="https://www.worldathletics.org/about-iaaf/documents/technical-information"
            target="_blank"
            rel="noreferrer"
          >
            World Athletics 2025 scoring tables
          </a>
          . I then used a quadratic regression to fit equations to each (event,
          gender) pair. See{" "}
          <Link
            href={"/posts/Calculating-World-Athletics-Coefficients"}
            prefetch={false}
          >
            this post
          </Link>{" "}
          for more details.
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

export const getStaticProps: GetStaticProps<
  PointsCalculatorProps
> = async () => {
  const pages = getAllPages();
  return {
    props: {
      pages,
    },
  };
};
