import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";

import { getAllPages } from "lib/track/pages";
import type { TrackPage } from "lib/track/pages";
import { BLOCK_DISTANCES, FLY_DISTANCES, MODEL } from "lib/track/100m-model";
import type { Sex } from "lib/track/100m-model";

import Meta from "components/Meta";
import RelatedPosts from "components/RelatedPosts";
import Title from "components/Title";
import UnitInput from "components/UnitInput";

import blogStyles from "styles/components/Blog.module.scss";
import styles from "styles/pages/track-calculators.module.scss";

import type { GetStaticProps } from "next";
import type { Metas } from "lib/types";

function useSearchParams() {
  const router = useRouter();
  return useMemo(
    () => new URLSearchParams(router.query as Record<string, string>),
    [router.query],
  );
}

// P_new = P + a*w + b*P*w + c*w^2
const windCoefficients = [-0.0449, 0.009459, -0.0042];

// typical time at each distance, used when the user switches distances
const defaultBlockTimes: Record<string, string> = {
  "10": "1.90",
  "20": "3.00",
  "30": "4.00",
  "40": "4.95",
  "50": "5.90",
  "60": "6.85",
};
const defaultFlyTimes: Record<string, string> = {
  "10": "1.00",
  "20": "2.00",
  "30": "3.05",
};

function predict100m(
  sex: Sex,
  blockDistance: string,
  flyDistance: string,
  blockTime: string | number,
  flyTime: string | number,
  wind: string | number = 0.0,
  reaction: string | number = 0.1,
) {
  blockTime = parseFloat(blockTime as string);
  flyTime = parseFloat(flyTime as string);
  wind = parseFloat(wind as string);
  reaction = parseFloat(reaction as string);

  if (isNaN(blockTime) || isNaN(flyTime) || isNaN(wind) || isNaN(reaction)) {
    return null;
  }

  const cell = MODEL[sex][`${blockDistance}_${flyDistance}`];
  if (!cell) {
    return null;
  }

  const flyVelocity = parseFloat(flyDistance) / flyTime;
  const predicted = Math.exp(
    cell.intercept + cell.block * blockTime + cell.velocity * flyVelocity,
  );

  const windCorrection =
    windCoefficients[0] * wind +
    windCoefficients[1] * wind * predicted +
    windCoefficients[2] * wind * wind;

  return predicted - windCorrection + reaction;
}

export const metas: Metas = {
  title: "100m Predictor",
  description:
    "Predicts men's and women's 100m times from a block start and a fly sprint at the distances you actually measure.",
};

const wrappedOnChange =
  (setter: (value: string) => void, precision = 2) =>
  (v: string) => {
    const floatValue = parseFloat(v);
    // if not a number just set the value
    if (isNaN(floatValue)) {
      setter(v);
      return;
    }

    setter(floatValue.toFixed(precision));
  };

interface PredictorProps {
  pages: TrackPage[];
}

