import type {
  InputParameters,
  PlantRowInput,
  PlantAnalysisResult,
  OutputLevel,
  CurtailmentThresholds,
  AnalysisTableFormulas,
} from "@/types";
import { getCalculatedValue } from "./formula-evaluator";

// 고정 상수
const WC_FUEL_CONSUMPTION = 700; // 톤/일
const REC_PRICE = 63; // 원
const CALORIFIC_CONVERSION = 860; // kcal/kWh 변환 계수
const OPERATING_DAYS = 316; // 365 - 49
const WATER_FEE_BASE = 1158000; // 원

/**
 * 송전량 계산 (MWh/h) - 시간당 송전량
 * 공식: 출력 * (1 - 소내소비율)
 * 엑셀 테이블에 표시되는 값
 */
export function calculateTransmissionAmount(
  output: number,
  internalConsumptionRate: number
): number {
  return output * (1 - internalConsumptionRate / 100);
}

/**
 * 시간당 송전량 계산 (MWh/h) - calculateTransmissionAmount와 동일
 * 엑셀 테이블에 표시되는 값
 */
export function calculateHourlyTransmissionAmount(
  output: number,
  internalConsumptionRate: number
): number {
  return output * (1 - internalConsumptionRate / 100);
}

/**
 * 발전효율 계산 (%)
 * 공식: 송전효율 / (1 - 소내소비율)
 */
export function calculateGenerationEfficiency(
  transmissionEfficiency: number,
  internalConsumptionRate: number
): number {
  return transmissionEfficiency / (1 - internalConsumptionRate / 100);
}

/**
 * PKS 연료사용량 계산 (톤/일)
 * 공식: (출력 / 발전효율 * 860 * 24 - (700 * WC단위열량)) / PKS단위열량
 */
export function calculatePKSFuelConsumption(
  output: number,
  generationEfficiency: number,
  wcCalorificValue: number,
  pksCalorificValue: number
): number {
  const numerator =
    (output / (generationEfficiency / 100)) * CALORIFIC_CONVERSION * 24 -
    WC_FUEL_CONSUMPTION * wcCalorificValue;
  return numerator / pksCalorificValue;
}

/**
 * WC 혼소율 계산 (%)
 * 공식: (700 * WC단위열량) / (PKS연료사용량 * PKS단위열량 + 700 * WC단위열량)
 */
export function calculateWCCoFiringRate(
  pksFuelConsumption: number,
  pksCalorificValue: number,
  wcCalorificValue: number
): number {
  const denominator =
    pksFuelConsumption * pksCalorificValue +
    WC_FUEL_CONSUMPTION * wcCalorificValue;
  return (WC_FUEL_CONSUMPTION * wcCalorificValue) / denominator;
}

/**
 * PKS 발전단가 계산 (원/kWh)
 * 공식: PKS단위가격 / PKS단위열량 * 860 / 송전효율 / 1000
 */
export function calculatePKSGenerationCost(
  pksUnitPrice: number,
  pksCalorificValue: number,
  transmissionEfficiency: number
): number {
  return (
    (pksUnitPrice / pksCalorificValue) *
    CALORIFIC_CONVERSION *
    (100 / transmissionEfficiency) /
    1000
  );
}

/**
 * WC 발전단가 계산 (원/kWh)
 * 공식: WC단위가격 / WC단위열량 * 860 / 송전효율 / 1000
 */
export function calculateWCGenerationCost(
  wcUnitPrice: number,
  wcCalorificValue: number,
  transmissionEfficiency: number
): number {
  return (
    (wcUnitPrice / wcCalorificValue) *
    CALORIFIC_CONVERSION *
    (100 / transmissionEfficiency) /
    1000
  );
}

/**
 * 약품비 계산 (원/kWh)
 * 공식:
 * - IF (출력 == 93): 7.6
 * - ELSE: (이전 행 출력 / 현재 출력) * 약품비 [원/kWh] * 95%
 * 
 * 참고: PRD에는 "이전 행 참조 대신 기준값 93 활용"이라고 명시되어 있어
 * "이전 행 출력"은 항상 93을 의미합니다.
 * 따라서 ELSE 경우: (93 / 현재 출력) * 7.6 * 0.95
 */
export function calculateChemicalCost(output: OutputLevel | number): number {
  if (output === 93) {
    return 7.6;
  }
  // 이전 행 출력 = 93 (기준값)
  return (93 / output) * 7.6 * 0.95;
}

