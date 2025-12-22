import type { InputParameters, PlantRowInput } from "@/types";
import { calculatePlantAnalysis } from "@/lib/calculations";
import { getInterpolatedInput } from "./interpolation";

/**
 * 차트 데이터 생성
 */
export function generateChartData(
  inputParameters: InputParameters,
  plantRowInputs: Record<93 | 80 | 65, PlantRowInput>,
  selectedOutputs: number[],
  formulas?: import("@/types").AnalysisTableFormulas
): Array<Record<string, number>> {
  const smpRange = Array.from({ length: 151 }, (_, i) => i); // 0 ~ 150
  
  return smpRange.map((smp) => {
    const result: Record<string, number> = { smp };
    
    selectedOutputs.forEach((output) => {
      const interpolatedInput = getInterpolatedInput(output, plantRowInputs);
      const analysis = calculatePlantAnalysis(output, inputParameters, interpolatedInput, smp, formulas);
      result[`profit${output}`] = analysis.contributionProfit;
    });
    
    return result;
  });
}

