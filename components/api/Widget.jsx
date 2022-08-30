import React, { useReducer, useEffect } from "react";
import styled from "styled-components";
import {
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import { last, prettifyData } from "../../lib/metricsUtils";

const WidgetText = styled.h1`
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WidgetWrapper = styled.div`
  width: 45%;
  flex-grow: 0;

  h2 {
    text-align: center;
  }

  @media screen and (max-width: 640px) {
    width: 100%;
  }

  text.recharts-cartesian-axis-tick-value {
    user-select: none;
  }
`;

function TextWidget({ events, opts }) {
  const value = last(events, {}).data;
  const formatter = opts.formatter || prettifyData;

  return <WidgetText>{value ? formatter(value) : "---"}</WidgetText>;
}

function dateToHours(date) {
  const d = new Date(date);
  const hours = ((d.getHours() + 11) % 12) + 1;
  return `${hours}${d.getHours() >= 12 ? "PM" : "AM"}`;
}

function dateToTime(date) {
  const d = new Date(date);

  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function LineWidget({ events, opts }) {
  const formatter = (value, name, props) => [
    prettifyData(value),
    opts.units || "data",
  ];
  const { xDomain, yDomain, scale } = opts;

  const [renderCount, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    forceUpdate();
  }, [events]);

  if (events.length === 0) {
    return <WidgetText>---</WidgetText>;
  }

  // todo import scss colors
  return (
    <ResponsiveContainer width="100%" aspect={2}>
      <LineChart data={events} key={renderCount}>
        <Line
          type="monotone"
          dataKey="dataAvg"
          stroke="#f03009"
          dot={false}
          isAnimationActive={false}
        />
        <XAxis
          dataKey={v => v.time.getTime()}
          tickFormatter={dateToHours}
          interval="preserveStartEnd"
          scale="time"
          type="number"
          domain={xDomain || ["dataMin", "dataMax"]}
        />
        <YAxis
          domain={yDomain || ["auto", "auto"]}
          tickFormatter={n => Math.round(n)}
          interval="preserveStartEnd"
          scale={scale || "auto"}
        />
        <Tooltip formatter={formatter} labelFormatter={dateToTime} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const types = {
  hr: {
    title: "Heart Rate",
    units: "bpm",
    display: "line",
    yDomain: [min => Math.min(min - 10, 40), max => Math.max(max + 20, 150)],
    scale: "linear",
  },
  awair_score: {
    title: "Awair Score",
    display: "line",
    yDomain: [min => Math.min(min - 10, 50), 100],
  },
  co2: {
    title: "CO2",
    units: "ppm",
    display: "line",
  },
  temp: {
    title: "Temperature",
    units: "°F",
    display: "line",
  },
  voc: {
    title: "VOC",
    units: "ppb",
    display: "line",
  },
  humid: {
    title: "Humidity",
    units: "%",
    display: "line",
  },
  resting_heart_rate: {
    title: "RHR",
    units: "bpm",
    display: "text",
  },
  strain: {
    title: "Strain (0-21)",
    display: "text",
  },
  sleep: {
    title: "Sleep",
    display: "text",
    formatter: ({ duration, score, needs }) =>
      `${score}: ${prettifyData(duration / 1000 / 60 / 60)} / ${prettifyData(
        needs.total / 1000 / 60 / 60
      )}`,
  },
  recovery: {
    title: "Recovery (0-100)",
    display: "text",
  },
  hrv: {
    title: "HRV",
    units: "ms",
    display: "text",
    formatter: data => prettifyData(data * 1000),
  },
};

const widgetDisplays = {
  line: LineWidget,
  text: TextWidget,
};

export const typeOrder = Object.keys(types);

export default function Widget(props) {
  const type = props.type;
  const events = (props.events || {}).events || [];

  if (!types[type]) {
    return null;
  }

  const opts = types[type];
  const { title, units, display } = opts;
  const DisplayTag = widgetDisplays[display];

  if (!DisplayTag) {
    return null;
  }

  return (
    <WidgetWrapper>
      <h2>
        {title}
        {units ? ` (${units})` : ""}
      </h2>
      <DisplayTag events={events} opts={opts}></DisplayTag>
    </WidgetWrapper>
  );
}