/**
 * 수전요금 계산 (원/kWh)
 * 공식: 1,158,000 / (송전량[시간당] * 24 * 316)
 */
export function calculateWaterFee(
  hourlyTransmissionAmount: number
): number {
  return WATER_FEE_BASE / (hourlyTransmissionAmount * 24 * OPERATING_DAYS);
}

/**
 * 매출 전력량 계산 (백만원)
 * 공식: (SMP * 출력 * (1 - 소내소비율) * 24 * 1000) / 1000000
 * 출력은 MW 단위이므로 kW로 변환하기 위해 1000을 곱함
 */
export function calculateSalesPower(
  smp: number,
  output: number,
  internalConsumptionRate: number
): number {
  return (smp * output * 1000 * (1 - internalConsumptionRate / 100) * 24) / 1000000;
}

/**
 * 매출 REC 계산 (백만원)
 * 공식: (63 * 출력 * (1 - 소내소비율) * 24 * 1000) / 1000000
 * 출력은 MW 단위이므로 kW로 변환하기 위해 1000을 곱함
 */
export function calculateSalesREC(
  output: number,
  internalConsumptionRate: number
): number {
  return (
    (REC_PRICE * output * 1000 * (1 - internalConsumptionRate / 100) * 24) / 1000000
  );
}

/**
 * 비용 연료비 계산 (백만원)
 * 공식: (PKS연료사용량 * PKS단위가격 + 700 * WC단위가격) / 1000000
 */
export function calculateCostFuel(
  pksFuelConsumption: number,
  pksUnitPrice: number,
  wcUnitPrice: number
): number {
  return (
    (pksFuelConsumption * pksUnitPrice + WC_FUEL_CONSUMPTION * wcUnitPrice) /
    1000000
  );
}

/**
 * 비용 약품비 계산 (백만원)
 * 공식: 출력 * (1 - 소내소비율) * 약품비 [원/kWh] / 1000 * 24
 * - 출력: MW 단위
 * - (1 - 소내소비율): 송전량 비율 (MWh/h)
 * - 약품비: 원/kWh 단위
 * - / 1000: MWh를 kWh로 변환 (MWh/h * 1000 = kWh/h)
 * - * 24: 시간당을 일일로 변환
 * - 결과: 원 단위이므로 백만원으로 표시하려면 / 1000000 필요
 * 
 * 실제 계산:
 * 송전량(kWh/h) = 출력(MW) * (1 - 소내소비율) * 1000
 * 약품비(원/일) = 송전량(kWh/h) * 약품비(원/kWh) * 24
 * 약품비(백만원/일) = 약품비(원/일) / 1000000
 * 
 * 사용자 공식에 따르면:
 * 출력 * (1 - 소내소비율) * 약품비 / 1000 * 24
 * = 출력 * (1 - 소내소비율) * 약품비 * 24 / 1000
 * = (출력 * (1 - 소내소비율) * 1000) * 약품비 * 24 / 1000
 * = 송전량(kWh/h) * 약품비 * 24 / 1000
 * 
 * 하지만 이는 단위가 맞지 않으므로, 올바른 공식은:
 * 출력 * (1 - 소내소비율) * 1000 * 약품비 * 24 / 1000000
 */
export function calculateCostChemical(
  output: number,
  internalConsumptionRate: number,
  chemicalCost: number
): number {
  // 출력 * (1 - 소내소비율) * 1000 * 약품비 * 24 / 1000000
  return (
    (output *
      (1 - internalConsumptionRate / 100) *
      1000 *
      chemicalCost *
      24) /
    1000000
  );
}

/**
 * 비용 수전료 계산 (백만원)
 * 공식: (출력 * (1 - 소내소비율) * 수전요금단가 * 24 * 1000) / 1000000
 * 출력은 MW 단위이므로 kW로 변환하기 위해 1000을 곱함
 */
export function calculateCostWater(
  output: number,
  internalConsumptionRate: number,
  waterFee: number
): number {
  return (
    (output * 1000 * (1 - internalConsumptionRate / 100) * waterFee * 24) / 1000000
  );
}

/**
 * 시간당 기대수익 계산 (만원)
 * 공식: 공헌이익(백만원/일) / 24 * 10
 */
export function calculateHourlyExpectedProfit(
  contributionProfit: number
): number {
  return (contributionProfit / 24) * 10;
}

