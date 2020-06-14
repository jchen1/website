import Head from "next/head";
import React, { useState, useEffect } from "react";
import styled from "styled-components";

import Header from "../components/Header";
import Event from "../components/api/Event";
import {
  RootContainer,
  MainContainer,
  TitleContainer,
} from "../components/containers";
import InputContainer from "../components/api/InputContainer";
import Widget, { typeOrder } from "../components/api/Widget";

const WSIndicator = styled.div`
  background-color: ${props => props.color};
  height: 1rem;
  width: 1rem;
  border-radius: 50%;
  display: inline-block;
  margin-left: 1rem;
`;

const FeedContainer = styled.div`
  padding: 0 2rem;
  max-height: 40rem;
  flex: 1 1 33%;
  @media screen and (max-width: 640px) {
    flex: 1 1 100%;
  }
`;

const WidgetContainer = styled.div`
  padding: 0 2rem;
  flex: 1 1 67%;
  display: flex;
  flex-wrap: wrap;
  @media screen and (max-width: 640px) {
    flex: 1 1 100%;
    padding: 0;
  }
`;

const EventContainer = styled.div`
  overflow-y: auto;
  height: 100%;
`;

const InnerContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row-reverse;
  @media screen and (max-width: 640px) {
    flex-wrap: wrap;
  }
`;

function connect(setEvents, setWs) {
  const url = `wss://${process.env.NEXT_PUBLIC_APISERVER_BASE_URL}:444`;
  const ws = new WebSocket(url);
  ws.onmessage = event => {
    const response = JSON.parse(event.data);

    setEvents(events => {
      const nextEvents = response.events.reduce(
        (acc, event) => {
          if (event.event === "all" || event.event === "keys") {
            console.warn(`unsupported event type ${event.event}, skipping`);
            return acc;
          }
          event.time = new Date(event.time);
          if (!acc.hasOwnProperty("all")) {
            acc.all = [];
          }
          acc.all.push(event);

          // only store one event per minute for widgets
          const key = `${event.event}-${Math.floor(
            event.time.getTime() / 1000 / 60
          )}`;
          if (!events.keys.hasOwnProperty(key)) {
            events.keys[key] = true;

            if (!acc.hasOwnProperty(event.event)) {
              acc[event.event] = { events: [], last: [] };
            }
            if (["int", "bigint", "real"].includes(event.type)) {
              acc[event.event].last.push(event);
              acc[event.event].last = acc[event.event].last.filter(
                e => event.time.getTime() - e.time.getTime() < 1000 * 60 * 15
              );

              event.dataAvg =
                acc[event.event].last.reduce((s, e) => s + e.data, 0) /
                Math.max(1, acc[event.event].last.length);
            }

            acc[event.event].events.push(event);
          }

          return acc;
        },
        // make a copy so react knows it changed
        { ...events }
      );

      return Object.keys(nextEvents).reduce((acc, key) => {
        if (key === "all" || key === "keys") {
          acc[key] = nextEvents[key];
        } else {
          acc[key] = {
            events: [...nextEvents[key].events].sort(
              (a, b) => a.time.getTime() - b.time.getTime()
            ),
            last: nextEvents[key].last,
          };
        }

        return acc;
      }, {});
    });
  };

  ws.onclose = () =>
    setTimeout(() => {
      const ws = connect(setEvents, setWs);
      return setWs(ws);
    }, 1000);

  return ws;
}

export default function Api() {
  const [hours, setHours] = useState(24);
  const [events, setEvents] = useState({ all: [], keys: {} });
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const ws = connect(setEvents, setWs);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "connect", hours }));
    };

    setWs(ws);
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "historical", hours }));
    }
    setEvents({ all: [], keys: {} });
  }, [hours]);

  const eventRows = events.all
    .slice(events.all.length - 100)
    .reverse()
    .map((event, i) => Event({ event, idx: i }));

  const socketColor = (function () {
    // if server-side rendered
    if (!ws) return "#f03009";

    const socketState = ws.readyState;
    switch (socketState) {
      case WebSocket.OPEN:
        return "#68b723";
      case WebSocket.CONNECTING:
        return "#f37329";
      // CLOSING/CLOSED/NULL
      default:
        return "#f03009";
    }
  })();

  const miniWidgets = typeOrder.map(type => (
    <Widget key={type} type={type} events={events[type]} />
  ));

  const widgets = (
    <InnerContainer>
      <WidgetContainer>{miniWidgets}</WidgetContainer>
      <FeedContainer>
        <h2>
          Raw Event Feed <br /> ({events.all.length} received)
        </h2>
        <EventContainer>{eventRows}</EventContainer>
      </FeedContainer>
    </InnerContainer>
  );

  return (
    <MainContainer>
      <Head>
        <title key="title">api.jeffchen.dev</title>
      </Head>
      <TitleContainer>
        <h1>Metrics</h1>
        <WSIndicator color={socketColor} />
      </TitleContainer>
      <InputContainer
        ws={ws}
        hours={hours}
        setHours={setHours}
      ></InputContainer>
      {widgets}
    </MainContainer>
  );
}
