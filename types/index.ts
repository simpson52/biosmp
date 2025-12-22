// 발전소 출력 레벨
export type OutputLevel = 93 | 80 | 65;

// 기본 입력 파라미터
export interface InputParameters {
  // 기준 SMP (원/kWh)
  baseSMP: number;
  // PKS 단위열량 (kcal/kg)
  pksCalorificValue: number;
  // WC 단위열량 (kcal/kg)
  wcCalorificValue: number;
  // PKS 단위가격 (원/톤)
  pksUnitPrice: number;
  // WC 단위가격 (원/톤)
  wcUnitPrice: number;
}

// 감발 임계값 설정
export interface CurtailmentThresholds {
  // 80MW 감발 임계값 (원/kWh)
  threshold80MW: number;
  // 65MW 감발 임계값 (원/kWh)
  threshold65MW: number;
  // 정지 임계값 (원/kWh)
  thresholdStop: number;
}

// 발전소 행별 입력값 (송전효율, 소내소비율)
export interface PlantRowInput {
  // 송전효율 (%)
  transmissionEfficiency: number;
  // 소내소비율 (%)
  internalConsumptionRate: number;
}

// 날짜별 시간대별 SMP 가격 데이터
export interface DailySMPData {
  // 날짜 (예: "2024-12-13")
  date: string;
  // 24시간 SMP 가격 배열 (1시부터 24시까지)
  hourlyPrices: number[];
}

// 시간대별 SMP 가격 변동 추이 데이터
export interface HourlySMPData {
  // 날짜별 SMP 데이터 배열
  dailyData: DailySMPData[];
}

// 발전소 분석 결과 데이터
export interface PlantAnalysisResult {
  // 출력 (MW)
  output: OutputLevel;
  // 송전량 (MWh/일) - 일일 기준
  transmissionAmount: number;
  // 발전효율 (%)
  generationEfficiency: number;
  // 송전효율 (%)
  transmissionEfficiency: number;
  // 소내소비율 (%)
  internalConsumptionRate: number;
  // WC 혼소율 (%)
  wcCoFiringRate: number;
  // PKS 발전단가 (원/kWh)
  pksGenerationCost: number;
  // WC 발전단가 (원/kWh)
  wcGenerationCost: number;
  // 총 발전단가 (원/kWh)
  totalGenerationCost: number;
  // 약품비 (원/kWh)
  chemicalCost: number;
  // 수전요금 (원/kWh)
  waterFee: number;
  // PKS 연료사용량 (톤/일)
  pksFuelConsumption: number;
  // WC 연료사용량 (톤/일) - 고정값 700
  wcFuelConsumption: number;
  // PKS 단위열량 (kcal/kg)
  pksCalorificValue: number;
  // WC 단위열량 (kcal/kg)
  wcCalorificValue: number;
  // PKS 단위가격 (원/톤)
  pksUnitPrice: number;
  // WC 단위가격 (원/톤)
  wcUnitPrice: number;
  // SMP (원/kWh)
  smp: number;
  // REC 가격 (원)
  recPrice: number;
  // 매출 전력량 (백만원)
  salesPower: number;
  // 매출 REC (백만원)
  salesREC: number;
  // 매출 계 (백만원)
  salesTotal: number;
  // 비용 연료비 (백만원)
  costFuel: number;
  // 비용 약품비 (백만원)
  costChemical: number;
  // 비용 수전료 (백만원)
  costWater: number;
  // 공헌이익 (백만원/일)
  contributionProfit: number;
  // 시간당 기대수익 (만원)
  hourlyExpectedProfit: number;
}

// 데이터 소스 타입
export type DataSource = "manual" | "exchange";

// 계산식 편집 타입
export type CalculationMode = "formula" | "fixed";

// 수익 비교 분석 테이블 인자 타입
export type AnalysisTableField =
  | "transmissionAmount" // 송전량
  | "generationEfficiency" // 발전효율
  | "transmissionEfficiency" // 송전효율
  | "internalConsumptionRate" // 소내소비율
  | "wcCoFiringRate" // WC 혼소율
  | "pksGenerationCost" // PKS 발전단가
  | "wcGenerationCost" // WC 발전단가
  | "totalGenerationCost" // 총 발전단가
  | "chemicalCost" // 약품비
  | "waterFee" // 수전요금
  | "salesPower" // 매출 전력량
  | "salesREC" // 매출 REC
  | "salesTotal" // 매출 계
  | "pksFuelConsumption" // PKS 연료사용량
  | "wcFuelConsumption" // WC 연료사용량
  | "costFuel" // 비용 연료비
  | "costChemical" // 비용 약품비
  | "costWater" // 비용 수전료
  | "contributionProfit" // 공헌이익
  | "hourlyExpectedProfit"; // 시간당 수익

// 계산식 편집 설정
export interface CalculationFormula {
  // 계산식 모드 (formula: 계산식 사용, fixed: 고정값 사용)
  mode: CalculationMode;
  // 계산식 (JavaScript 표현식 문자열, mode가 "formula"일 때 사용)
  formula?: string;
  // 고정값 (mode가 "fixed"일 때 사용)
  fixedValue?: number;
}

// 수익 비교 분석 테이블 계산식 설정
export interface AnalysisTableFormulas {
  // 각 인자별 계산식 설정
  [field: string]: CalculationFormula;
}

// 계산식 편집 설정 전체
export interface CalculationSettings {
  // 수익 비교 분석 테이블 계산식 설정
  analysisTableFormulas: AnalysisTableFormulas;
}

// 전체 애플리케이션 상태
export interface AppState {
  // 기본 입력 파라미터
  inputParameters: InputParameters;
  // 감발 임계값
  curtailmentThresholds: CurtailmentThresholds;
  // 발전소 행별 입력값 (93MW, 80MW, 65MW)
  plantRowInputs: Record<OutputLevel, PlantRowInput>;
  // 시간대별 SMP 가격 변동 추이 데이터 (매뉴얼 데이터)
  hourlySMPData: HourlySMPData;
  // 전력거래소 SMP 데이터
  exchangeSMPData: HourlySMPData | null;
  // 현재 선택된 데이터 소스
  currentDataSource: DataSource;
  // 감발 기준 SMP 가격 (원/kWh) - 시간대별 SMP 테이블에서 사용
  curtailmentThreshold: number;
  // 현재 표시 중인 SMP 데이터 (매뉴얼 또는 전력거래소)
  currentSMPData: HourlySMPData;
  // 계산식 편집 설정
  calculationSettings: CalculationSettings;
}

