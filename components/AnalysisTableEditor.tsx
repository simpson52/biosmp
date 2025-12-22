"use client";

import { useState, useMemo } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  AnalysisTableField,
  CalculationFormula,
  CalculationMode,
} from "@/types";
import { formatNumber } from "@/lib/formatters";
import { TextFormulaEditor } from "@/components/TextFormulaEditor";
import { AVAILABLE_VARIABLES } from "@/lib/variable-mapper";
import { evaluateFormula } from "@/lib/formula-evaluator";

interface AnalysisTableEditorProps {
  readonly onClose: () => void;
}

// 영문 코드 수식을 한글 변수명으로 변환 (표시용)
function formatFormulaForDisplay(formula: string): string {
  let result = formula;
  
  // 영문 코드를 한글 변수명으로 변환
  for (const [code, info] of Object.entries(AVAILABLE_VARIABLES)) {
    const regex = new RegExp(String.raw`\b${code}\b`, "g");
    result = result.replaceAll(regex, info.label);
  }
  
  return result;
}

// 인자별 기본 계산식 및 설명
const FIELD_DEFINITIONS: Record<
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

export function AnalysisTableEditor({ onClose }: AnalysisTableEditorProps) {
  const { state, updateCalculationSettings } = useAppContext();
  const [editingField, setEditingField] = useState<AnalysisTableField | null>(
    null
  );

  // 현재 설정된 계산식 가져오기
  const currentFormulas = useMemo(() => {
    return state.calculationSettings.analysisTableFormulas || {};
  }, [state.calculationSettings]);

  // 기본 공식으로 계산된 원래 값 계산
  const getDefaultValue = useMemo(() => {
    return (field: AnalysisTableField): number | null => {
      try {
        const definition = FIELD_DEFINITIONS[field];
        const defaultFormula = definition.defaultFormula;
        
        // 기본 컨텍스트 생성 (93MW 기준)
        const output = 93;
        const inputParams = state.inputParameters;
        const rowInput = state.plantRowInputs[93];
        const smp = state.inputParameters.baseSMP;
        
        // 기본 컨텍스트
        const baseContext: Record<string, number> = {
          output,
          smp,
          transmissionEfficiency: rowInput.transmissionEfficiency,
          internalConsumptionRate: rowInput.internalConsumptionRate,
          pksCalorificValue: inputParams.pksCalorificValue,
          wcCalorificValue: inputParams.wcCalorificValue,
          pksUnitPrice: inputParams.pksUnitPrice,
          wcUnitPrice: inputParams.wcUnitPrice,
        };
        
        // 의존성 있는 필드들의 기본값 계산
        const transmissionAmount = output * (1 - rowInput.internalConsumptionRate / 100);
        const generationEfficiency = rowInput.transmissionEfficiency / (1 - rowInput.internalConsumptionRate / 100);
        const pksFuelConsumption = ((output / (generationEfficiency / 100)) * 860 * 24 - (700 * inputParams.wcCalorificValue)) / inputParams.pksCalorificValue;
        const wcCoFiringRate = (700 * inputParams.wcCalorificValue) / (pksFuelConsumption * inputParams.pksCalorificValue + 700 * inputParams.wcCalorificValue);
        const pksGenerationCost = (inputParams.pksUnitPrice / inputParams.pksCalorificValue) * 860 * (100 / rowInput.transmissionEfficiency) / 1000;
        const wcGenerationCost = (inputParams.wcUnitPrice / inputParams.wcCalorificValue) * 860 * (100 / rowInput.transmissionEfficiency) / 1000;
        const totalGenerationCost = pksGenerationCost * (1 - wcCoFiringRate) + wcGenerationCost * wcCoFiringRate;
        const chemicalCost = output === 93 ? 7.6 : (93 / output) * 7.6 * 0.95;
        const waterFee = 1158000 / (transmissionAmount * 24 * 316);
        const salesPower = (smp * output * 1000 * (1 - rowInput.internalConsumptionRate / 100) * 24) / 1000000;
        const salesREC = (63 * output * 1000 * (1 - rowInput.internalConsumptionRate / 100) * 24) / 1000000;
        const salesTotal = salesPower + salesREC;
        const wcFuelConsumption = 700;
        const costFuel = (pksFuelConsumption * inputParams.pksUnitPrice + 700 * inputParams.wcUnitPrice) / 1000000;
        const costChemical = (output * (1 - rowInput.internalConsumptionRate / 100) * 1000 * chemicalCost * 24) / 1000000;
        const costWater = (output * 1000 * (1 - rowInput.internalConsumptionRate / 100) * waterFee * 24) / 1000000;
        const contributionProfit = salesTotal - (costFuel + costChemical + costWater);
        const hourlyExpectedProfit = (contributionProfit / 24) * 10;
        
        // 전체 컨텍스트
        const fullContext = {
          ...baseContext,
          transmissionAmount,
          generationEfficiency,
          pksFuelConsumption,
          wcFuelConsumption,
          wcCoFiringRate,
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
          hourlyExpectedProfit,
        };
        
        return evaluateFormula(defaultFormula, fullContext);
      } catch (error) {
        console.warn(`Failed to calculate default value for ${field}:`, error);
        return null;
      }
    };
  }, [state.inputParameters, state.plantRowInputs]);

  const handleSaveField = (
    field: AnalysisTableField,
    mode: CalculationMode,
    formula: string,
    fixedValue: number
  ) => {
    const newFormulas = {
      ...currentFormulas,
      [field]: {
        mode,
        formula: mode === "formula" ? formula : undefined,
        fixedValue: mode === "fixed" ? fixedValue : undefined,
      },
    };

    updateCalculationSettings({
      analysisTableFormulas: newFormulas,
    });

    setEditingField(null);
  };

  const handleResetField = (field: AnalysisTableField) => {
    const newFormulas = { ...currentFormulas };
    delete newFormulas[field];

    updateCalculationSettings({
      analysisTableFormulas: newFormulas,
    });
  };

  // 계산값 필드만 표시
  const calculatedFields: AnalysisTableField[] = [
    "transmissionAmount",
    "generationEfficiency",
    "wcCoFiringRate",
    "pksGenerationCost",
    "wcGenerationCost",
    "totalGenerationCost",
    "chemicalCost",
    "waterFee",
    "salesPower",
    "salesREC",
    "salesTotal",
    "pksFuelConsumption",
    "wcFuelConsumption",
    "costFuel",
    "costChemical",
    "costWater",
    "contributionProfit",
    "hourlyExpectedProfit",
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h3 className="text-[24px] font-bold text-[#191F28] tracking-[-0.02em] mb-2">
            수익 비교 분석 테이블 편집
          </h3>
          <p className="text-[14px] text-[#4E5968] tracking-[-0.02em]">
            각 인자에 대한 계산식 또는 고정값을 편집할 수 있습니다.
          </p>
        </div>
        
        {/* 사용 가이드 카드 */}
        <Card className="bg-[#E8F3FF] border-[#3182F6]/20">
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-[14px] font-semibold text-[#191F28] flex items-center gap-2">
                <span>💡</span> 사용 방법
              </p>
              <ul className="text-[13px] text-[#4E5968] space-y-1 ml-6 list-disc">
                <li>
                  <strong>고정값 사용:</strong> 항상 동일한 값으로 계산하고 싶을 때 사용합니다.
                </li>
                <li>
                  <strong>간단한 수식:</strong> 다른 인자를 참조하여 곱하기, 나누기, 더하기, 빼기로 계산합니다.
                </li>
                <li>
                  <strong>고급 계산식:</strong> 복잡한 계산이 필요할 때 JavaScript 표현식을 직접 입력합니다.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 계산값 섹션 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="text-[18px] font-semibold text-[#191F28]">
            계산값
          </h4>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {calculatedFields.map((field) => {
              const definition = FIELD_DEFINITIONS[field];
              const currentSetting = currentFormulas[field];
              const isEditing = editingField === field;
              const isCustomized = currentSetting !== undefined;
              
              // 표시할 공식 결정
              let displayFormula = definition.description;
              if (isCustomized) {
                if (currentSetting.mode === "formula" && currentSetting.formula) {
                  displayFormula = formatFormulaForDisplay(currentSetting.formula);
                } else if (currentSetting.mode === "fixed" && currentSetting.fixedValue !== undefined) {
                  displayFormula = formatNumber(currentSetting.fixedValue, 2);
                }
              }

              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => setEditingField(isEditing ? null : field)}
                  className={cn(
                    "w-full text-left p-3 rounded-[8px] border-2 transition-all",
                    "hover:shadow-md active:scale-[0.98]",
                    isEditing
                      ? "border-[#3182F6] bg-[#E8F3FF]"
                      : "border-gray-200 bg-white hover:border-[#3182F6]/30"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-[#191F28] truncate">
                        {definition.label}
                      </div>
                      <div className="text-[11px] text-[#8B95A1] mt-0.5 truncate">
                        {displayFormula}
                      </div>
                      {isCustomized && (
                        <div className="text-[10px] text-[#3182F6] mt-1 font-medium">
                          ✏️ 사용자 정의
                        </div>
                      )}
                    </div>
                    <div className="text-[12px] text-[#8B95A1] flex-shrink-0">
                      {definition.unit}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 편집 카드 (전체 그리드 너비) */}
          {editingField && (
            <Card className="border-2 border-[#3182F6] shadow-lg w-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h4 className="text-[20px] font-semibold text-[#191F28] mb-4">
                      {FIELD_DEFINITIONS[editingField].label}
                      <span className="text-[16px] font-normal text-[#8B95A1] ml-2">
                        ({FIELD_DEFINITIONS[editingField].unit})
                      </span>
                    </h4>
                    {/* 원래 값(기본값) 표시 */}
                    <div className="p-4 bg-[#F9FAFB] rounded-[8px] border border-gray-200 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-[11px] text-[#3182F6] font-medium bg-[#E8F3FF] px-2 py-0.5 rounded">
                          93MW 기준
                        </div>
                      </div>
                      {(() => {
                        const defaultValue = getDefaultValue(editingField);
                        return (
                          <div className="grid grid-cols-2 gap-4">
                            {/* 원래 값 */}
                            <div>
                              <div className="text-[11px] text-[#8B95A1] mb-1 font-medium">
                                계산값
                              </div>
                              {defaultValue !== null ? (
                                <div className="text-[18px] text-[#191F28] font-bold">
                                  {formatNumber(defaultValue, 2)} {FIELD_DEFINITIONS[editingField].unit}
                                </div>
                              ) : (
                                <div className="text-[14px] text-[#8B95A1]">
                                  계산 불가
                                </div>
                              )}
                            </div>
                            {/* 공식 */}
                            <div>
                              <div className="text-[11px] text-[#8B95A1] mb-1 font-medium">
                                공식
                              </div>
                              <div className="text-[13px] text-[#191F28] font-mono break-all">
                                {FIELD_DEFINITIONS[editingField].description}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    {currentFormulas[editingField] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleResetField(editingField);
                        }}
                      >
                        기본값으로 복원
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingField(null)}
                    className="text-[#8B95A1] hover:text-[#191F28] ml-4 flex-shrink-0"
                  >
                    ✕
                  </Button>
                </div>
                <FieldEditor
                  field={editingField}
                  definition={FIELD_DEFINITIONS[editingField]}
                  currentSetting={currentFormulas[editingField]}
                  onSave={handleSaveField}
                  onCancel={() => setEditingField(null)}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface FieldEditorProps {
  readonly field: AnalysisTableField;
  readonly definition: {
    readonly label: string;
    readonly unit: string;
    readonly defaultFormula: string;
    readonly description: string;
  };
  readonly currentSetting?: CalculationFormula;
  readonly onSave: (
    field: AnalysisTableField,
    mode: CalculationMode,
    formula: string,
    fixedValue: number
  ) => void;
  readonly onCancel: () => void;
}

function FieldEditor({
  field,
  definition,
  currentSetting,
  onSave,
  onCancel,
}: FieldEditorProps) {
  return (
    <TextFormulaEditor
      field={field}
      fieldLabel={definition.label}
      fieldUnit={definition.unit}
      currentMode={currentSetting?.mode}
      currentFormula={currentSetting?.formula}
      currentFixedValue={currentSetting?.fixedValue}
      defaultFormula={definition.defaultFormula}
      onSave={(mode, formula, fixedValue) => {
        onSave(field, mode, formula, fixedValue);
      }}
      onCancel={onCancel}
    />
  );
}