export default function Predictor100m({ pages }: PredictorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sex, setSex] = useState<Sex>(() =>
    searchParams.get("sex") === "women" ? "women" : "men",
  );
  const [blockDistance, setBlockDistance] = useState(
    () => searchParams.get("blockDistance") || "30",
  );
  const [flyDistance, setFlyDistance] = useState(
    () => searchParams.get("flyDistance") || "10",
  );
  // block30/fly10 are the query params from before distances were selectable
  const [blockTime, setBlockTime] = useState(
    () =>
      searchParams.get("block") ||
      searchParams.get("block30") ||
      defaultBlockTimes["30"],
  );
  const [flyTime, setFlyTime] = useState(
    () =>
      searchParams.get("fly") ||
      searchParams.get("fly10") ||
      defaultFlyTimes["10"],
  );
  const [wind, setWind] = useState(() => searchParams.get("wind") || "0.0");
  const [reaction, setReaction] = useState(
    () => searchParams.get("reaction") || "0.149",
  );
  const [hasShared, setHasShared] = useState(false);

  const predictedTime = predict100m(
    sex,
    blockDistance,
    flyDistance,
    blockTime,
    flyTime,
    wind,
    reaction,
  );

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("sex", sex);
    params.set("blockDistance", blockDistance);
    params.set("flyDistance", flyDistance);
    if (blockTime) params.set("block", blockTime);
    if (flyTime) params.set("fly", flyTime);
    if (wind) params.set("wind", wind);
    if (reaction) params.set("reaction", reaction);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, undefined, { shallow: true });
      setHasShared(false);
    }
  }, [
    sex,
    blockDistance,
    flyDistance,
    blockTime,
    flyTime,
    wind,
    reaction,
    router,
  ]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setHasShared(true);
    setTimeout(() => setHasShared(false), 2000);
  }, []);

  const handleBlockDistance = useCallback((value: string) => {
    setBlockDistance(value);
    setBlockTime(defaultBlockTimes[value]);
  }, []);
  const handleFlyDistance = useCallback((value: string) => {
    setFlyDistance(value);
    setFlyTime(defaultFlyTimes[value]);
  }, []);

  const wrappedSetWind = useCallback(wrappedOnChange(setWind, 1), [setWind]);
  const wrappedSetBlockTime = useCallback(wrappedOnChange(setBlockTime, 2), [
    setBlockTime,
  ]);
  const wrappedSetFlyTime = useCallback(wrappedOnChange(setFlyTime, 2), [
    setFlyTime,
  ]);
  const wrappedSetReaction = useCallback(wrappedOnChange(setReaction, 3), [
    setReaction,
  ]);

  return (
    <article className={blogStyles.article}>
      <Meta {...metas} />
      <Title title={metas.title} />
      <section>
        <p>
          Predict your 100m time based on your block and fly times. Wind and
          reaction time are optional. If your times are outside the range of the
          training data, predictions will be less accurate.
        </p>
        <label className={styles.formContainer}>
          <strong>Sex</strong>
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={sex}
              onChange={e =>
                setSex((e.target as HTMLSelectElement).value as Sex)
              }
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
            </select>
          </div>
        </label>
        <label className={styles.formContainer}>
          <strong>Block distance</strong>
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={blockDistance}
              onChange={e =>
                handleBlockDistance((e.target as HTMLSelectElement).value)
              }
            >
              {BLOCK_DISTANCES.map(d => (
                <option value={`${d}`} key={d}>
                  {d}m
                </option>
              ))}
            </select>
          </div>
        </label>
        <label className={styles.formContainer}>
          <strong>Block {blockDistance}</strong>
          <UnitInput
            className={styles.input}
            type="number"
            step="0.01"
            value={blockTime}
            onChange={wrappedSetBlockTime}
            unit="s"
          />
          <small>
            Timed from start to the {blockDistance} meter mark,{" "}
            <b>excluding reaction time</b>. Use FAT timing for accurate
            estimates, or add 0.24s to a hand time.
          </small>
        </label>
        <label className={styles.formContainer}>
          <strong>Fly distance</strong>
          <div className={styles.selectWrapper}>
            <select
              className={styles.select}
              value={flyDistance}
              onChange={e =>
                handleFlyDistance((e.target as HTMLSelectElement).value)
              }
            >
              {FLY_DISTANCES.map(d => (
                <option value={`${d}`} key={d}>
                  {d}m
                </option>
              ))}
            </select>
          </div>
        </label>
        <label className={styles.formContainer}>
          <strong>Fly {flyDistance}</strong>
          <UnitInput
            className={styles.input}
            type="number"
            step="0.01"
            value={flyTime}
            onChange={wrappedSetFlyTime}
            unit="s"
          />
          <small>
            The fastest {flyDistance} meter segment in a run; non-FAT times will
            not produce accurate results.
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
          This predictor is based on log-level regression models trained on
          &gt;2,800 professionally timed men&apos;s and women&apos;s 100m races
          with 10m split data, which is available{" "}
          <a
            href="https://www.athletefirst.org/"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          . A separate model is fit for each combination of sex, block distance,
          and fly distance.
        </p>
        <p>
          The data was cleaned to remove Paralympic athletes and races where the
          athlete was obviously injured. Reaction time was removed from the data
          to isolate the effects of the block and fly times. For races that
          didn&apos;t have reaction time available, the average reaction time
          for the dataset was used.
        </p>
        <p>
          Fly times were converted to velocities (m/s) prior to training the
          models as I suspected velocity would be more predictive. A log-level
          regression was chosen as the data didn&apos;t look linear, and because
          the log-level model produced a significantly better fit than a linear
          model. The trained models have R&sup2; values between 0.92 and 0.99.
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

export const getStaticProps: GetStaticProps<PredictorProps> = async () => {
  const pages = getAllPages();
  return {
    props: {
      pages,
    },
  };
};
