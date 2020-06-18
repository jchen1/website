import { frequencies } from "./util";

export const Colors = {
  BLUE: "#4183C4",
  RED: "#F03009",
  GREEN: "#68B723",
  YELLOW: "#F37329",
  BLACK: "#090909",
  DARKER_GRAY: "#222222",
  DARK_GRAY: "#333333",
  GRAY: "#666666",
  LIGHT_GRAY: "#EEEEEE",
  WHITE: "#FBFBFB",
};

export const InfrequentMetrics = {
  body_fat: {
    name: "body_fat",
    title: "Body Fat",
    unit: "%",
    mapper: data => data * 100,
  },
  hrv: {
    name: "hrv",
    title: "Heart Rate Variability",
    unit: "ms",
    mapper: data => data * 1000,
  },
  lean_body_mass: {
    name: "lean_body_mass",
    title: "Lean Body Mass",
    unit: "lbs",
  },
  recovery: {
    name: "recovery",
    title: "Recovery",
    unit: "%",
  },
  resting_heart_rate: {
    name: "resting_heart_rate",
    title: "Resting Heart Rate",
    unit: "bpm",
  },
  sc2_ranking: {
    name: "sc2_ranking",
    title: "SC2 MMR",
    mapper: data => data.mmr,
  },
  sleep: {
    name: "sleep",
    title: "Sleep",
    unit: "hours",
    mapper: data => data.duration / 1000 / 60 / 60,
  },
  strain: {
    name: "strain",
    title: "Daily Strain",
  },
  weight: {
    name: "weight",
    title: "Weight",
    unit: "lbs",
  },
  energy: {
    name: "energy",
    title: "Energy",
  },
  mood: {
    name: "mood",
    title: "Mood",
  },
  stress: {
    name: "stress",
    title: "Stress",
  },
  workout: {
    name: "workout",
    title: "Workout Intensity",
    mapper: data => data.strain,
  },
};

export const FrequentMetrics = {
  awair_score: {
    name: "awair_score",
    title: "Air Quality",
    unit: "%",
  },
  closed_tab: {
    name: "closed_tab",
    title: "Closed Tab",
    reducer: events =>
      frequencies(
        events,
        e => Math.floor(new Date(e.time).getTime() / 1000 / 60 / 60) * 60 * 60
      ),
  },
  closed_window: {
    name: "closed_window",
    title: "Closed Window",
    reducer: events =>
      frequencies(
        events,
        e => Math.floor(new Date(e.time).getTime() / 1000 / 60 / 60) * 60 * 60
      ),
  },
  co2: {
    name: "co2",
    title: "CO2",
    unit: "ppm",
  },
  hr: {
    name: "hr",
    title: "Heart Rate",
    unit: "bpm",
  },
  humid: {
    name: "humid",
    title: "Humidity",
    unit: "%",
  },
  opened_window: {
    name: "opened_window",
    reducer: events =>
      frequencies(
        events,
        e => Math.floor(new Date(e.time).getTime() / 1000 / 60 / 60) * 60 * 60
      ),
  },
  switched_tab: {
    name: "switched_tab",
    reducer: events =>
      frequencies(
        events,
        e => Math.floor(new Date(e.time).getTime() / 1000 / 60 / 60) * 60 * 60
      ),
  },
  switched_window: {
    name: "switched_window",
    title: "Switched Window",
    reducer: events =>
      frequencies(
        events,
        e => Math.floor(new Date(e.time).getTime() / 1000 / 60 / 60) * 60 * 60
      ),
  },
  temp: {
    name: "temp",
    title: "Temperature",
    unit: "°F",
  },
  user_msg: {
    name: "user_msg",
    reducer: events =>
      frequencies(
        events,
        e => Math.floor(new Date(e.time).getTime() / 1000 / 60 / 60) * 60 * 60
      ),
  },
  visited_url: {
    name: "visited_url",
    reducer: events =>
      frequencies(
        events,
        e => Math.floor(new Date(e.time).getTime() / 1000 / 60 / 60) * 60 * 60
      ),
  },
  voc: {
    name: "voc",
    title: "VOC",
    unit: "ppb",
  },
};

export const AllMetrics = {
  ...InfrequentMetrics,
  ...FrequentMetrics,
};

export const metrics = {
  Personal: [
    "weight",
    "body_fat",
    "lean_body_mass",
    "hr",
    "resting_heart_rate",
    "hrv",
    "strain",
    "sleep",
    "workout",
    "energy",
    "mood",
    "stress",
  ],
  Environmental: ["awair_score", "co2", "temp", "humid", "voc"],
  Misc: [
    "sc2_ranking",
    "visited_url",
    // "opened_tab",
    "switched_tab",
    "closed_tab",
    "opened_window",
    "switched_window",
    "closed_window",
    "user_msg",
  ],
};

export function metricType(metric) {
  return Object.keys(InfrequentMetrics).includes(metric)
    ? "infrequent"
    : "frequent";
}
