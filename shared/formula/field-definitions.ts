import type { AnalysisTableField } from "@/types";

/**
 * 인자별 기본 계산식 및 설명
 * 여러 컴포넌트에서 공유되는 필드 정의
 */
export const FIELD_DEFINITIONS: Record<
  AnalysisTableField,
  { label: string; unit: string; defaultFormula: string; description: string }
> = {
  transmissionAmount: {
    label: "송전량",
    unit: "MWh/h",
    defaultFormula: "output * (1 - internalConsumptionRate / 100)",
    description: "출력 * (1 - 소내소비율)",
  },
  generationEfficiency: {
    label: "발전효율",
    unit: "%",
    defaultFormula: "transmissionEfficiency / (1 - internalConsumptionRate / 100)",
    description: "송전효율 / (1 - 소내소비율)",
  },
  transmissionEfficiency: {
    label: "송전효율",
    unit: "%",
    defaultFormula: "transmissionEfficiency",
    description: "사용자 입력값",
  },
  internalConsumptionRate: {
    label: "소내소비율",
    unit: "%",
    defaultFormula: "internalConsumptionRate",
    description: "사용자 입력값",
  },
  wcCoFiringRate: {
    label: "WC 혼소율",
    unit: "%",
    defaultFormula:
      "(700 * wcCalorificValue) / (pksFuelConsumption * pksCalorificValue + 700 * wcCalorificValue) * 100",
    description: "(700 * WC단위열량) / (PKS연료사용량 * PKS단위열량 + 700 * WC단위열량) * 100",
  },
  pksGenerationCost: {
    label: "PKS 발전단가",
    unit: "원/kWh",
    defaultFormula:
      "(pksUnitPrice / pksCalorificValue) * 860 * (100 / transmissionEfficiency) / 1000",
    description: "PKS단위가격 / PKS단위열량 * 860 / 송전효율 / 1000",
  },
  wcGenerationCost: {
    label: "WC 발전단가",
    unit: "원/kWh",
    defaultFormula:
      "(wcUnitPrice / wcCalorificValue) * 860 * (100 / transmissionEfficiency) / 1000",
    description: "WC단위가격 / WC단위열량 * 860 / 송전효율 / 1000",
  },
  totalGenerationCost: {
    label: "총 발전단가",
    unit: "원/kWh",
    defaultFormula:
      "pksGenerationCost * (1 - wcCoFiringRate / 100) + wcGenerationCost * (wcCoFiringRate / 100)",
    description: "PKS 발전단가 * (1 - WC 혼소율) + WC 발전단가 * WC 혼소율",
  },
  chemicalCost: {
    label: "약품비",
    unit: "원/kWh",
    defaultFormula: "output === 93 ? 7.6 : (93 / output) * 7.6 * 0.95",
    description: "출력이 93이면 7.6, 아니면 (93 / 출력) * 7.6 * 0.95",
  },
  waterFee: {
    label: "수전요금",
    unit: "원/kWh",
    defaultFormula: "1158000 / (transmissionAmount * 24 * 316)",
    description: "1,158,000 / (송전량 * 24 * 316)",
  },
  salesPower: {
    label: "매출 전력량",
    unit: "백만원",
    defaultFormula:
      "(smp * output * 1000 * (1 - internalConsumptionRate / 100) * 24) / 1000000",
    description: "(SMP * 출력 * 1000 * (1 - 소내소비율) * 24) / 1000000",
  },
  salesREC: {
    label: "매출 REC",
    unit: "백만원",
    defaultFormula:
      "(63 * output * 1000 * (1 - internalConsumptionRate / 100) * 24) / 1000000",
    description: "(63 * 출력 * 1000 * (1 - 소내소비율) * 24) / 1000000",
  },
  salesTotal: {
    label: "매출 계",
    unit: "백만원",
    defaultFormula: "salesPower + salesREC",
    description: "매출 전력량 + 매출 REC",
  },
  pksFuelConsumption: {
    label: "PKS 연료사용량",
    unit: "톤/일",
    defaultFormula:
      "((output / (generationEfficiency / 100)) * 860 * 24 - (700 * wcCalorificValue)) / pksCalorificValue",
    description: "(출력 / 발전효율 * 860 * 24 - (700 * WC단위열량)) / PKS단위열량",
  },
  wcFuelConsumption: {
    label: "WC 연료사용량",
    unit: "톤/일",
    defaultFormula: "700",
    description: "고정값 700",
  },
  costFuel: {
    label: "비용 연료비",
    unit: "백만원",
    defaultFormula:
      "(pksFuelConsumption * pksUnitPrice + 700 * wcUnitPrice) / 1000000",
    description: "(PKS연료사용량 * PKS단위가격 + 700 * WC단위가격) / 1000000",
  },
  costChemical: {
    label: "비용 약품비",
    unit: "백만원",
    defaultFormula:
      "(output * (1 - internalConsumptionRate / 100) * 1000 * chemicalCost * 24) / 1000000",
    description: "(출력 * (1 - 소내소비율) * 1000 * 약품비 * 24) / 1000000",
  },
  costWater: {
    label: "비용 수전료",
    unit: "백만원",
    defaultFormula:
      "(output * 1000 * (1 - internalConsumptionRate / 100) * waterFee * 24) / 1000000",
    description: "(출력 * 1000 * (1 - 소내소비율) * 수전요금 * 24) / 1000000",
  },
  contributionProfit: {
    label: "공헌이익",
    unit: "백만원/일",
    defaultFormula: "salesTotal - (costFuel + costChemical + costWater)",
    description: "매출 계 - (비용 연료비 + 비용 약품비 + 비용 수전료)",
  },
  hourlyExpectedProfit: {
    label: "시간당 수익",
    unit: "만원",
    defaultFormula: "(contributionProfit / 24) * 10",
    description: "(공헌이익 / 24) * 10",
  },
};

