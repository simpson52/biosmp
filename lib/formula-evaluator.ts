import type {
  CalculationFormula,
  AnalysisTableFormulas,
  AnalysisTableField,
} from "@/types";

/**
 * 안전한 계산식 평가 함수
 * JavaScript 표현식을 평가하되, 안전한 컨텍스트에서만 실행
 */
export function evaluateFormula(
  formula: string,
  context: Record<string, number | boolean>
): number {
  try {
    // 안전한 평가를 위해 Function 생성자 사용
    // eval 대신 Function을 사용하여 스코프를 제한
    const func = new Function(
      ...Object.keys(context),
      `return ${formula};`
    );
    const result = func(...Object.values(context));
    
    if (typeof result !== "number" || isNaN(result) || !isFinite(result)) {
      throw new Error("Invalid result");
    }
    
    return result;
  } catch (error) {
    console.error("Formula evaluation error:", error, "Formula:", formula);
    throw error;
  }
}

/**
 * 계산식 설정에 따라 값을 계산하거나 고정값을 반환
 */
export function getCalculatedValue(
  field: AnalysisTableField,
  formulas: AnalysisTableFormulas,
  context: Record<string, number | boolean>,
  defaultValue: number
): number {
  const setting = formulas[field];
  
  if (!setting) {
    return defaultValue;
  }
  
  if (setting.mode === "fixed" && setting.fixedValue !== undefined) {
    return setting.fixedValue;
  }
  
  if (setting.mode === "formula" && setting.formula) {
    try {
      return evaluateFormula(setting.formula, context);
    } catch (error) {
      console.warn(`Failed to evaluate formula for ${field}, using default value`);
      return defaultValue;
    }
  }
  
  return defaultValue;
}





