/**
 * 비개발자를 위한 변수명 매핑
 * 영문 변수명을 한글 비즈니스 용어로 변환
 */

export interface VariableInfo {
  code: string; // 코드에서 사용하는 변수명
  label: string; // 사용자에게 표시할 한글명
  description: string; // 설명
  unit?: string; // 단위
  category: "사용자 입력 값" | "계산 값" | "고정 값";
}

// 사용 가능한 변수 목록
export const AVAILABLE_VARIABLES: Record<string, VariableInfo> = {
  output: {
    code: "output",
    label: "출력 (MW)",
    description: "발전소 출력 레벨 (93, 80, 65)",
    unit: "MW",
    category: "사용자 입력 값",
  },
  smp: {
    code: "smp",
    label: "SMP 가격",
    description: "계통한계가격 (원/kWh)",
    unit: "원/kWh",
    category: "사용자 입력 값",
  },
  transmissionEfficiency: {
    code: "transmissionEfficiency",
    label: "송전효율",
    description: "송전 효율 (%)",
    unit: "%",
    category: "사용자 입력 값",
  },
  internalConsumptionRate: {
    code: "internalConsumptionRate",
    label: "소내소비율",
    description: "소내 소비 비율 (%)",
    unit: "%",
    category: "사용자 입력 값",
  },
  pksCalorificValue: {
    code: "pksCalorificValue",
    label: "PKS 단위열량",
    description: "PKS 단위 열량 (kcal/kg)",
    unit: "kcal/kg",
    category: "사용자 입력 값",
  },
  wcCalorificValue: {
    code: "wcCalorificValue",
    label: "WC 단위열량",
    description: "WC 단위 열량 (kcal/kg)",
    unit: "kcal/kg",
    category: "사용자 입력 값",
  },
  pksUnitPrice: {
    code: "pksUnitPrice",
    label: "PKS 단위가격",
    description: "PKS 단위 가격 (원/톤)",
    unit: "원/톤",
    category: "사용자 입력 값",
  },
  wcUnitPrice: {
    code: "wcUnitPrice",
    label: "WC 단위가격",
    description: "WC 단위 가격 (원/톤)",
    unit: "원/톤",
    category: "사용자 입력 값",
  },
  generationEfficiency: {
    code: "generationEfficiency",
    label: "발전효율",
    description: "발전 효율 (%)",
    unit: "%",
    category: "계산 값",
  },
  transmissionAmount: {
    code: "transmissionAmount",
    label: "송전량",
    description: "시간당 송전량 (MWh/h)",
    unit: "MWh/h",
    category: "계산 값",
  },
  pksFuelConsumption: {
    code: "pksFuelConsumption",
    label: "PKS 연료사용량",
    description: "PKS 연료 사용량 (톤/일)",
    unit: "톤/일",
    category: "계산 값",
  },
  wcCoFiringRate: {
    code: "wcCoFiringRate",
    label: "WC 혼소율",
    description: "WC 혼소 비율 (%)",
    unit: "%",
    category: "계산 값",
  },
  pksGenerationCost: {
    code: "pksGenerationCost",
    label: "PKS 발전단가",
    description: "PKS 발전 단가 (원/kWh)",
    unit: "원/kWh",
    category: "계산 값",
  },
  wcGenerationCost: {
    code: "wcGenerationCost",
    label: "WC 발전단가",
    description: "WC 발전 단가 (원/kWh)",
    unit: "원/kWh",
    category: "계산 값",
  },
  totalGenerationCost: {
    code: "totalGenerationCost",
    label: "총 발전단가",
    description: "총 발전 단가 (원/kWh)",
    unit: "원/kWh",
    category: "계산 값",
  },
  chemicalCost: {
    code: "chemicalCost",
    label: "약품비",
    description: "약품비 단가 (원/kWh)",
    unit: "원/kWh",
    category: "계산 값",
  },
  waterFee: {
    code: "waterFee",
    label: "수전요금",
    description: "수전 요금 단가 (원/kWh)",
    unit: "원/kWh",
    category: "계산 값",
  },
  salesPower: {
    code: "salesPower",
    label: "매출 전력량",
    description: "전력량 매출 (백만원)",
    unit: "백만원",
    category: "계산 값",
  },
  salesREC: {
    code: "salesREC",
    label: "매출 REC",
    description: "REC 매출 (백만원)",
    unit: "백만원",
    category: "계산 값",
  },
  salesTotal: {
    code: "salesTotal",
    label: "매출 계",
    description: "총 매출 (백만원)",
    unit: "백만원",
    category: "계산 값",
  },
  costFuel: {
    code: "costFuel",
    label: "비용 연료비",
    description: "연료비 비용 (백만원)",
    unit: "백만원",
    category: "계산 값",
  },
  costChemical: {
    code: "costChemical",
    label: "비용 약품비",
    description: "약품비 비용 (백만원)",
    unit: "백만원",
    category: "계산 값",
  },
  costWater: {
    code: "costWater",
    label: "비용 수전료",
    description: "수전료 비용 (백만원)",
    unit: "백만원",
    category: "계산 값",
  },
  hourlyExpectedProfit: {
    code: "hourlyExpectedProfit",
    label: "시간당 수익",
    description: "시간당 기대수익 (만원)",
    unit: "만원",
    category: "계산 값",
  },
  wcFuelConsumption: {
    code: "wcFuelConsumption",
    label: "WC 연료사용량",
    description: "WC 연료 사용량 (톤/일)",
    unit: "톤/일",
    category: "고정 값",
  },
};

/**
 * 변수 코드명을 한글 라벨로 변환
 */
export function getVariableLabel(code: string): string {
  return AVAILABLE_VARIABLES[code]?.label || code;
}

/**
 * 변수 코드명을 설명으로 변환
 */
export function getVariableDescription(code: string): string {
  return AVAILABLE_VARIABLES[code]?.description || "";
}

/**
 * 카테고리별로 변수 그룹화
 */
export function getVariablesByCategory() {
  const grouped: Record<string, VariableInfo[]> = {
    "사용자 입력 값": [],
    "계산 값": [],
    "고정 값": [],
  };

  Object.values(AVAILABLE_VARIABLES).forEach((variable) => {
    grouped[variable.category].push(variable);
  });

  return grouped;
}





