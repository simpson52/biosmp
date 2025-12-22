import type { AnalysisTableField } from "@/types";

export interface TableColumn {
  field: AnalysisTableField;
  label: string;
  unit: string;
  format: "number" | "currency" | "percent";
}

export const TABLE_COLUMNS: TableColumn[] = [
  { field: "transmissionAmount", label: "송전량", unit: "MWh/h", format: "number" },
  { field: "generationEfficiency", label: "발전효율", unit: "%", format: "percent" },
  { field: "transmissionEfficiency", label: "송전효율", unit: "%", format: "percent" },
  { field: "internalConsumptionRate", label: "소내소비율", unit: "%", format: "percent" },
  { field: "wcCoFiringRate", label: "WC 혼소율", unit: "%", format: "percent" },
  { field: "pksGenerationCost", label: "PKS 발전단가", unit: "원/kWh", format: "currency" },
  { field: "wcGenerationCost", label: "WC 발전단가", unit: "원/kWh", format: "currency" },
  { field: "totalGenerationCost", label: "총 발전단가", unit: "원/kWh", format: "currency" },
  { field: "chemicalCost", label: "약품비", unit: "원/kWh", format: "currency" },
  { field: "waterFee", label: "수전요금", unit: "원/kWh", format: "currency" },
  { field: "salesPower", label: "매출 전력량", unit: "백만원", format: "currency" },
  { field: "salesREC", label: "매출 REC", unit: "백만원", format: "currency" },
  { field: "salesTotal", label: "매출 계", unit: "백만원", format: "currency" },
  { field: "pksFuelConsumption", label: "PKS 연료사용량", unit: "톤/일", format: "number" },
  { field: "wcFuelConsumption", label: "WC 연료사용량", unit: "톤/일", format: "number" },
  { field: "costFuel", label: "비용 연료비", unit: "백만원", format: "currency" },
  { field: "costChemical", label: "비용 약품비", unit: "백만원", format: "currency" },
  { field: "costWater", label: "비용 수전료", unit: "백만원", format: "currency" },
  { field: "contributionProfit", label: "공헌이익", unit: "백만원/일", format: "currency" },
  { field: "hourlyExpectedProfit", label: "시간당 수익", unit: "만원", format: "currency" },
];

