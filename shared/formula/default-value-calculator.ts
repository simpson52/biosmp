import type { AnalysisTableField, InputParameters, PlantRowInput } from "@/types";
import { evaluateFormula } from "@/lib/formula-evaluator";
import { FIELD_DEFINITIONS } from "./field-definitions";
import { buildCalculationContext } from "@/features/formula-editor/lib/calculation-context";

/**
 * 기본 공식으로 계산된 원래 값 계산
 * 93MW 기준으로 계산 컨텍스트를 생성하고 기본 공식을 평가
 */
export function calculateDefaultValue(
  field: AnalysisTableField,
  inputParams: InputParameters,
  rowInput: PlantRowInput
): number | null {
  try {
    const definition = FIELD_DEFINITIONS[field];
    const defaultFormula = definition.defaultFormula;
    
    // 계산 컨텍스트 생성 (93MW 기준)
    const context = buildCalculationContext(inputParams, rowInput);
    
    return evaluateFormula(defaultFormula, context);
  } catch (error) {
    console.warn(`Failed to calculate default value for ${field}:`, error);
    return null;
  }
}

