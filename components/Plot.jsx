import React from "react";
import styled from "styled-components";

import LinePlot from "./plots/LinePlot";
import GithubPlot from "./plots/GithubPlot";

const PlotContainer = styled.div`
  flex-basis: 33%;
  margin: 50px 0;

  &:nth-of-type(1),
  &:nth-of-type(2),
  &:nth-of-type(3) {
    margin-top: 0;
  }

  h3 {
    text-align: center;
  }

  @media screen and (max-width: 640px) {
    flex-basis: 100%;

    &:nth-of-type(2),
    &:nth-of-type(3) {
      margin-top: 50px;
    }
  }
`;

export default class Plot extends React.Component {
  render() {
    const Element = (() => {
      switch (this.props.type) {
        case "line":
          return LinePlot;
        case "github":
          return GithubPlot;
        default:
          return LinePlot;
      }
    })();

    return (
      <PlotContainer>
        <h3>{this.props.title || this.props.opts?.datatypes[0]}</h3>
        <Element {...this.props} />
      </PlotContainer>
    );
  }
}
