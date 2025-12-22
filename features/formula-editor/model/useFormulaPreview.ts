import { useMemo } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { evaluateFormula } from "@/lib/formula-evaluator";
import { parseKoreanFormula } from "../lib/formula-parser";
import { buildCalculationContext } from "../lib/calculation-context";

interface UseFormulaPreviewProps {
  mode: "fixed" | "formula";
  koreanFormula: string;
}

export function useFormulaPreview({ mode, koreanFormula }: UseFormulaPreviewProps) {
  const { state } = useAppContext();

  // 계산식 예상 결과 계산
  const calculatePreviewResult = useMemo(() => {
    if (mode !== "formula" || !koreanFormula) return null;
    
    try {
      const englishFormula = parseKoreanFormula(koreanFormula);
      if (!englishFormula.trim()) return null;
      
      // 디버깅: 변환된 공식 확인
      if (process.env.NODE_ENV === "development") {
        console.log("[Formula Debug] Korean:", koreanFormula);
        console.log("[Formula Debug] English:", englishFormula);
      }
      
      const rowInput = state.plantRowInputs[93];
      
      if (!rowInput) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[Formula Debug] rowInput for 93MW not found");
        }
        return null;
      }
      
      const context = buildCalculationContext(state.inputParameters, rowInput);
      
      // 디버깅: 컨텍스트 확인
      if (process.env.NODE_ENV === "development") {
        const missingVars = englishFormula.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g)?.filter(
          (varName) => !context.hasOwnProperty(varName) && !["Math", "Number", "parseFloat", "parseInt"].includes(varName)
        );
        if (missingVars && missingVars.length > 0) {
          console.warn("[Formula Debug] Missing variables:", missingVars);
          console.log("[Formula Debug] Available context keys:", Object.keys(context));
        }
      }
      
      const result = evaluateFormula(englishFormula, context);
      
      // 결과 검증
      if (typeof result !== "number" || !isFinite(result)) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[Formula Debug] Invalid result:", result);
        }
        return null;
      }
      
      return result;
    } catch (error) {
      // 상세한 에러 정보 로깅
      console.error("[Formula Error] Calculation failed:", error);
      if (error instanceof Error) {
        console.error("[Formula Error] Message:", error.message);
        console.error("[Formula Error] Stack:", error.stack);
      }
      if (process.env.NODE_ENV === "development") {
        console.error("[Formula Error] Korean formula:", koreanFormula);
        try {
          const englishFormula = parseKoreanFormula(koreanFormula);
          console.error("[Formula Error] English formula:", englishFormula);
        } catch (parseError) {
          console.error("[Formula Error] Parse error:", parseError);
        }
      }
      return null;
    }
  }, [mode, koreanFormula, state]);

  return {
    calculatePreviewResult,
  };
}