/**
 * 전체 발전소 분석 결과 계산
 * PRD의 15단계 계산 공식을 모두 수행하여 결과 반환
 * output은 OutputLevel (93 | 80 | 65) 또는 number 타입을 받을 수 있음
 */
export function calculatePlantAnalysis(
  output: OutputLevel | number,
  inputParams: InputParameters,
  rowInput: PlantRowInput,
  smp: number,
  formulas?: AnalysisTableFormulas
): PlantAnalysisResult {
  // 계산 컨텍스트 준비 (계산식 평가에 사용)
  const createContext = (intermediateValues: Record<string, number>) => ({
    output: output as number,
    smp,
    transmissionEfficiency: rowInput.transmissionEfficiency,
    internalConsumptionRate: rowInput.internalConsumptionRate,
    pksCalorificValue: inputParams.pksCalorificValue,
    wcCalorificValue: inputParams.wcCalorificValue,
    pksUnitPrice: inputParams.pksUnitPrice,
    wcUnitPrice: inputParams.wcUnitPrice,
    ...intermediateValues,
  });

  // 1. 송전량 계산 (MWh/h) - 시간당 송전량
  const defaultTransmissionAmount = calculateTransmissionAmount(
    output,
    rowInput.internalConsumptionRate
  );
  const transmissionAmount = formulas
    ? getCalculatedValue(
        "transmissionAmount",
        formulas,
        createContext({}),
        defaultTransmissionAmount
      )
    : defaultTransmissionAmount;

  // 시간당 송전량 (매출 계산에 사용)
  const hourlyTransmissionAmount = transmissionAmount;

  // 2. 발전효율 계산 (%)
  const defaultGenerationEfficiency = calculateGenerationEfficiency(
    rowInput.transmissionEfficiency,
    rowInput.internalConsumptionRate
  );
  const generationEfficiency = formulas
    ? getCalculatedValue(
        "generationEfficiency",
        formulas,
        createContext({ transmissionAmount }),
        defaultGenerationEfficiency
      )
    : defaultGenerationEfficiency;

  // 3. PKS 연료사용량 계산 (톤/일)
  const defaultPksFuelConsumption = calculatePKSFuelConsumption(
    output,
    generationEfficiency,
    inputParams.wcCalorificValue,
    inputParams.pksCalorificValue
  );
  const pksFuelConsumption = formulas
    ? getCalculatedValue(
        "pksFuelConsumption",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
        }),
        defaultPksFuelConsumption
      )
    : defaultPksFuelConsumption;

  // 4. WC 혼소율 계산 (%)
  const defaultWcCoFiringRate = calculateWCCoFiringRate(
    pksFuelConsumption,
    inputParams.pksCalorificValue,
    inputParams.wcCalorificValue
  );
  const wcCoFiringRateRaw = formulas
    ? getCalculatedValue(
        "wcCoFiringRate",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
        }),
        defaultWcCoFiringRate
      )
    : defaultWcCoFiringRate;
  // 백분율로 변환 (0-1 범위를 0-100으로)
  const wcCoFiringRate = wcCoFiringRateRaw > 1 ? wcCoFiringRateRaw : wcCoFiringRateRaw * 100;

  // 5. PKS 발전단가 계산 (원/kWh)
  const defaultPksGenerationCost = calculatePKSGenerationCost(
    inputParams.pksUnitPrice,
    inputParams.pksCalorificValue,
    rowInput.transmissionEfficiency
  );
  const pksGenerationCost = formulas
    ? getCalculatedValue(
        "pksGenerationCost",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcCoFiringRate: wcCoFiringRateRaw,
        }),
        defaultPksGenerationCost
      )
    : defaultPksGenerationCost;

  // 6. WC 발전단가 계산 (원/kWh)
  const defaultWcGenerationCost = calculateWCGenerationCost(
    inputParams.wcUnitPrice,
    inputParams.wcCalorificValue,
    rowInput.transmissionEfficiency
  );
  const wcGenerationCost = formulas
    ? getCalculatedValue(
        "wcGenerationCost",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcCoFiringRate: wcCoFiringRateRaw,
          pksGenerationCost,
        }),
        defaultWcGenerationCost
      )
    : defaultWcGenerationCost;

  // 총 발전단가
  const defaultTotalGenerationCost =
    pksGenerationCost * (1 - wcCoFiringRateRaw) +
    wcGenerationCost * wcCoFiringRateRaw;
  const totalGenerationCost = formulas
    ? getCalculatedValue(
        "totalGenerationCost",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcCoFiringRate: wcCoFiringRateRaw,
          pksGenerationCost,
          wcGenerationCost,
        }),
        defaultTotalGenerationCost
      )
    : defaultTotalGenerationCost;

  // 7. 약품비 계산 (원/kWh)
  const defaultChemicalCost = calculateChemicalCost(output);
  const chemicalCost = formulas
    ? getCalculatedValue(
        "chemicalCost",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcCoFiringRate: wcCoFiringRateRaw,
          pksGenerationCost,
          wcGenerationCost,
          totalGenerationCost,
        }),
        defaultChemicalCost
      )
    : defaultChemicalCost;

  // 8. 수전요금 계산 (원/kWh)
  const defaultWaterFee = calculateWaterFee(hourlyTransmissionAmount);
  const waterFee = formulas
    ? getCalculatedValue(
        "waterFee",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcCoFiringRate: wcCoFiringRateRaw,
          pksGenerationCost,
          wcGenerationCost,
          totalGenerationCost,
          chemicalCost,
        }),
        defaultWaterFee
      )
    : defaultWaterFee;

  // 9. 매출 전력량 계산 (백만원)
  const defaultSalesPower = calculateSalesPower(
    smp,
    output,
    rowInput.internalConsumptionRate
  );
  const salesPower = formulas
    ? getCalculatedValue(
        "salesPower",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcCoFiringRate: wcCoFiringRateRaw,
          pksGenerationCost,
          wcGenerationCost,
          totalGenerationCost,
          chemicalCost,
          waterFee,
        }),
        defaultSalesPower
      )
    : defaultSalesPower;

  // 10. 매출 REC 계산 (백만원)
  const defaultSalesREC = calculateSalesREC(output, rowInput.internalConsumptionRate);
  const salesREC = formulas
    ? getCalculatedValue(
        "salesREC",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcCoFiringRate: wcCoFiringRateRaw,
          pksGenerationCost,
          wcGenerationCost,
          totalGenerationCost,
          chemicalCost,
          waterFee,
          salesPower,
        }),
        defaultSalesREC
      )
    : defaultSalesREC;

  // 11. 매출 계 계산 (백만원)
  const defaultSalesTotal = salesPower + salesREC;
  const salesTotal = formulas
    ? getCalculatedValue(
        "salesTotal",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcCoFiringRate: wcCoFiringRateRaw,
          pksGenerationCost,
          wcGenerationCost,
          totalGenerationCost,
          chemicalCost,
          waterFee,
          salesPower,
          salesREC,
        }),
        defaultSalesTotal
      )
    : defaultSalesTotal;

  // WC 연료사용량 (고정값)
  const wcFuelConsumption = formulas
    ? getCalculatedValue(
        "wcFuelConsumption",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcCoFiringRate: wcCoFiringRateRaw,
        }),
        WC_FUEL_CONSUMPTION
      )
    : WC_FUEL_CONSUMPTION;

  // 12. 비용 연료비 계산 (백만원)
  const defaultCostFuel = calculateCostFuel(
    pksFuelConsumption,
    inputParams.pksUnitPrice,
    inputParams.wcUnitPrice
  );
  const costFuel = formulas
    ? getCalculatedValue(
        "costFuel",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcFuelConsumption,
          wcCoFiringRate: wcCoFiringRateRaw,
          pksGenerationCost,
          wcGenerationCost,
          totalGenerationCost,
          chemicalCost,
          waterFee,
          salesPower,
          salesREC,
          salesTotal,
        }),
        defaultCostFuel
      )
    : defaultCostFuel;

  // 13. 비용 약품비 계산 (백만원)
  const defaultCostChemical = calculateCostChemical(
    output,
    rowInput.internalConsumptionRate,
    chemicalCost
  );
  const costChemical = formulas
    ? getCalculatedValue(
        "costChemical",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcFuelConsumption,
          wcCoFiringRate: wcCoFiringRateRaw,
          pksGenerationCost,
          wcGenerationCost,
          totalGenerationCost,
          chemicalCost,
          waterFee,
          salesPower,
          salesREC,
          salesTotal,
          costFuel,
        }),
        defaultCostChemical
      )
    : defaultCostChemical;

  // 14. 비용 수전료 계산 (백만원)
  const defaultCostWater = calculateCostWater(
    output,
    rowInput.internalConsumptionRate,
    waterFee
  );
  const costWater = formulas
    ? getCalculatedValue(
        "costWater",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcFuelConsumption,
          wcCoFiringRate: wcCoFiringRateRaw,
          pksGenerationCost,
          wcGenerationCost,
          totalGenerationCost,
          chemicalCost,
          waterFee,
          salesPower,
          salesREC,
          salesTotal,
          costFuel,
          costChemical,
        }),
        defaultCostWater
      )
    : defaultCostWater;

  // 15. 공헌이익 계산 (백만원/일)
  const defaultContributionProfit =
    salesTotal - (costFuel + costChemical + costWater);
  const contributionProfit = formulas
    ? getCalculatedValue(
        "contributionProfit",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcFuelConsumption,
          wcCoFiringRate: wcCoFiringRateRaw,
          pksGenerationCost,
          wcGenerationCost,
          totalGenerationCost,
          chemicalCost,
          waterFee,
          salesPower,
          salesREC,
          salesTotal,
          costFuel,
          costChemical,
          costWater,
        }),
        defaultContributionProfit
      )
    : defaultContributionProfit;

  // 16. 시간당 기대수익 계산 (만원)
  const defaultHourlyExpectedProfit =
    calculateHourlyExpectedProfit(contributionProfit);
  const hourlyExpectedProfit = formulas
    ? getCalculatedValue(
        "hourlyExpectedProfit",
        formulas,
        createContext({
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcFuelConsumption,
          wcCoFiringRate: wcCoFiringRateRaw,
          pksGenerationCost,
          wcGenerationCost,
          totalGenerationCost,
          chemicalCost,
          waterFee,
          salesPower,
          salesREC,
          salesTotal,
          costFuel,
          costChemical,
          costWater,
          contributionProfit,
        }),
        defaultHourlyExpectedProfit
      )
    : defaultHourlyExpectedProfit;

  return {
    output: output as OutputLevel, // 타입 호환성을 위해 OutputLevel로 변환
    transmissionAmount: transmissionAmount, // 시간당 송전량 (MWh/h)
    generationEfficiency,
    transmissionEfficiency: rowInput.transmissionEfficiency,
    internalConsumptionRate: rowInput.internalConsumptionRate,
    wcCoFiringRate: wcCoFiringRate, // 이미 백분율로 변환됨
    pksGenerationCost,
    wcGenerationCost,
    totalGenerationCost,
    chemicalCost,
    waterFee,
    pksFuelConsumption,
    wcFuelConsumption,
    pksCalorificValue: inputParams.pksCalorificValue,
    wcCalorificValue: inputParams.wcCalorificValue,
    pksUnitPrice: inputParams.pksUnitPrice,
    wcUnitPrice: inputParams.wcUnitPrice,
    smp,
    recPrice: REC_PRICE,
    salesPower,
    salesREC,
    salesTotal,
    costFuel,
    costChemical,
    costWater,
    contributionProfit,
    hourlyExpectedProfit,
  };
}

