export interface DominanceZone {
  start: number;
  end: number;
  dominant: string;
}

/**
 * 정지 구간의 끝점 계산 (모든 출력이 0 이하인 마지막 지점)
 */
export function calculateMinBreakEvenSMP(
  chartData: Array<Record<string, number>>,
  selectedOutputs: number[]
): number {
  let lastNegativeSMP = -1;
  
  // 모든 출력이 0 이하인 마지막 지점 찾기
  for (const data of chartData) {
    let allNegative = true;
    
    selectedOutputs.forEach((output) => {
      const profit = (data as any)[`profit${output}`];
      if (profit > 0) {
        allNegative = false;
      }
    });
    
    // 모든 출력이 0 이하인 경우
    if (allNegative) {
      lastNegativeSMP = data.smp;
    } else {
      // 양수가 나오면 중단
      break;
    }
  }
  
  return lastNegativeSMP + 1; // 다음 지점부터 시작
}

/**
 * 우위 구간 계산 (선택된 출력 레벨에 따라 동적 계산, 정지 구간 포함)
 */
export function calculateDominanceZones(
  chartData: Array<Record<string, number>>,
  selectedOutputs: number[],
  minBreakEvenSMP: number
): DominanceZone[] {
  const zones: DominanceZone[] = [];
  
  // 정지 구간이 있는 경우 추가
  if (minBreakEvenSMP > 0) {
    zones.push({ start: 0, end: Math.ceil(minBreakEvenSMP), dominant: "정지" });
  }
  
  let currentDominant = "";
  let zoneStart = Math.max(0, Math.ceil(minBreakEvenSMP));
  
  for (const data of chartData) {
    // 정지 구간은 건너뛰기
    if (data.smp < Math.ceil(minBreakEvenSMP)) {
      continue;
    }
    
    // 선택된 출력 레벨 중 가장 높은 공헌이익 찾기
    let maxProfit = -Infinity;
    let dominant = "";
    
    selectedOutputs.forEach((output) => {
      const profit = (data as any)[`profit${output}`];
      if (profit > maxProfit && profit > 0) {
        maxProfit = profit;
        dominant = `${output}MW`;
      }
    });
    
    // 모든 출력이 0 이하인 경우 정지
    if (maxProfit <= 0) {
      dominant = "정지";
    }
    
    if (dominant !== currentDominant) {
      if (currentDominant && zoneStart < data.smp) {
        zones.push({ start: zoneStart, end: data.smp, dominant: currentDominant });
      }
      currentDominant = dominant;
      zoneStart = data.smp;
    }
  }
  
  // 마지막 구간 추가
  if (currentDominant && chartData.length > 0) {
    const lastData = chartData.at(-1);
    if (lastData && zoneStart <= lastData.smp) {
      zones.push({ start: zoneStart, end: lastData.smp, dominant: currentDominant });
    }
  }
  
  return zones;
}

