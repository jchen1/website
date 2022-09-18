import moment from "moment";
import styled from "styled-components";

import { Colors } from "../../lib/metrics";

const SQUARE_SIZE_PX = 200;

const Container = styled.div`
  display: flex;

  border: 1px solid ${Colors.DARKER_GRAY};
  align-items: center;
  justify-content: center;

  flex-basis: ${SQUARE_SIZE_PX}px;
  gap: 1rem;

  @media screen and (max-width: 640px) {
    flex-basis: calc((100% - 1rem) / 2);
    min-width: initial;
  }
`;

const Square = styled.div`
  height: auto;
  flex-grow: 1;
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  padding: 1rem;

  &:after {
    content: "";
    display: block;
    padding-bottom: 100%;
  }
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;

  align-items: flex-start;
  justify-content: space-between;
`;

const DataHeading = styled.p`
  font-size: 14px;
  margin: 0;
`;

const Data = styled.svg`
  flex-grow: 1;
  width: 100%;

  > text {
    font-weight: 900;
  }
`;

const DataTime = styled.p`
  font-size: 14px;
  margin: 0;
  font-style: italic;
`;

export default function LatestPlot({ data, title, opts }) {
  const maxIndex = data[0].indexOf(Math.max.apply(Math, data[0]));
  const latestMeasurement = new Date(data[0][maxIndex] * 1000);
  const currentValue = data[1][maxIndex];

  return (
    <Container>
      <Square>
        <InnerContainer>
          <DataHeading>{title}</DataHeading>
          <Data viewBox="0 0 500 200" preserveAspectRatio="xMinYMin">
            <text
              y="50%"
              textAnchor="left"
              fontSize="100px"
              alignmentBaseline="central"
              dominantBaseline="central"
            >
              {typeof currentValue === "number"
                ? Math.round(currentValue * 100) / 100
                : currentValue}{" "}
              {opts?.unit}
            </text>
          </Data>
          <DataTime>{moment(latestMeasurement).format("M/DD h:mm A")}</DataTime>
        </InnerContainer>
      </Square>
    </Container>
  );
}
