const fs = require("fs");
const path = require("path");

const csvDir = path.join(process.env.HOME, "Downloads/Appendix-B_2023");
const outputPath = path.join(
  __dirname,
  "../lib/track/age-grading/constants.js"
);

function parseCSV(filename) {
  const content = fs.readFileSync(path.join(csvDir, filename), "utf-8");
  const lines = content.trim().replace(/\r/g, "").split("\n");

  // First line is measurement types (T1, T2, D2)
  const measureTypes = lines[0].split(",").slice(1);

  // Second line is event names
  const eventNames = lines[1].split(",").slice(1);

  // Build factors object keyed by age
  const factors = {};

  for (let i = 2; i < lines.length; i++) {
    const values = lines[i].split(",");
    const age = parseInt(values[0], 10);
    factors[age] = {};

    for (let j = 1; j < values.length; j++) {
      const eventName = eventNames[j - 1];
      factors[age][eventName] = parseFloat(values[j]);
    }
  }

  // Build mark types from first row
  const markTypes = {};
  for (let i = 0; i < eventNames.length; i++) {
    const type = measureTypes[i];
    // T1 and T2 are time events, D2 is distance
    markTypes[eventNames[i]] = type === "D2" ? "distance" : "time";
  }

  return { factors, markTypes, events: eventNames };
}

const male = parseCSV("Male-Table 1.csv");
const female = parseCSV("Female-Table 1.csv");

// Event display names mapping
const eventDisplayNames = {
  "60m": "60m",
  "100m": "100m",
  "200m": "200m",
  "400m": "400m",
  "800m": "800m",
  "1000m": "1000m",
  "1500m": "1500m",
  Mile: "Mile",
  "3000m": "3000m",
  "5000m": "5000m",
  "10000m": "10000m",
  "60mHurdles": "60m hurdles",
  ShortHurdles: "Short hurdles",
  LongHurdles: "400m hurdles",
  SteepleChase: "3000m steeplechase",
  HighJump: "High jump",
  PoleVault: "Pole vault",
  LongJump: "Long jump",
  TripleJump: "Triple jump",
  ShotPut: "Shot put",
  Discus: "Discus throw",
  Hammer: "Hammer throw",
  Javelin: "Javelin throw",
  Weight: "Weight throw",
  "3000mRaceWalk": "3000m race walk",
  "5000mRaceWalk": "5000m race walk",
  "10kRaceWalk": "10000m race walk",
  "20kRaceWalk": "20000m race walk",
  HalfMarathon: "Half marathon",
  Marathon: "Marathon",
};

// Generate the output file
const output = `// Auto-generated from WMA 2023 age grading coefficients
// Source: World Masters Athletics Age-Grading Factors (Appendix B, 2023)

export const maleFactors = ${JSON.stringify(male.factors, null, 2)};

export const femaleFactors = ${JSON.stringify(female.factors, null, 2)};

export const markTypes = ${JSON.stringify(male.markTypes, null, 2)};

export const events = ${JSON.stringify(male.events, null, 2)};

export const eventDisplayNames = ${JSON.stringify(eventDisplayNames, null, 2)};
`;

// Ensure directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, output);
console.log(`Generated ${outputPath}`);
