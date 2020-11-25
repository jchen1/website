import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { lighten } from "polished";

import { Colors } from "../../lib/metrics";

const COL_SIZE = 7;

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin: 1.5rem 2.5rem 0;
  /* padding-top: 0.5rem; */
  border: 1px solid ${Colors.DARKER_GRAY};
`;

const Square = styled.div`
  flex-basis: ${100 / COL_SIZE}%;
  background-color: ${props => lighten(props.score, Colors.RED)};

  &:after {
    content: "";
    display: block;
    padding-bottom: 100%;
  }
`;

export default function GithubPlot({ data }) {
  data[0] = data[0].map(t => Math.floor(t / 60 / 60 / 24) * 60 * 60 * 24);

  const start = new Date(data[0][0] * 1000);
  const end = new Date(data[0][data[0].length - 1] * 1000);

  const numSquares =
    Math.floor(end.getTime() / 1000 / 60 / 60 / 24) -
    Math.floor(start.getTime() / 1000 / 60 / 60 / 24);

  const max = Math.max(...data[1]);

  // only ever show full rows
  const squares = new Array(numSquares - (numSquares % 7))
    .fill(0)
    .map((_, idx) => {
      const time =
        (start.getTime() + (idx + (numSquares % 7)) * 1000 * 60 * 60 * 24) /
        1000;
      const dataIdx = data[0].indexOf(time);

      const val = dataIdx >= 0 ? data[1][dataIdx] : 0;
      // todo hover tooltips
      return <Square key={idx} score={val / max} />;
    });

  return <Container>{squares}</Container>;
}
