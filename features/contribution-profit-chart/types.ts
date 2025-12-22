import type { InputParameters, PlantRowInput } from "@/types";

export interface ContributionProfitChartProps {
  readonly inputParameters: InputParameters;
  readonly plantRowInputs: {
    93: PlantRowInput;
    80: PlantRowInput;
    65: PlantRowInput;
  };
  readonly formulas?: import("@/types").AnalysisTableFormulas;
}

export interface IntersectionPoint {
  smp: number;
  profit: number;
  label: string;
}

export interface LinePoint {
  smp: number;
  profit: number;
}

