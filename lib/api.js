import { FrequentMetrics, InfrequentMetrics } from "../lib/constants";

function constructQuery(start, period, events) {
  const query = {
    start: start.getTime(),
    period,
    include: events.join(","),
  };

  return new URLSearchParams(query).toString();
}

export async function getEvents() {
  const requests = {
    infrequent: fetch(
      `https://${
        process.env.NEXT_PUBLIC_APISERVER_BASE_URL
      }/events?${constructQuery(
        new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        "hour",
        InfrequentMetrics
      )}`
    ),
    frequent: fetch(
      `https://${
        process.env.NEXT_PUBLIC_APISERVER_BASE_URL
      }/events?${constructQuery(
        new Date(Date.now() - 1000 * 60 * 60 * 12),
        "minute",
        FrequentMetrics
      )}`
    ),
  };

  await Promise.all(Object.values(requests));

  return {
    infrequent: await (await requests.infrequent).json(),
    frequent: await (await requests.frequent).json(),
  };
}

export function connect(onopen, onmessage, onclose) {
  const url = `wss://${process.env.NEXT_PUBLIC_APISERVER_BASE_URL}:444`;
  const ws = new WebSocket(url);

  if (onopen) {
    ws.onopen = ev => onopen(ws, ev);
  }

  if (onmessage) {
    ws.onmessage = ev => onmessage(ws, ev);
  }

  if (onclose) {
    ws.onclose = ev => onclose(ws, ev);
  }

  return ws;
}
