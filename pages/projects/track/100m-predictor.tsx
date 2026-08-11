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

  const outOfRange =
    blockTime < cell.blockRange[0] ||
    blockTime > cell.blockRange[1] ||
    flyVelocity < cell.velocityRange[0] ||
    flyVelocity > cell.velocityRange[1];

  return {
    time: predicted - windCorrection + reaction,
    rmse: cell.rmse,
    outOfRange,
  };
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

  const prediction = predict100m(
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
          Predict your 100m time from a block start and a fly sprint. Pick the
          distances you actually measure — longer segments, especially longer
          flys, give noticeably more accurate predictions. Wind and reaction
          time are optional.
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
          <small>
            Separate models trained on men&apos;s and women&apos;s races.
          </small>
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
          <small>
            A fly 20 cuts the prediction error by about a third versus a fly 10;
            a fly 30 nearly halves it.
          </small>
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
            Your fastest {flyDistance} meter segment, run fresh off a full
            run-in (20&ndash;40m); non-FAT times will not produce accurate
            results.
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
            value={prediction?.time.toFixed(2)}
            unit="s"
          />
          {prediction && (
            <small>
              &plusmn;{prediction.rmse.toFixed(2)}s expected error for this
              input combination.
              {prediction.outOfRange && (
                <>
                  {" "}
                  <b>
                    Your inputs are outside the range of the training data, so
                    this prediction is an extrapolation.
                  </b>
                </>
              )}
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
      </section>

      <section className={styles.methodology}>
        <h2>Methodology</h2>
        <p>
          This predictor is based on log-level regression models trained on
          professionally timed 100m races with 10m split data from{" "}
          <a
            href="https://www.athletefirst.org/"
            target="_blank"
            rel="noreferrer"
          >
            athletefirst.org
          </a>{" "}
          — 1,533 men&apos;s races (9.58&ndash;12.38s) and 1,301 women&apos;s
          races (10.54&ndash;13.75s). A separate equation is fit for every
          combination of sex, block distance, and fly distance, and the
          calculator swaps equations based on your selections. The expected
          error shown with the prediction is that equation&apos;s 10-fold
          cross-validated RMSE.
        </p>
        <p>
          The data was cleaned to remove Paralympic athletes, races where the
          athlete was obviously injured, and physically implausible splits.
          Reaction time was removed from the data to isolate the effects of the
          block and fly segments; for races without a recorded reaction time,
          the dataset average was used. Fly times are converted to velocities
          before fitting. Fly segments are the fastest stretch of the race at
          the given length, which is what a fresh practice fly with a normal
          run-in approximates &mdash; short run-ins (under ~20m) will read slow
          and skew the prediction slightly slow.
        </p>
        <p>
          Men&apos;s and women&apos;s models are fit separately: at short fly
          distances the sexes fade differently over the final 40m, so a shared
          curve would bias women&apos;s predictions by about +0.05s. Analysis
          code and data live in{" "}
          <a
            href="https://github.com/jchen1/100m-analysis"
            target="_blank"
            rel="noreferrer"
          >
            jchen1/100m-analysis
          </a>
          .
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
