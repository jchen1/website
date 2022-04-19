import React, { useState, useEffect } from "react";

import Title from "components/Title";

import blogStyles from "styles/components/Blog.module.scss";
import styles from "styles/pages/iaaf-calculator.module.scss";

import coefficients from "assets/data/coefficients.json";

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

export default function IAAFCalculator() {
  const [category, setCategory] = useState("outdoor");
  const [gender, setGender] = useState("men");
  const [event, setEvent] = useState("100m");

  const [mark, setMark] = useState(null);
  const [points, setPoints] = useState(null);

  const onMarkChanged = newMark => {
    const points = score(coefficients[category][gender][event], newMark);
    setMark(newMark);
    setPoints(points);
  };

  const onPointsChanged = newPoints => {
    const mark = getMarkFromScore(
      coefficients[category][gender][event],
      newPoints
    );
    setPoints(newPoints);
    setMark(mark);
  };

  // todo: sort events better & have display
  const events = Object.keys(coefficients[category][gender]).sort();

  return (
    <article className={blogStyles.article}>
      <Title title="World Athletics Points Calculator" />
      <p>
        Converts marks to World Athletics points and vice versa using the{" "}
        <a
          href="https://www.worldathletics.org/about-iaaf/documents/technical-information"
          target="_blank"
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
        <input
          className={styles.input}
          type="text"
          value={mark}
          onChange={e => onMarkChanged(e.target.value)}
        />
      </label>
      <label className={styles.formContainer}>
        <strong>Points</strong>
        <input
          className={styles.input}
          type="number"
          value={points}
          onChange={e => onPointsChanged(e.target.value)}
        />
      </label>
    </article>
  );
}
