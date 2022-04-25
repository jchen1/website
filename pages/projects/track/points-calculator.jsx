import React, { useState, useEffect } from "react";

import Title from "components/Title";

import blogStyles from "styles/components/Blog.module.scss";
import styles from "styles/pages/track-calculators.module.scss";

import {
  coefficients,
  markTypes,
  order,
  units,
} from "lib/track/points-calculator/constants";

import Meta from "components/Meta";
import UnitInput from "components/UnitInput";

function score(coefficients, x) {
  return Math.floor(
    coefficients[0] * x * x + coefficients[1] * x + coefficients[2]
  );
}

function getMarkFromScore(coefficients, y) {
  return Number(
    (
      (-1 * coefficients[1] -
        Math.sqrt(
          Math.pow(coefficients[1], 2) -
            4 * coefficients[0] * (coefficients[2] - y)
        )) /
      (2 * coefficients[0])
    ).toFixed(2)
  );
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

function markToUserMark(mark, markType) {
  switch (markType) {
    case "time":
      const hours = Math.floor(mark / 60 / 60);
      const minutes = Math.floor(mark / 60) % 60;
      const seconds = (mark % 60).toFixed(2);
      if (hours > 0) {
        return `${hours}:${minutes}:${seconds}`;
      }
      if (minutes > 0) {
        return `${minutes}:${seconds}`;
      }
      return `${seconds}`;
    case "distance":
      return `${mark}`;
    case "points":
      return `${mark}`;
    default:
      throw new Error(`unknown mark type ${markType}`);
  }
}

const metas = {
  title: "World Athletics Points Calculator",
  description:
    "Converts athletics marks to World Athletics points and vice versa using equations derived from World Athletic's 2022 scoring tables",
};

export default function PointsCalculator() {
  const [category, setCategory] = useState("outdoor");
  const [gender, setGender] = useState("men");
  const [event, setEvent] = useState("100m");

  const [mark, setMark] = useState(null);
  const [points, setPoints] = useState(null);

  const [changed, setChanged] = useState(null);

  // todo: input masks/types for marks
  const onMarkChanged = newMark => {
    setMark(newMark);
    if (changed === "points") {
      setChanged(null);
    } else {
      if (newMark !== "") {
        const markValue = userMarkToMark(newMark, markTypes[event]);
        const points = score(coefficients[category][gender][event], markValue);
        setChanged("mark");
        if (points >= 0 && points <= 1400) {
          setPoints(points.toString());
        } else {
          setPoints("");
        }
      }
    }
  };

  const onPointsChanged = newPoints => {
    setPoints(newPoints);

    if (changed === "mark") {
      setChanged(null);
    } else {
      if (newPoints !== "") {
        const mark = getMarkFromScore(
          coefficients[category][gender][event],
          newPoints
        );
        setChanged("points");
        setMark(markToUserMark(mark, markTypes[event]));
      }
    }
  };

  useEffect(() => {
    setMark("");
    setPoints(null);
  }, [category, gender, event]);

  const unit = units[markTypes[event]];

  const events = order[category][gender];
  return (
    <article className={blogStyles.article}>
      <Meta {...metas} />
      <Title title={metas.title} />
      <p>
        Converts athletics marks to World Athletics points and vice versa using
        equations derived from World Athletic's{" "}
        <a
          href="https://www.worldathletics.org/about-iaaf/documents/technical-information"
          target="_blank"
          rel="noreferrer"
        >
          2022 scoring tables
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
                {event}
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
          onChange={e => onMarkChanged(e.target.value)}
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
          onKeyDown={e =>
            (e.key === "e" ||
              e.key === "." ||
              e.key === "-" ||
              e.key === "+") &&
            e.preventDefault()
          }
          onChange={e => onPointsChanged(e.target.value)}
          placeholder="0-1400"
          unit="pts"
        />
      </label>
    </article>
  );
}
