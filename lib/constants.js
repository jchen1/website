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

const timeKeyFn = e =>
  Math.floor(new Date(e.time).getTime() / 1000 / 60 / 60) * 60 * 60;

export const InfrequentMetrics = [
  "body_fat",
  "hrv",
  "lean_body_mass",
  "recovery",
  "resting_heart_rate",
  "sc2_ranking",
  "sleep",
  "strain",
  "weight",
  "energy",
  "mood",
  "stress",
  "workout",
];

export const FrequentMetrics = [
  "awair_score",
  "closed_tab",
  "closed_window",
  "co2",
  "hr",
  "humid",
  "opened_window",
  "switched_tab",
  "switched_window",
  "temp",
  "user_msg",
  "visited_url",
  "voc",
];

export const AllMetrics = [...InfrequentMetrics, ...FrequentMetrics];

export const metrics = {
  Personal: [
    {
      datatype: "hr",
      title: "Heart Rate",
      unit: "bpm",
    },
    {
      datatype: "weight",
      title: "Weight",
      unit: "lbs",
      xType: "unixDays",
    },
    {
      datatype: "body_fat",
      title: "Body Fat",
      unit: "%",
      xType: "unixDays",
      mapper: data => data * 100,
    },
    {
      datatype: "lean_body_mass",
      title: "Lean Body Mass",
      unit: "lbs",
      xType: "unixDays",
    },
    {
      datatype: "resting_heart_rate",
      title: "Resting Heart Rate",
      unit: "bpm",
      xType: "unixDays",
    },
    {
      datatype: "hrv",
      title: "Heart Rate Variability",
      unit: "ms",
      xType: "unixDays",
      mapper: data => data * 1000,
    },
    {
      datatype: "strain",
      xType: "unixDays",
      title: "Daily Strain",
    },
    {
      datatype: "sleep",
      title: "Sleep",
      xType: "unixDays",
      unit: " hours",
      mapper: data => data.duration / 1000 / 60 / 60,
    },
    {
      datatype: "sleep",
      title: "Sleep Debt",
      xType: "unixDays",
      unit: " minutes",
      mapper: data => data.needs.debt / 1000 / 60,
    },
    {
      datatype: "workout",
      title: "Workout Intensity",
      mapper: data => data.strain,
    },
    {
      datatype: "mood",
      title: "Mood",
      xType: "unixDays",
    },
    {
      datatype: "energy",
      title: "Energy",
      xType: "unixDays",
    },
    {
      datatype: "stress",
      title: "Stress",
      xType: "unixDays",
    },
  ],
  Environmental: [
    {
      datatype: "awair_score",
      title: "Air Quality",
      unit: "%",
    },
    {
      datatype: "co2",
      title: "CO2",
      unit: "ppm",
    },
    {
      datatype: "temp",
      title: "Temperature",
      unit: "°F",
    },
    {
      datatype: "humid",
      title: "Humidity",
      unit: "%",
    },
    {
      datatype: "voc",
      title: "VOC",
      unit: "ppb",
    },
  ],
  Misc: [
    {
      datatype: "sc2_ranking",
      xType: "unixDays",
      title: "SC2 MMR",
      mapper: data => data.mmr,
    },
    {
      datatype: "visited_url",
      reducer: events => frequencies(events, timeKeyFn),
    },
    {
      datatype: "switched_tab",
      reducer: events => frequencies(events, timeKeyFn),
    },
    // {
    //   "datatype": "opened_tab"
    // },
    {
      datatype: "closed_tab",
      title: "Closed Tab",
      reducer: events => frequencies(events, timeKeyFn),
    },
    {
      datatype: "opened_window",
      reducer: events => frequencies(events, timeKeyFn),
    },
    {
      datatype: "switched_window",
      title: "Switched Window",
      reducer: events => frequencies(events, timeKeyFn),
    },
    {
      datatype: "closed_window",
      title: "Closed Window",
      reducer: events => frequencies(events, timeKeyFn),
    },
    {
      datatype: "user_msg",
      reducer: events => frequencies(events, timeKeyFn),
    },
  ],
};

export function metricType(metric) {
  return InfrequentMetrics.includes(metric) ? "infrequent" : "frequent";
}
