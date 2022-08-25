import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { prettifyData } from "../../lib/metricsUtils";

const EventCard = styled.div`
  padding: 0.5rem 0.5rem 0.5rem 0;
  text-align: left;
  text-decoration: none;

  h3,
  p {
    margin: 0;
  }
  display: flex;
  flex-direction: column;
  justify-content: center;

  p,
  em {
    font-size: 0.8rem;
  }
`;

export default function Event({ event, idx }) {
  if (!event) return null;

  const title =
    event.data === "hidden"
      ? event.event
      : `${event.event} - ${prettifyData(event.data)}`;
  return (
    <EventCard
      key={`${event.event}.${event.source.major}.${
        event.source.minor
      }.${event.time.toString()}.${idx}`}
    >
      <h3>{title}</h3>
      <p>{event.time.toLocaleString()}</p>
      <em>
        {event.source.major} - {event.source.minor}
      </em>
    </EventCard>
  );
}
