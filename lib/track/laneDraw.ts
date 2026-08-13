// Lane-draw effects for the sprints run entirely in lanes on a curve.
//
// A slope is the change in finishing time per lane moved outward, in seconds,
// so a negative slope means outer lanes are faster. Each source estimate comes
// from a fixed-effects regression of time on lane number with athlete and race
// fixed effects, which compares an athlete to themselves across lanes instead
// of comparing the (better) athletes seeded into middle lanes with everyone
// else.

export type LaneEvent = "200m" | "400m";
export type Gender = "men" | "women";

export interface LaneSlope {
  /** seconds per lane moved outward; negative means outer lanes are faster */
  slope: number;
  /** 95% confidence interval on the slope, [low, high] */
  ci95: [number, number];
}

export interface LaneSlopeSource extends LaneSlope {
  event: LaneEvent;
  gender: Gender;
  dataset: "elite" | "college";
}

// The two datasets behind the pooled constants: Diamond League results
// (2015-2025) and NCAA results scraped from FlashResults (2016-2026).
export const SOURCE_ESTIMATES: LaneSlopeSource[] = [
  {
    dataset: "elite",
    event: "200m",
    gender: "men",
    slope: -0.0256,
    ci95: [-0.041, -0.01],
  },
  {
    dataset: "elite",
    event: "200m",
    gender: "women",
    slope: -0.0081,
    ci95: [-0.024, 0.008],
  },
  {
    dataset: "elite",
    event: "400m",
    gender: "men",
    slope: -0.0183,
    ci95: [-0.043, 0.006],
  },
  {
    dataset: "elite",
    event: "400m",
    gender: "women",
    slope: -0.0236,
    ci95: [-0.06, 0.013],
  },
  {
    dataset: "college",
    event: "200m",
    gender: "men",
    slope: -0.0227,
    ci95: [-0.03, -0.0154],
  },
  {
    dataset: "college",
    event: "200m",
    gender: "women",
    slope: -0.0137,
    ci95: [-0.0221, -0.0053],
  },
  {
    dataset: "college",
    event: "400m",
    gender: "men",
    slope: -0.0265,
    ci95: [-0.0429, -0.0101],
  },
  {
    dataset: "college",
    event: "400m",
    gender: "women",
    slope: -0.0396,
    ci95: [-0.0605, -0.0187],
  },
];

// One pooled slope per event and gender: the inverse-variance-weighted mean of
// the two source estimates above, where each standard error is the width of
// that estimate's 95% interval divided by 3.92, the pooled standard error is
// 1/sqrt(sum of weights), and the pooled interval is the mean +/- 1.96 pooled
// standard errors. The college estimates carry most of the weight because
// their intervals are the tighter of the two, especially for the women.
export const LANE_SLOPES: Record<LaneEvent, Record<Gender, LaneSlope>> = {
  "200m": {
    men: { slope: -0.0232, ci95: [-0.0298, -0.0166] },
    women: { slope: -0.0125, ci95: [-0.0199, -0.0051] },
  },
  "400m": {
    men: { slope: -0.024, ci95: [-0.0376, -0.0103] },
    women: { slope: -0.0356, ci95: [-0.0538, -0.0175] },
  },
};

export function laneSlope({
  event,
  gender,
}: {
  event: LaneEvent;
  gender: Gender;
}): LaneSlope {
  return LANE_SLOPES[event][gender];
}
