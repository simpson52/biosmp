import type { LinePoint } from "../types";

/**
 * 두 선의 교차점 찾기 (선형 보간)
 */
export function findIntersection(
  line1: LinePoint[],
  line2: LinePoint[]
): { smp: number; profit: number } | null {
  for (let i = 0; i < line1.length - 1; i++) {
    const p1 = line1[i];
    const p2 = line1[i + 1];
    
    for (let j = 0; j < line2.length - 1; j++) {
      const p3 = line2[j];
      const p4 = line2[j + 1];
      
      // 선분 교차점 계산
      const denom = (p1.smp - p2.smp) * (p3.profit - p4.profit) - (p1.profit - p2.profit) * (p3.smp - p4.smp);
      if (Math.abs(denom) < 0.0001) continue;
      
      const t = ((p1.smp - p3.smp) * (p3.profit - p4.profit) - (p1.profit - p3.profit) * (p3.smp - p4.smp)) / denom;
      const u = -((p1.smp - p2.smp) * (p1.profit - p3.profit) - (p1.profit - p2.profit) * (p1.smp - p3.smp)) / denom;
      
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        const smp = p1.smp + t * (p2.smp - p1.smp);
        const profit = p1.profit + t * (p2.profit - p1.profit);
        return { smp, profit };
      }
    }
  }
  return null;
}

