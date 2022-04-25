import React, { useState } from "react";

import { getAllPages } from "lib/track/pages";

import Meta from "components/Meta";
import RelatedPosts from "components/RelatedPosts";
import Title from "components/Title";
import UnitInput from "components/UnitInput";

import blogStyles from "styles/components/Blog.module.scss";
import styles from "styles/pages/track-calculators.module.scss";

// P_new = P + a*w + b*P*w + c*w^2
const coefficients = {
  "100m": [-0.0449, 0.009459, -0.0042],
  "200m": [0.09, 0, -0.01],
  "100mH": [0.093, 0, -0.01],
  "110mH": [0.093, 0, -0.01],
  "Long Jump": [0, 0, 0.029],
  "Triple Jump": [0.069, 0, -0.009],
};

const units = {
  "100m": "s",
  "200m": "s",
  "100mH": "s",
  "110mH": "s",
  "Long Jump": "m",
  "Triple Jump": "m",
};

function correctForWind(event, mark, wind) {
  const markNum = parseFloat(mark);
  const windNum = parseFloat(wind || "0");

  if (isNaN(markNum) || isNaN(windNum)) {
    return null;
  }

  const [a, b, c] = coefficients[event];
  return markNum + a * windNum + b * windNum * markNum + c * windNum * windNum;
}

export const metas = {
  title: "Wind Correction Calculator",
  description:
    "Corrects sprint and jump marks for wind based on Moniat, Fabius, and Emanuel (2018).",
};

export default function WindCorrection({ pages }) {
  const [event, setEvent] = useState("100m");
  const [wind, setWind] = useState(0);
  const [mark, setMark] = useState(9.58);

  const correctedMark = correctForWind(event, mark, wind);
  const maxLegalMark =
    2 * correctedMark - correctForWind(event, correctedMark, 2.0);

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
        <UnitInput
          className={styles.input}
          type="number"
          step="0.01"
          value={mark}
          onChange={e => setMark(e.target.value)}
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
          onChange={e => setWind(e.target.value)}
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
