import React from "react";
import styled from "styled-components";

import LinePlot from "./plots/LinePlot";
import GithubPlot from "./plots/GithubPlot";
import LatestPlot from "./plots/LatestPlot";

const PlotContainer = styled.div`
  // https://stackoverflow.com/questions/49174998/incorrect-width-flex-items-with-gap-and-fixed-flex-basis
  // gap is 1rem
  flex-basis: calc((100% - 2rem) / 3);

  h3 {
    text-align: center;
  }

  @media screen and (max-width: 640px) {
    flex-basis: 100%;
  }
`;

export default function Plot(props) {
  const { type, title, opts } = props;

  const Element = (() => {
    switch (type) {
      case "line":
        return LinePlot;
      case "github":
        return GithubPlot;
      case "latest":
        return LatestPlot;
      default:
        return LinePlot;
    }
  })();

  if (opts?.noContainer === true) {
    return <Element {...props} />;
  }

  return (
    <PlotContainer>
      <h3>{title || opts?.datatypes[0]}</h3>
      <Element {...props} />
    </PlotContainer>
  );
}