/**
 * 특정 출력 레벨에서 공헌이익이 0이 되는 SMP 계산
 * 공헌이익 = 매출_계 - (비용_연료비 + 비용_약품비 + 비용_수전료) = 0
 * 매출_전력 + 매출_REC = 비용_연료비 + 비용_약품비 + 비용_수전료
 * (SMP * 출력 * (1 - 소내소비율) * 24 * 1000) / 1000000 + 매출_REC = 총비용
 * SMP = (총비용 - 매출_REC) * 1000000 / (출력 * (1 - 소내소비율) * 24 * 1000)
 */
export function calculateBreakEvenSMP(
  output: OutputLevel,
  inputParams: InputParameters,
  rowInput: PlantRowInput
): number {
  // SMP를 제외한 모든 값 계산 (SMP = 0으로 가정)
  const analysis = calculatePlantAnalysis(output, inputParams, rowInput, 0);
  
  // 총 비용 (연료비 + 약품비 + 수전료)
  const totalCost = analysis.costFuel + analysis.costChemical + analysis.costWater;
  
  // 매출_REC (SMP와 무관)
  const salesREC = analysis.salesREC;
  
  // 공헌이익이 0이 되려면: 매출_전력 + 매출_REC = 총비용
  // 매출_전력 = 총비용 - 매출_REC
  const requiredSalesPower = totalCost - salesREC;
  
  // 매출_전력 = (SMP * 출력 * (1 - 소내소비율) * 24 * 1000) / 1000000
  // SMP = 매출_전력 * 1000000 / (출력 * (1 - 소내소비율) * 24 * 1000)
  const hourlyTransmissionAmount = output * (1 - rowInput.internalConsumptionRate / 100);
  const smp = (requiredSalesPower * 1000000) / (hourlyTransmissionAmount * 24 * 1000);
  
  return smp;
}

