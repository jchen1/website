import moment from "moment";
import styled from "styled-components";

import { Colors } from "../../lib/metrics";

const Container = styled.div`
  display: flex;
  padding: 1rem;
  border: 1px solid ${Colors.DARKER_GRAY};
  align-items: center;
  justify-content: center;

  flex-basis: min(250px, 33%);
  min-width: 250px;
  margin: 1rem;
`;

const Square = styled.div`
  height: auto;
  flex-grow: 1;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  &:after {
    content: "";
    display: block;
    padding-bottom: 100%;
  }
`;

const InnerContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;

  align-items: center;
  justify-content: start;

  > *:first-child {
    margin-bottom: 1rem;
  }
`;

const Data = styled.p`
  font-size: 32px;
  font-weight: 900;
`;

export default function LatestPlot({ data, title, opts }) {
  const maxIndex = data[0].indexOf(Math.max.apply(Math, data[0]));
  const latestMeasurement = new Date(data[0][maxIndex] * 1000);
  const currentValue = data[1][maxIndex];

  return (
    <Container>
      <Square>
        <InnerContainer>
          <h4>{title}</h4>
          <Data>
            {typeof currentValue === "number"
              ? Math.round(currentValue * 100) / 100
              : currentValue}{" "}
            {opts?.unit}
          </Data>
          <small>
            <em>{moment(latestMeasurement).format("M/DD h:mm A")}</em>
          </small>
        </InnerContainer>
      </Square>
    </Container>
  );
}
