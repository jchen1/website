import Head from "next/head";
import React, { useState, useEffect } from "react";

import styled from "styled-components";

import Event from "../components/metrics/Event";
import {
  MainContainer,
  TabContainer,
  TitleContainer,
} from "../components/containers";

import {
  Colors,
  metrics,
  FrequentMetrics,
  InfrequentMetrics,
  AllMetrics,
  metricType,
} from "../lib/constants";
import {
  useGlobalState,
  addFrequentMetrics,
  addInfrequentMetrics,
} from "../lib/state";
import { Plot } from "../components/charts";
import { transformEvents } from "../lib/util";
import { getEvents, connect } from "../lib/api";

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
    flex: 1 1 100%;
    padding: 0;
  }
`;

const PlotContainer = styled.div`
  flex-basis: 100%;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  max-height: 60vh;
  overflow-y: auto;

  @media screen and (max-width: 640px) {
    max-height: initial;
    overflow: initial;
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
  const [frequentMetrics] = useGlobalState("frequentMetrics");
  const [infrequentMetrics] = useGlobalState("infrequentMetrics");

  const [activeTab, setActiveTab] = useState("Personal");
  const [socketColor, setSocketColor] = useState(Colors.RED);

  const [loadState, setLoadState] = useState("loading");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { infrequent, frequent } = await getEvents();
        addInfrequentMetrics(infrequent);
        addFrequentMetrics(frequent);
        setLoadState("loaded");
      } catch (e) {
        console.error(e);
        setLoadState("error");
      }
    };
    fetchData();

    const ws = connect(
      ws => {
        ws.send(
          JSON.stringify({
            type: "connect",
            eventFilter: Object.keys(FrequentMetrics),
          })
        );
        setWs(ws);
      },
      (ws, msg) => {
        const response = JSON.parse(event.data);
        addFrequentMetrics(response.events);
      }
    );
    setWs(ws);

    return () => ws.close();
  }, []);

  const nextSocketColor = getSocketColor(ws);
  if (nextSocketColor !== socketColor) {
    setSocketColor(nextSocketColor);
  }

  const tabs = Object.keys(metrics).map(t => ({ name: t, value: t }));

  const plots = (() => {
    if (loadState === "loading") return <h2>Loading...</h2>;
    if (loadState === "error") return <h2>Error loading plots...</h2>;
    return metrics[activeTab]
      .map(e => AllMetrics[e])
      .map(e => [
        e,
        transformEvents(
          metricType(e.name) === "infrequent"
            ? infrequentMetrics
            : frequentMetrics,
          e.name,
          e
        ),
      ])
      .filter(([e, d]) => d[0].length > 0)
      .map(([e, d]) => <Plot title={e.title} key={e.name} data={d} opts={e} />);
  })();

  return (
    <MainContainer>
      <Head>
        <title key="title">Metrics</title>
      </Head>
      <TitleContainer>
        <h1>Metrics</h1>
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
    </MainContainer>
  );
}
