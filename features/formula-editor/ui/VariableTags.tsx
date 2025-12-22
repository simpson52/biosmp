import { useMemo } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { AVAILABLE_VARIABLES } from "@/lib/variable-mapper";
import { formatNumber } from "@/lib/formatters";
import { parseFormulaWithVariables } from "../lib/formula-parser";
import { buildCalculationContext } from "../lib/calculation-context";

interface VariableTagsProps {
  koreanFormula: string;
  field: string;
}

export function VariableTags({ koreanFormula, field }: VariableTagsProps) {
  const { state } = useAppContext();

  const variableTags = useMemo(() => {
    if (!koreanFormula) return null;

    const parts = parseFormulaWithVariables(koreanFormula);
    const variables = parts.filter((p) => p.type === "variable" && p.variableCode);
    const uniqueVariables = Array.from(
      new Map(variables.map((v) => [v.variableCode, v])).values()
    );

    if (uniqueVariables.length === 0) return null;

    // 93MW 기준으로 변수 값 계산
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

    // 계산 결과 변수들 계산
    const fullContext = buildCalculationContext(inputParams, rowInput);

    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {uniqueVariables.map((variable) => {
          const variableCode = variable.variableCode!;
          const variableInfo = AVAILABLE_VARIABLES[variableCode];
          const value = fullContext[variableCode as keyof typeof fullContext];
          
          if (value === undefined) return null;

          return (
            <span
              key={variableCode}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-[16px] text-[14px] font-medium tracking-[-0.02em] shadow-sm"
            >
              <span className="text-[#191F28]">
                {variableInfo?.label || variableCode}
              </span>
              <span className="text-[#3182F6] font-bold">
                {typeof value === "number" 
                  ? (variableCode === "wcCoFiringRate" 
                      ? formatNumber(value * 100, 2) // 표시용: 백분율로 변환
                      : formatNumber(value, variableInfo?.unit === "%" ? 2 : 2))
                  : value}
              </span>
              {variableInfo?.unit && (
                <span className="text-[#8B95A1] text-[13px]">
                  {variableInfo.unit}
                </span>
              )}
            </span>
          );
        })}
      </div>
    );
  }, [koreanFormula, state, field]);

  return variableTags;
}

