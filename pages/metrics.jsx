import React, { useState, useEffect } from "react";

import styled from "styled-components";
import "uplot/dist/uPlot.min.css";

import TabContainer from "../components/containers/TabContainer";
import TitleContainer from "../components/containers/TitleContainer";

import { Colors, Plots, FrequentMetrics, metricType } from "../lib/metrics";
import { useGlobalState, addMetrics } from "../lib/state";
import { Plot } from "../components/charts";
import { transformEvents } from "../lib/metricsUtils";
import { getEvents, connect } from "../lib/api";
import Meta from "../components/Meta";

const WSIndicator = styled.div`
  background-color: ${props => props.color};
  height: 1rem;
  width: 1rem;
  border-radius: 50%;
  display: inline-block;
  margin-left: 1rem;
`;

const WidgetTabContainer = styled.div`
  padding: 0 2rem;
  flex: 1 1 67%;
  display: flex;
  flex-wrap: wrap;
  border-radius: 5px;

  @media screen and (max-width: 640px) {
    border: 0;
    flex: 1 0 100%;
    padding: 0;
    overflow-x: auto;
  }
`;

const PlotContainer = styled.div`
  flex-basis: 100%;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  max-height: 60vh;
  overflow-y: auto;
  gap: 1rem;

  @media screen and (max-width: 640px) {
    max-height: initial;
    overflow: initial;
    align-items: center;
    justify-content: center;
  }
`;

const InnerContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row-reverse;
  @media screen and (max-width: 640px) {
    flex-wrap: wrap;
  }
`;

const Title = styled.h1`
  border: 0;
  box-shadow: unset;
  padding: 0;
  background-color: unset;
`;

function getSocketColor(ws) {
  if (!ws) return Colors.RED;

  switch (ws.readyState) {
    case WebSocket.OPEN:
      return Colors.GREEN;
    case WebSocket.CONNECTING:
      return Colors.YELLOW;
    // CLOSING/CLOSED/NULL
    default:
      return Colors.RED;
  }
}

export default function Metrics() {
  const [ws, setWs] = useGlobalState("ws");
  const [metrics] = useGlobalState("metrics");

  const [activeTab, setActiveTab] = useState("Now");
  const [socketColor, setSocketColor] = useState(Colors.RED);

  const [loadState, setLoadState] = useState("loading");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { infrequent, frequent } = await getEvents();
        addMetrics(infrequent.concat(frequent));
        setLoadState("loaded");
      } catch (e) {
        console.error(e);
        setLoadState("error");
      }
    };
    void fetchData();

    const ws = connect(
      ws => {
        ws.send(
          JSON.stringify({
            type: "connect",
            eventFilter: FrequentMetrics,
          })
        );
        setWs(ws);
      },
      (ws, msg) => {
        const response = JSON.parse(event.data);
        addMetrics(response.events);
      }
    );
    setWs(ws);

    return () => ws.close();
  }, [setWs]);

  const nextSocketColor = getSocketColor(ws);
  if (nextSocketColor !== socketColor) {
    setSocketColor(nextSocketColor);
  }

  const tabs = Object.keys(Plots).map(t => ({ name: t, value: t }));
  const plots = (() => {
    if (loadState === "loading") return <h2>Loading...</h2>;
    if (loadState === "error") return <h2>Error loading plots...</h2>;
    return Plots[activeTab]
      .map(e => [e, transformEvents(metrics, e.datatypes, e)])
      .filter(([e, d]) => d[0].length > 0)
      .map(([e, d]) => (
        <Plot
          title={e.title}
          key={`${e.title}-${e.datatypes.toString()}`}
          data={d}
          opts={e}
          type={e.plotType || "line"}
        />
      ));
  })();

  const metas = {
    title: "Metrics",
    description: "Metrics",
  };

  return (
    <>
      <Meta {...metas} />
      <TitleContainer>
        <Title>Metrics</Title>
        <WSIndicator color={socketColor} />
      </TitleContainer>
      <InnerContainer>
        <WidgetTabContainer>
          <TabContainer
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <PlotContainer>{plots}</PlotContainer>
        </WidgetTabContainer>
      </InnerContainer>
    </>
  );
}
