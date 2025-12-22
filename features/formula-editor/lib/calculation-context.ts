import type { InputParameters, PlantRowInput } from "@/types";
import {
  DEFAULT_OUTPUT_LEVEL,
  WC_FUEL_CONSUMPTION,
  CHEMICAL_COST_BASE,
  CHEMICAL_COST_MULTIPLIER,
  WATER_FEE_DIVISOR,
  DAYS_PER_YEAR,
  HOURS_PER_DAY,
  REC_PRICE,
  KWH_TO_MWH,
  MILLION_DIVISOR,
  CALORIFIC_CONVERSION,
  HOURLY_PROFIT_MULTIPLIER,
} from "../constants";

/**
 * 93MW 기준 계산 컨텍스트 생성
 */
export function buildCalculationContext(
  inputParams: InputParameters,
  rowInput: PlantRowInput
): Record<string, number> {
  const output = DEFAULT_OUTPUT_LEVEL;
  const smp = inputParams.baseSMP;
  
  // 기본 입력 변수들
  const context: Record<string, number> = {
    output,
    smp,
    transmissionEfficiency: rowInput.transmissionEfficiency,
    internalConsumptionRate: rowInput.internalConsumptionRate,
    pksCalorificValue: inputParams.pksCalorificValue,
    wcCalorificValue: inputParams.wcCalorificValue,
    pksUnitPrice: inputParams.pksUnitPrice,
    wcUnitPrice: inputParams.wcUnitPrice,
  };
  
  // 계산 결과 변수들 계산 (93MW 기준)
  // 송전량 = 출력 * (1 - 소내소비율/100)
  const transmissionAmount = output * (1 - rowInput.internalConsumptionRate / 100);
  context.transmissionAmount = transmissionAmount;
  
  // 발전효율 = 송전효율 / (1 - 소내소비율/100)
  const generationEfficiency = rowInput.transmissionEfficiency / (1 - rowInput.internalConsumptionRate / 100);
  context.generationEfficiency = generationEfficiency;
  
  // PKS 연료사용량 = ((출력 / 발전효율) * 860 * 24 - (700 * WC단위열량)) / PKS단위열량
  const pksFuelConsumption = ((output / (generationEfficiency / 100)) * CALORIFIC_CONVERSION * HOURS_PER_DAY - (WC_FUEL_CONSUMPTION * inputParams.wcCalorificValue)) / inputParams.pksCalorificValue;
  context.pksFuelConsumption = pksFuelConsumption;
  
  // WC 연료사용량 = 700 (고정값)
  context.wcFuelConsumption = WC_FUEL_CONSUMPTION;
  
  // WC 혼소율 = (700 * WC단위열량) / (PKS연료사용량 * PKS단위열량 + 700 * WC단위열량)
  // 주의: calculatePlantAnalysis와 동일하게 0-1 범위로 계산 (백분율 아님)
  const wcCoFiringRateRaw = (WC_FUEL_CONSUMPTION * inputParams.wcCalorificValue) / (pksFuelConsumption * inputParams.pksCalorificValue + WC_FUEL_CONSUMPTION * inputParams.wcCalorificValue);
  context.wcCoFiringRate = wcCoFiringRateRaw;
  
  // PKS 발전단가 = (PKS단위가격 / PKS단위열량) * 860 * (100 / 송전효율) / 1000
  const pksGenerationCost = (inputParams.pksUnitPrice / inputParams.pksCalorificValue) * CALORIFIC_CONVERSION * (100 / rowInput.transmissionEfficiency) / 1000;
  context.pksGenerationCost = pksGenerationCost;
  
  // WC 발전단가 = (WC단위가격 / WC단위열량) * 860 * (100 / 송전효율) / 1000
  const wcGenerationCost = (inputParams.wcUnitPrice / inputParams.wcCalorificValue) * CALORIFIC_CONVERSION * (100 / rowInput.transmissionEfficiency) / 1000;
  context.wcGenerationCost = wcGenerationCost;
  
  // 총 발전단가 = PKS발전단가 * (1 - WC혼소율) + WC발전단가 * WC혼소율
  context.totalGenerationCost = pksGenerationCost * (1 - wcCoFiringRateRaw) + wcGenerationCost * wcCoFiringRateRaw;
  
  // 약품비 = 출력이 93MW면 7.6, 아니면 (93 / 출력) * 7.6 * 0.95
  const chemicalCost = output === DEFAULT_OUTPUT_LEVEL ? CHEMICAL_COST_BASE : (DEFAULT_OUTPUT_LEVEL / output) * CHEMICAL_COST_BASE * CHEMICAL_COST_MULTIPLIER;
  context.chemicalCost = chemicalCost;
  
  // 수전요금 = 1158000 / (송전량 * 24 * 316)
  const waterFee = WATER_FEE_DIVISOR / (transmissionAmount * HOURS_PER_DAY * DAYS_PER_YEAR);
  context.waterFee = waterFee;
  
  // 매출 전력량 = (SMP * 출력 * 1000 * (1 - 소내소비율/100) * 24) / 1000000
  const salesPower = (smp * output * KWH_TO_MWH * (1 - rowInput.internalConsumptionRate / 100) * HOURS_PER_DAY) / MILLION_DIVISOR;
  context.salesPower = salesPower;
  
  // 매출 REC = (63 * 출력 * 1000 * (1 - 소내소비율/100) * 24) / 1000000
  const salesREC = (REC_PRICE * output * KWH_TO_MWH * (1 - rowInput.internalConsumptionRate / 100) * HOURS_PER_DAY) / MILLION_DIVISOR;
  context.salesREC = salesREC;
  
  // 매출 계 = 매출 전력량 + 매출 REC
  const salesTotal = salesPower + salesREC;
  context.salesTotal = salesTotal;
  
  // 비용 연료비 = (PKS연료사용량 * PKS단위가격 + 700 * WC단위가격) / 1000000
  const costFuel = (pksFuelConsumption * inputParams.pksUnitPrice + WC_FUEL_CONSUMPTION * inputParams.wcUnitPrice) / MILLION_DIVISOR;
  context.costFuel = costFuel;
  
  // 비용 약품비 = (출력 * (1 - 소내소비율/100) * 1000 * 약품비 * 24) / 1000000
  const costChemical = (output * (1 - rowInput.internalConsumptionRate / 100) * KWH_TO_MWH * chemicalCost * HOURS_PER_DAY) / MILLION_DIVISOR;
  context.costChemical = costChemical;
  
  // 비용 수전요금 = (출력 * 1000 * (1 - 소내소비율/100) * 수전요금 * 24) / 1000000
  const costWater = (output * KWH_TO_MWH * (1 - rowInput.internalConsumptionRate / 100) * waterFee * HOURS_PER_DAY) / MILLION_DIVISOR;
  context.costWater = costWater;
  
  // 기여이익 = 매출 계 - (비용 연료비 + 비용 약품비 + 비용 수전요금)
  const contributionProfit = salesTotal - (costFuel + costChemical + costWater);
  context.contributionProfit = contributionProfit;
  
  // 시간당 기대이익 = (기여이익 / 24) * 10
  context.hourlyExpectedProfit = (contributionProfit / HOURS_PER_DAY) * HOURLY_PROFIT_MULTIPLIER;
  
  return context;
}

