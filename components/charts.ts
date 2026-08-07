// import uPlot from "uplot";
import dynamic from "next/dynamic";

export const Plot = dynamic(() => import("./Plot"), { ssr: false });
