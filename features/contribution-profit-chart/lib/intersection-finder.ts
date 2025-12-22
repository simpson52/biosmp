import type { IntersectionPoint, LinePoint } from "../types";
import { findIntersection } from "./intersection-calculator";

/**
 * 모든 출력 레벨 쌍에 대한 교차점 찾기
 */
export function findAllIntersections(
  chartData: Array<Record<string, number>>,
  selectedOutputs: number[]
): IntersectionPoint[] {
  const intersectionPoints: IntersectionPoint[] = [];
  
  // 모든 출력 레벨 쌍에 대해 교차점 찾기
  for (let i = 0; i < selectedOutputs.length; i++) {
    for (let j = i + 1; j < selectedOutputs.length; j++) {
      const output1 = selectedOutputs[i];
      const output2 = selectedOutputs[j];
      const line1 = chartData.map((d) => ({ smp: d.smp, profit: (d as any)[`profit${output1}`] }));
      const line2 = chartData.map((d) => ({ smp: d.smp, profit: (d as any)[`profit${output2}`] }));
      
      const intersection = findIntersection(line1, line2);
      if (intersection) {
        intersectionPoints.push({
          smp: intersection.smp,
          profit: intersection.profit,
          label: `${intersection.smp.toFixed(1)}`,
        });
      }
    }
  }
  
  return intersectionPoints;
}

