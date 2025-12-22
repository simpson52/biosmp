import { AVAILABLE_VARIABLES } from "@/lib/variable-mapper";

/**
 * 영문 코드 수식을 한글 변수명으로 변환 (표시용)
 */
export function formatFormulaForDisplay(formula: string): string {
  if (!formula) return "";
  
  let result = formula;
  
  // 영문 코드를 한글 변수명으로 변환
  for (const [code, info] of Object.entries(AVAILABLE_VARIABLES)) {
    const regex = new RegExp(String.raw`\b${code}\b`, "g");
    result = result.replaceAll(regex, info.label);
  }
  
  return result;
}

