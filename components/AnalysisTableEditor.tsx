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
import { formatFormulaForDisplay } from "@/features/formula-editor/lib/formula-formatter";
import { FIELD_DEFINITIONS } from "@/shared/formula/field-definitions";
import { calculateDefaultValue } from "@/shared/formula/default-value-calculator";

interface AnalysisTableEditorProps {
  readonly onClose: () => void;
}

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
      return calculateDefaultValue(
        field,
        state.inputParameters,
        state.plantRowInputs[93]
      );
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

  // 섹션별 필드 분류
  const userInputFields: AnalysisTableField[] = [
    "transmissionEfficiency",
    "internalConsumptionRate",
  ];

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
    "costFuel",
    "costChemical",
    "costWater",
    "contributionProfit",
    "hourlyExpectedProfit",
  ];

  const fixedFields: AnalysisTableField[] = [
    "wcFuelConsumption",
  ];

  // 필드 버튼 렌더링 함수
  const renderFieldButton = (field: AnalysisTableField) => {
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
          "w-full text-left p-2 rounded-[8px] border-2 transition-all",
          "hover:shadow-md active:scale-[0.98]",
          isEditing
            ? "border-[#3182F6] bg-[#E8F3FF]"
            : "border-gray-200 bg-white hover:border-[#3182F6]/30"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-[#191F28] truncate">
              {definition.label}
            </div>
            <div className="text-[10px] text-[#8B95A1] mt-0.5 truncate">
              {displayFormula}
            </div>
            {isCustomized && (
              <div className="text-[9px] text-[#3182F6] mt-0.5 font-medium">
                ✏️ 사용자 정의
              </div>
            )}
          </div>
          <div className="text-[11px] text-[#8B95A1] flex-shrink-0">
            {definition.unit}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div>
          <h3 className="text-[20px] font-bold text-[#191F28] tracking-[-0.02em] mb-1">
            수익 비교 분석 테이블 편집
          </h3>
          <p className="text-[13px] text-[#4E5968] tracking-[-0.02em]">
            각 인자에 대한 계산식 또는 고정값을 편집할 수 있습니다.
          </p>
        </div>
        
        {/* 사용 가이드 카드 */}
        <Card className="bg-[#E8F3FF] border-[#3182F6]/20">
          <CardContent className="p-3">
            <div className="space-y-1.5">
              <p className="text-[13px] font-semibold text-[#191F28] flex items-center gap-2">
                <span>💡</span> 사용 방법
              </p>
              <ul className="text-[12px] text-[#4E5968] space-y-0.5 ml-5 list-disc">
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

      {/* 필드 섹션들 */}
      <div className="space-y-4">
        {/* 사용자 입력 값 섹션 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-[15px] font-semibold text-[#191F28]">
              사용자 입력 값
            </h4>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {userInputFields.map(renderFieldButton)}
          </div>
        </div>

        {/* 계산 값 섹션 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-[15px] font-semibold text-[#191F28]">
              계산 값
            </h4>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {calculatedFields.map(renderFieldButton)}
          </div>
        </div>

        {/* 고정 값 섹션 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-[15px] font-semibold text-[#191F28]">
              고정 값
            </h4>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {fixedFields.map(renderFieldButton)}
          </div>
        </div>
      </div>

      {/* 편집 카드 섹션 */}
      <div className="space-y-4">

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
                    {(() => {
                      const defaultValue = getDefaultValue(editingField);
                      return (
                        <div className="text-[14px] text-[#4E5968] mb-4">
                          <span className="text-[#3182F6] font-medium">93MW 기준</span>
                          {" "}계산값:{" "}
                          {defaultValue !== null ? (
                            <span className="text-[#191F28] font-semibold">
                              {formatNumber(defaultValue, 2)} {FIELD_DEFINITIONS[editingField].unit}
                            </span>
                          ) : (
                            <span className="text-[#8B95A1]">계산 불가</span>
                          )}
                          {", "}
                          공식:{" "}
                          <span className="text-[#191F28] font-mono">
                            {FIELD_DEFINITIONS[editingField].description}
                          </span>
                        </div>
                      );
                    })()}
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





