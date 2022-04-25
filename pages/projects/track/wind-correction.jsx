import React, { useState, useEffect } from "react";

import Title from "components/Title";

import blogStyles from "styles/components/Blog.module.scss";
import styles from "styles/pages/track-calculators.module.scss";

// c = a*w + b*w^2
const coefficients = {
  "100m": [0.071, -0.0042],
  "200m": [0.09, -0.01],
  "100mH": [0.093, -0.01],
  "110mH": [0.093, -0.01],
  "Long Jump": [0, 0.029],
  "Triple Jump": [0.069, -0.009],
};

function round(mark) {
  const strMark = typeof mark === "string" ? mark : `${mark}`;

  return parseFloat(parseFloat(strMark).toFixed(2));
}

function correctForWind(event, mark, wind) {
  const [a, b] = coefficients[event];
  return mark + a * wind + b * wind * wind;
}

export default function WindCorrection() {
  const [event, setEvent] = useState("100m");
  const [wind, setWind] = useState(0);
  const [mark, setMark] = useState(9.58);

  const correctedMark = round(correctForWind(event, mark, wind));

  return (
    <article className={blogStyles.article}>
      <Title title="Wind Correction Calculator" />
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
            {Object.keys(coefficients).map(c => (
              <option value={c} key={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </label>
      <label className={styles.formContainer}>
        <strong>Mark</strong>
        <input
          className={styles.input}
          type="number"
          step="0.01"
          value={mark}
          onChange={e => setMark(round(e.target.value))}
        />
      </label>
      <label className={styles.formContainer}>
        <strong>Wind</strong>
        <input
          className={styles.input}
          type="number"
          step="0.01"
          value={wind}
          onChange={e => setWind(round(e.target.value))}
        />
      </label>
      <label className={styles.formContainer}>
        <strong>Corrected Mark</strong>
        <input
          className={styles.input}
          disabled={true}
          type="number"
          value={correctedMark}
        />
      </label>
    </article>
  );
}
