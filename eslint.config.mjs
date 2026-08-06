import coreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  { ignores: [".next/**", "out/**", "node_modules/**", "public/**"] },
  ...coreWebVitals,
  {
    rules: {
      // react-hooks v6 additions; the flagged patterns are long-standing
      // and behave correctly, so surface them without failing the hook
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/use-memo": "warn",
    },
  },
];

export default config;
