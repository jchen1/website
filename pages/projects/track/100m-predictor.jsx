import React, { useCallback, useState } from "react";

import { getAllPages } from "lib/track/pages";

import Meta from "components/Meta";
import RelatedPosts from "components/RelatedPosts";
import Title from "components/Title";
import UnitInput from "components/UnitInput";

import blogStyles from "styles/components/Blog.module.scss";
import styles from "styles/pages/track-calculators.module.scss";

// P_new = P + a*w + b*P*w + c*w^2
const windCoefficients = [-0.0449, 0.009459, -0.0042];

// P_100 = a + b*Block30 + c*(10 / Fly10)
const predictorCoefficients = [
  2.2441850962837124, 0.14735859276138946, -0.042918544171317706,
];

function predict100m(block30, fly10, wind = 0.0, reaction = 0.1) {
  block30 = parseFloat(block30);
  fly10 = parseFloat(fly10);
  wind = parseFloat(wind);
  reaction = parseFloat(reaction);

  if (isNaN(block30) || isNaN(fly10) || isNaN(wind) || isNaN(reaction)) {
    return null;
  }

  const predicted = Math.exp(
    predictorCoefficients[0] +
      predictorCoefficients[1] * block30 +
      predictorCoefficients[2] * (10 / fly10)
  );

  const windCorrection =
    windCoefficients[0] * wind +
    windCoefficients[1] * wind * predicted +
    windCoefficients[2] * wind * wind;

  return predicted - windCorrection + reaction;
}

export const metas = {
  title: "100m Predictor",
  description: "Predicts 100m times given a block 30 and fly 10 time.",
};

const wrappedOnChange =
  (setter, precision = 2) =>
  v => {
    const floatValue = parseFloat(v);
    // if not a number just set the value
    if (isNaN(floatValue)) {
      setter(v);
    }

    setter(floatValue.toFixed(precision));
  };

export default function WindCorrection({ pages }) {
  const [wind, setWind] = useState("0.0");
  const [block30, setBlock30] = useState("4.00");
  const [fly10, setFly10] = useState("1.00");
  const [reaction, setReaction] = useState("0.149");

  const predictedTime = predict100m(block30, fly10, wind, reaction);

  const wrappedSetWind = useCallback(wrappedOnChange(setWind, 1), [setWind]);
  const wrappedSetBlock30 = useCallback(wrappedOnChange(setBlock30, 2), [
    setBlock30,
  ]);
  const wrappedSetFly10 = useCallback(wrappedOnChange(setFly10, 2), [setFly10]);
  const wrappedSetReaction = useCallback(wrappedOnChange(setReaction, 3), [
    setReaction,
  ]);

  return (
    <article className={blogStyles.article}>
      <Meta {...metas} />
      <Title title={metas.title} />
      <section>
        <p>
          Predict your 100m time based on your block 30 and fly 10 times. Wind
          and reaction time are optional. The dataset used to train this model
          is men&apos;s 100m times ranging from 9.58s to slightly above 11s. If
          your times are outside of this range, predictions will be less
          accurate.
        </p>
        <label className={styles.formContainer}>
          <strong>Block 30</strong>
          <UnitInput
            className={styles.input}
            type="number"
            step="0.01"
            value={block30}
            onChange={wrappedSetBlock30}
            unit="s"
          />
          <small>
            Timed from start to the 30 meter mark,{" "}
            <b>excluding reaction time</b>. Use FAT timing for accurate
            estimates, or add 0.24s to a hand time.
          </small>
        </label>
        <label className={styles.formContainer}>
          <strong>Fly 10</strong>
          <UnitInput
            className={styles.input}
            type="number"
            step="0.01"
            value={fly10}
            onChange={wrappedSetFly10}
            unit="s"
          />
          <small>
            The fastest 10 meter segment in a run; non-FAT times will not
            produce accurate results. Freelap and camera times will be most
            accurate if averaged across a 20- or 30-meter split.
          </small>
        </label>
        <label className={styles.formContainer}>
          <strong>Wind</strong>
          <UnitInput
            className={styles.input}
            type="number"
            step="0.1"
            value={wind}
            onChange={wrappedSetWind}
            unit="m/s"
          />
          <small>Maximum legal wind is +2.0m/s.</small>
        </label>
        <label className={styles.formContainer}>
          <strong>Reaction time</strong>
          <UnitInput
            className={styles.input}
            type="number"
            step="0.001"
            value={reaction}
            onChange={wrappedSetReaction}
            unit="s"
          />
          <small>
            Minimum legal reaction time is 0.100s; average for sprinters is
            0.149s.
          </small>
        </label>
        <div className={styles.buttonContainer}>
          <button
            onClick={() => {
              setWind("0.0");
              setReaction("0.149");
            }}
          >
            Neutral conditions
          </button>
          <button
            onClick={() => {
              setWind("2.0");
              setReaction("0.100");
            }}
          >
            Ideal conditions
          </button>
        </div>
        <label className={styles.formContainer}>
          <strong>Predicted 100m</strong>
          <UnitInput
            className={styles.input}
            disabled={true}
            type="number"
            value={predictedTime?.toFixed(2)}
            unit="s"
          />
        </label>
      </section>

      <section className={styles.methodology}>
        <h2>Methodology</h2>
        <p>
          This predictor is based on a log-level regression model trained on
          &gt;800 professionally timed men&apos;s 100m races with 10m split
          data, which is available{" "}
          <a
            href="https://www.athletefirst.org/wp-content/uploads/2023/10/M100m-by-meeting-Sep-23.pdf"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          .
        </p>
        <p>
          The data was cleaned to remove Paralympic athletes and races where the
          athlete was obviously injured. Reaction time was removed from the data
          to isolate the effects of block 30 and fly 10 times. For races that
          didn&apos;t have reaction time available, the average reaction time
          (0.149s) for the dataset was used.
        </p>
        <p>
          Fly 10 times were converted to velocities (m/s) prior to training the
          model as I suspected velocity would be more predictive. A log-level
          regression was chosen as the data didn&apos;t look linear, and because
          the log-level model produced a significantly better fit than a linear
          fw model. The trained model has an R&sup2; value of 0.964 and a mean
          squared error of 0.004s.
        </p>
        <p>
          Wind correction is based on{" "}
          <a
            href="https://www.tandfonline.com/doi/full/10.1080/17461391.2018.1480062?scroll=top&needAccess=true"
            target="_blank"
            rel="noreferrer"
          >
            Moniat, Fabius, and Emanuel (2018)
          </a>
          .
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
