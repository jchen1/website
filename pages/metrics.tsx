import React, { useState, useEffect } from "react";

import "uplot/dist/uPlot.min.css";

import TabContainer from "../components/containers/TabContainer";
import TitleContainer from "../components/containers/TitleContainer";

import { Colors, Plots, FrequentMetrics, metricType } from "../lib/metrics";
import { useGlobalState, addMetrics } from "../lib/state";
import { Plot } from "../components/charts";
import { transformEvents } from "../lib/metricsUtils";
import { getEvents, connect } from "../lib/api";
import Meta from "../components/Meta";

import styles from "styles/components/Metrics.module.scss";

import type { PlotConfig } from "../lib/metrics";
import type { SeriesData } from "../lib/metricsUtils";

function getSocketColor(ws: WebSocket | null) {
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

  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

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
          }),
        );
        setWs(ws);
      },
      (ws, msg) => {
        // reads the deprecated global `window.event` rather than `msg`
        const response = JSON.parse((event as MessageEvent).data);
        addMetrics(response.events);
      },
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
      .map((e): [PlotConfig, SeriesData] => [
        e,
        transformEvents(metrics, e.datatypes, e),
      ])
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
        <h1 className={styles.title}>Metrics</h1>
        <div
          className={styles.wsIndicator}
          style={{ backgroundColor: socketColor }}
        />
      </TitleContainer>
      <div className={styles.innerContainer}>
        <div className={styles.widgetTabContainer}>
          <TabContainer
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <div className={styles.plotContainer}>{plots}</div>
        </div>
      </div>
    </>
  );
}
