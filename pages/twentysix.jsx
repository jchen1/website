import sha256 from "crypto-js/sha256";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ConfettiGenerator from "confetti-js";

import TitleContainer from "components/containers/TitleContainer";

const Title = styled.h1`
  border: 0;
  box-shadow: unset;
  padding: 0;
  background-color: unset;
`;

const InnerContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  height: 100%;
  flex-grow: 1;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const OuterContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  align-items: center;
`;

function hashAnswer(answer) {
  return sha256(`${answer}`).toString();
}

const CodeContainer = styled.div`
  width: calc(50% - 2rem);
  border: 1px solid var(--primary-gray);
  border-radius: 5px;
  margin: 0.25rem;
  padding: 0.5rem;

  @media screen and (max-width: 640px) {
    width: 100%;
    margin-bottom: 1rem;
    padding: 1rem;
  }

  label {
    display: block;
    margin-bottom: 1rem;
  }
`;

const ClueContainer = styled.div`
  width: 100%;
  display: flex;

  input {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    padding: 10px 10px;
    border: 1px solid var(--secondary);
    flex-grow: 1;
  }

  button {
    background-color: var(--secondary);
    border: 1px solid var(--secondary);
    border-left: 0;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    padding: 10px 10px;
    color: white;

    transition: background-color ease-in 0.25s;

    &:active, &:hover {
      cursor: pointer;
      background-color: var(--black);
    }

    &:disabled {
      background-color: var(--secondary) !important;
    }
  }
`;

function Code({ clue, numDigits, answerHash, reward, hint }) {
  console.log({ clue, answerHash });
  const [answeredCorrectly, setAnsweredCorrectly] = useState(null);
  const [answer, setAnswer] = useState(0);

  const wrappedSetAnswer = e => setAnswer(e.target.value);

  const checkAnswer = () => {
    console.log({ answer, hash: hashAnswer(answer), answerHash });
    setAnsweredCorrectly(hashAnswer(answer) === answerHash);
  };

  useEffect(() => {
    if (answeredCorrectly) {
      if (localStorage.getItem(clue) !== 'true') {
        localStorage.setItem(clue, answeredCorrectly);

        const confettiSettings = { target: 'confetti-canvas' };
        const confetti = new ConfettiGenerator(confettiSettings);
        confetti.render();

        setTimeout(() => confetti.clear(), 5000);

        return () => confetti.clear();
      }
    }
  }, [answeredCorrectly, clue]);

  useEffect(() => {
    const item = localStorage.getItem(clue);
    if (item === 'true') {
      setAnsweredCorrectly(true);
    }
  }, [clue]);

  return (
    <CodeContainer>
        <label htmlFor={clue}> {clue} ({numDigits} {numDigits == 1 ? "digit" : "digits"}) </label>
        <ClueContainer>
          <input id={clue} pattern="0-9" value={answer} onChange={wrappedSetAnswer} disabled={answeredCorrectly}/>
          <button onClick={checkAnswer} disabled={answeredCorrectly}>Guess!</button>
      </ClueContainer>

      {answeredCorrectly && <p>That's right! Your reward is: <br /><strong>{reward}</strong>!</p>}
      {answeredCorrectly === false && <p style={{ color: "red" }}>Sorry, try again! {hint && <><br />Hint: {hint}</>}</p>}
    </CodeContainer>
  )
}


export default function TwentySix() {
  const clues = [{
    clue: "Warmup: how old are you?",
    numDigits: 2,
    answerHash: "5f9c4ab08cac7457e9111a30e4664920607ea2c115a1433d7be98e97e64244ca",
    reward: "One birthday kiss"
  }, {
    clue: "How many months we've been together",
    numDigits: 2,
    answerHash: "cd70bea023f752a0564abb6ed08d42c1440f2e33e29914e55e0be1595e24f45a",
    reward: "15 complaint-free hand and foot warmups",
    hint: "I might be off by one"
  }, {
    clue: "The number of places we've lived in",
    numDigits: 1,
    answerHash: "e7f6c011776e8db7cd330b54174fd76f7d0216b612387a5ffcfb81e6f0919683",
    hint: "Only places we've been in for at least a month",
    reward: "5 at-least-15-minute neck massages"
  }, {
    clue: "What your passcode really should be",
    numDigits: 6,
    answerHash: "0fc4edba0a8793145290d36de2ac61288f6a78856fa5efe9e45ea0c46c3337a4",
    reward: "No chores for a week",
    hint: "Is the year right?"
  }, {
    clue: "The number you never remember",
    numDigits: 10,
    answerHash: "98e60144d4d7601c9f1607dfc1e6038e4c30fe5a61e7f5623919596d4e3ad6c2",
    reward: "A thousand-dollar shopping spree"
  }];

  return (
    <OuterContainer>
      <canvas id="confetti-canvas" style={{ position: "absolute" }}/>
      <TitleContainer>
        <Title>Happy Birthday!</Title>
      </TitleContainer>
      <h4>Guess the secret codes for rewards</h4>
      <InnerContainer>
        {clues.map((c, i) => <Code {...c} key={i} />)}
      </InnerContainer>
    </OuterContainer>
  );
}
