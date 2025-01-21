import { useState, useEffect, useCallback, useMemo } from "react";

import {
  coefficients,
  eventNames,
  isEventValidForGender,
  markTypes,
  order,
  units,
} from "lib/track/points-calculator/constants";
import { getAllPages } from "lib/track/pages";

import Meta from "components/Meta";
import RelatedPosts from "components/RelatedPosts";
import Title from "components/Title";
import UnitInput from "components/UnitInput";

import blogStyles from "styles/components/Blog.module.scss";
import styles from "styles/pages/track-calculators.module.scss";

function score(coefficients, x) {
  if (coefficients.length === 2) {
    return coefficients[0] * x + coefficients[1];
  }
  return Math.round(
    coefficients[0] * x * x + coefficients[1] * x + coefficients[2]
  );
}

function getMarkFromScore(coefficients, y) {
  let ret = Number(
    (
      (-1 * coefficients[1] -
        Math.sqrt(
          Math.pow(coefficients[1], 2) -
            4 * coefficients[0] * (coefficients[2] - y)
        )) /
      (2 * coefficients[0])
    ).toFixed(2)
  );

  // find the positive result
  if (ret < 0) {
    ret = Number(
      (
        (-1 * coefficients[1] +
          Math.sqrt(
            Math.pow(coefficients[1], 2) -
              4 * coefficients[0] * (coefficients[2] - y)
          )) /
        (2 * coefficients[0])
      ).toFixed(2)
    );
  }

  return ret;
}

function userMarkToMark(userMark, markType) {
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

function zeroPad(num, places) {
  return String(num).padStart(places, "0");
}

function markToUserMark(mark, markType) {
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

export const metas = {
  title: "World Athletics Points Calculator",
  description:
    "Converts athletics marks to World Athletics points and vice versa using equations derived from World Athletics' 2022 scoring tables",
};

export default function PointsCalculator({ pages }) {
  const [category, setCategory] = useState("outdoor");
  const [gender, setGender] = useState("men");
  const [event, setEvent] = useState("100m");
  const [mark, setMark] = useState("");
  const [points, setPoints] = useState("");
  const [lastChanged, setLastChanged] = useState(null);

  // Calculate points from mark
  const calculatePoints = useCallback(
    (markValue, eventType) => {
      if (markValue === "") return "";
      try {
        const markNum = userMarkToMark(markValue, markTypes[eventType]);
        const points = score(coefficients[gender][eventType], markNum);
        return points >= 0 && points <= 1400 ? points.toString() : "";
      } catch {
        return "";
      }
    },
    [gender]
  );

  // Calculate mark from points
  const calculateMark = useCallback(
    (pointsValue, eventType) => {
      if (pointsValue === "" || !coefficients[gender][eventType]) return "";
      try {
        const mark = getMarkFromScore(
          coefficients[gender][eventType],
          pointsValue
        );
        return markToUserMark(mark, markTypes[eventType]);
      } catch {
        return "";
      }
    },
    [gender]
  );

  const onMarkChanged = useCallback(
    newMark => {
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
    [event, calculatePoints]
  );

  const onPointsChanged = useCallback(
    newPoints => {
      setPoints(newPoints);
      // Only calculate mark if mark wasn't the last thing changed
      if (lastChanged !== "mark") {
        setMark(calculateMark(newPoints, event));
      }
      setLastChanged("points");
    },
    [event, calculateMark, lastChanged]
  );

  // Reset lastChanged when event/category/gender changes
  useEffect(() => {
    setLastChanged(null);
  }, [event, category, gender]);

  useEffect(() => {
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
  }, [category, gender, event, onPointsChanged, points]);

  const unit = units[markTypes[event]];

  const events = useMemo(() => {
    return order[category].filter(k =>
      isEventValidForGender(k, gender === "men")
    );
  }, [category, gender]);

  return (
    <article className={blogStyles.article}>
      <Meta {...metas} />
      <Title title={metas.title} />
      <p>
        Converts athletics marks to World Athletics points and vice versa using
        equations derived from World Athletic&apos;s{" "}
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
            onChange={e => setCategory(e.target.value)}
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
            onChange={e => setGender(e.target.value)}
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
            onChange={e => setEvent(e.target.value)}
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