/**
 * 두 출력 레벨의 공헌이익이 같아지는 SMP 계산
 * 80MW 공헌이익 = 65MW 공헌이익
 * 매출_전력_80 + 매출_REC_80 - 비용_80 = 매출_전력_65 + 매출_REC_65 - 비용_65
 * SMP * hourlyTransmission_80 + 매출_REC_80 - 비용_80 = SMP * hourlyTransmission_65 + 매출_REC_65 - 비용_65
 * SMP * (hourlyTransmission_80 - hourlyTransmission_65) = (비용_80 - 매출_REC_80) - (비용_65 - 매출_REC_65)
 * SMP = [(비용_80 - 매출_REC_80) - (비용_65 - 매출_REC_65)] / (hourlyTransmission_80 - hourlyTransmission_65)
 */
export function calculateEqualProfitSMP(
  inputParams: InputParameters,
  rowInput80: PlantRowInput,
  rowInput65: PlantRowInput
): number {
  // 80MW와 65MW의 분석 (SMP = 0으로 가정)
  const analysis80 = calculatePlantAnalysis(80, inputParams, rowInput80, 0);
  const analysis65 = calculatePlantAnalysis(65, inputParams, rowInput65, 0);
  
  // 시간당 송전량
  const hourlyTransmission80 = 80 * (1 - rowInput80.internalConsumptionRate / 100);
  const hourlyTransmission65 = 65 * (1 - rowInput65.internalConsumptionRate / 100);
  
  // 각 출력 레벨의 총비용 - 매출_REC (SMP와 무관한 부분)
  const costMinusREC80 = analysis80.costFuel + analysis80.costChemical + analysis80.costWater - analysis80.salesREC;
  const costMinusREC65 = analysis65.costFuel + analysis65.costChemical + analysis65.costWater - analysis65.salesREC;
  
  // 공헌이익이 같아지는 조건:
  // SMP * hourlyTransmission80 * 24 * 1000 / 1000000 + analysis80.salesREC - (비용_80) 
  // = SMP * hourlyTransmission65 * 24 * 1000 / 1000000 + analysis65.salesREC - (비용_65)
  // 정리하면:
  // SMP * (hourlyTransmission80 - hourlyTransmission65) * 24 * 1000 / 1000000 = costMinusREC80 - costMinusREC65
  const smp = (costMinusREC80 - costMinusREC65) * 1000000 / ((hourlyTransmission80 - hourlyTransmission65) * 24 * 1000);
  
  return smp;
}

/**
 * 감발 임계값 계산
 * 1. 80MW 출력일 때 공헌이익이 0이 되는 SMP
 * 2. 80MW와 65MW의 공헌이익이 같아지는 지점의 SMP
 * 3. 65MW 출력일 때 공헌이익이 0이 되는 SMP
 */
export function calculateCurtailmentThresholds(
  inputParams: InputParameters,
  plantRowInputs: Record<OutputLevel, PlantRowInput>
): CurtailmentThresholds {
  // 1. 80MW 공헌이익 = 0 지점
  const threshold80MW = calculateBreakEvenSMP(80, inputParams, plantRowInputs[80]);
  
  // 2. 80MW 공헌이익 = 65MW 공헌이익 지점
  const thresholdEqual = calculateEqualProfitSMP(inputParams, plantRowInputs[80], plantRowInputs[65]);
  
  // 3. 65MW 공헌이익 = 0 지점
  const threshold65MWStop = calculateBreakEvenSMP(65, inputParams, plantRowInputs[65]);
  
  return {
    threshold80MW,
    threshold65MW: thresholdEqual, // 80MW = 65MW 공헌이익 지점
    thresholdStop: threshold65MWStop, // 65MW 공헌이익 = 0 지점
  };
}


