import { frequencies } from "./util";

export const BASE_URL = "jeffchen.dev";
export const SITE_TITLE = "Jeff Chen";
export const SITE_DESCRIPTION = "Code & fitness";

export const Colors = {
  BLUE: "#4183C4",
  RED: "#F03009",
  GREEN: "#68B723",
  YELLOW: "#F37329",
  BLACK: "#1A1A1A",
  DARKER_GRAY: "#222222",
  DARK_GRAY: "#333333",
  GRAY: "#666666",
  LIGHT_GRAY: "#EEEEEE",
  WHITE: "#FFFFFF",
};

export const SECONDS = 1;
export const MINUTES = SECONDS * 60;
export const HOURS = MINUTES * 60;
export const DAYS = HOURS * 24;

function timeKey(scale) {
  return (e) => Math.floor(new Date(e.time).getTime() / 1000 / scale) * scale;
}

const GithubMetrics = [
  "github_push",
  "github_issuecomment",
  "github_pullrequestreviewcomment",
  "github_pullrequest",
  "github_create",
  "github_issues",
  "github_delete",
  "github_fork",
  "github_watch",
];

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
  ...GithubMetrics,
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
  "switched_os_window",
  "terminated_application",
];

export const AllMetrics = [...InfrequentMetrics, ...FrequentMetrics];

export const Plots = {
  Personal: [
    {
      datatypes: ["hr"],
      title: "Heart Rate",
      unit: "bpm",
    },
    {
      datatypes: ["weight"],
      title: "Weight",
      unit: "lbs",
      xType: "unixDays",
    },
    {
      datatypes: ["body_fat"],
      title: "Body Fat",
      unit: "%",
      xType: "unixDays",
      mapper: (data) => data * 100,
    },
    {
      datatypes: ["lean_body_mass"],
      title: "Lean Body Mass",
      unit: "lbs",
      xType: "unixDays",
    },
    {
      datatypes: ["resting_heart_rate"],
      title: "Resting Heart Rate",
      unit: "bpm",
      xType: "unixDays",
    },
    {
      datatypes: ["hrv"],
      title: "Heart Rate Variability",
      unit: "ms",
      xType: "unixDays",
      mapper: (data) => data * 1000,
    },
    {
      datatypes: ["strain"],
      xType: "unixDays",
      title: "Daily Strain",
    },
    {
      datatypes: ["sleep"],
      title: "Sleep",
      xType: "unixDays",
      unit: " hours",
      mapper: (data) => data.duration / 1000 / 60 / 60,
    },
    {
      datatypes: ["sleep"],
      title: "Sleep Debt",
      xType: "unixDays",
      unit: " minutes",
      mapper: (data) => data.needs.debt / 1000 / 60,
    },
    {
      datatypes: ["workout"],
      title: "Workout Intensity",
      mapper: (data) => data.strain,
    },
    {
      datatypes: ["mood"],
      title: "Mood",
      xType: "unixDays",
    },
    {
      datatypes: ["energy"],
      title: "Energy",
      xType: "unixDays",
    },
    {
      datatypes: ["stress"],
      title: "Stress",
      xType: "unixDays",
    },
  ],
  Environmental: [
    {
      datatypes: ["awair_score"],
      title: "Air Quality",
      unit: "%",
    },
    {
      datatypes: ["co2"],
      title: "CO2",
      unit: "ppm",
    },
    {
      datatypes: ["temp"],
      title: "Temperature",
      unit: "°F",
    },
    {
      datatypes: ["humid"],
      title: "Humidity",
      unit: "%",
    },
    {
      datatypes: ["voc"],
      title: "VOC",
      unit: "ppb",
    },
  ],
  Misc: [
    {
      datatypes: ["sc2_ranking"],
      xType: "unixDays",
      title: "SC2 MMR",
      mapper: (data) => data.mmr,
    },
    {
      datatypes: GithubMetrics,
      title: "Github Activity",
      reducer: (events) => frequencies(events, timeKey(DAYS)),
      plotType: "github",
    },
    {
      datatypes: [
        "visited_url",
        "switched_tab",
        "closed_tab",
        "opened_window",
        "switched_window",
        "closed_window",
      ],
      title: "Chrome Activity",
      reducer: (events) => frequencies(events, timeKey(HOURS)),
    },
    {
      datatypes: ["switched_os_window", "terminated_application"],
      title: "OS Activity",
      reducer: (events) => frequencies(events, timeKey(HOURS)),
    },
    {
      datatypes: ["user_msg"],
      reducer: (events) => frequencies(events, timeKey(HOURS)),
    },
  ],
};

export function metricType(metric) {
  return InfrequentMetrics.includes(metric) ? "infrequent" : "frequent";
}
