import React, { useEffect, useState } from "react";

import TitleContainer from "components/containers/TitleContainer";

import sha256 from "lib/util/sha256";

import styles from "styles/components/TwentySix.module.scss";

import type ConfettiGenerator from "confetti-js";

function hashAnswer(answer: string | number) {
  return sha256(`${answer}`);
}

interface CodeProps {
  clue: string;
  numDigits: number;
  answerHash: string;
  reward: string;
  hint?: string;
}

function Code({ clue, numDigits, answerHash, reward, hint }: CodeProps) {
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(
    null,
  );
  const [answer, setAnswer] = useState<string | number>(0);

  const wrappedSetAnswer = (e: Event) =>
    setAnswer((e.target as HTMLInputElement).value);

  const checkAnswer = () => {
    setAnsweredCorrectly(hashAnswer(answer) === answerHash);
  };

  useEffect(() => {
    if (answeredCorrectly) {
      if (localStorage.getItem(clue) !== "true") {
        // setItem stringifies the boolean it is handed
        localStorage.setItem(clue, answeredCorrectly as unknown as string);

        let confetti: ConfettiGenerator | undefined;
        let cancelled = false;

        // if the chunk fails to load, the clue stays solved and the one-time
        // confetti is simply skipped
        void import("confetti-js")
          .then(({ default: ConfettiGenerator }) => {
            if (cancelled) return;

            const confettiSettings = { target: "confetti-canvas" };
            confetti = new ConfettiGenerator(confettiSettings);
            confetti.render();

            setTimeout(() => confetti?.clear(), 5000);
          })
          .catch(() => undefined);

        return () => {
          cancelled = true;
          confetti?.clear();
        };
      }
    }
  }, [answeredCorrectly, clue]);

  useEffect(() => {
    const item = localStorage.getItem(clue);
    if (item === "true") {
      setAnsweredCorrectly(true);
    }
  }, [clue]);

  return (
    <div className={styles.codeContainer}>
      <label htmlFor={clue}>
        {" "}
        {clue} ({numDigits} {numDigits == 1 ? "digit" : "digits"}){" "}
      </label>
      <div className={styles.clueContainer}>
        <input
          id={clue}
          pattern="0-9"
          value={answer}
          onChange={wrappedSetAnswer}
          disabled={answeredCorrectly!}
        />
        <button onClick={checkAnswer} disabled={answeredCorrectly!}>
          Guess!
        </button>
      </div>

      {answeredCorrectly && (
        <p>
          That&apos;s right! Your reward is: <br />
          <strong>{reward}</strong>!
        </p>
      )}
      {answeredCorrectly === false && (
        <p style={{ color: "red" }}>
          Sorry, try again!{" "}
          {hint && (
            <>
              <br />
              Hint: {hint}
            </>
          )}
        </p>
      )}
    </div>
  );
}

export default function TwentySix() {
  const clues = [
    {
      clue: "Warmup: how old are you?",
      numDigits: 2,
      answerHash:
        "5f9c4ab08cac7457e9111a30e4664920607ea2c115a1433d7be98e97e64244ca",
      reward: "One birthday kiss",
    },
    {
      clue: "How many months we've been together",
      numDigits: 2,
      answerHash:
        "cd70bea023f752a0564abb6ed08d42c1440f2e33e29914e55e0be1595e24f45a",
      reward: "15 complaint-free hand and foot warmups",
      hint: "I might be off by one",
    },
    {
      clue: "The number of places we've lived in",
      numDigits: 1,
      answerHash:
        "e7f6c011776e8db7cd330b54174fd76f7d0216b612387a5ffcfb81e6f0919683",
      hint: "Only places we've been in for at least a month",
      reward: "5 at-least-15-minute neck massages",
    },
    {
      clue: "What your passcode really should be",
      numDigits: 6,
      answerHash:
        "0fc4edba0a8793145290d36de2ac61288f6a78856fa5efe9e45ea0c46c3337a4",
      reward: "No chores for a week",
      hint: "Is the year right?",
    },
    {
      clue: "The number you never remember",
      numDigits: 10,
      answerHash:
        "98e60144d4d7601c9f1607dfc1e6038e4c30fe5a61e7f5623919596d4e3ad6c2",
      reward: "A thousand-dollar shopping spree",
    },
  ];

  return (
    <div className={styles.outerContainer}>
      <canvas id="confetti-canvas" style={{ position: "absolute" }} />
      <TitleContainer>
        <h1 className={styles.title}>Happy Birthday!</h1>
      </TitleContainer>
      <h4>Guess the secret codes for rewards</h4>
      <div className={styles.innerContainer}>
        {clues.map((c, i) => (
          <Code {...c} key={i} />
        ))}
      </div>
    </div>
  );
}
