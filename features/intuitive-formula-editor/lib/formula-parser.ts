import { AVAILABLE_VARIABLES } from "@/lib/variable-mapper";
import type { OperationType } from "../types";

export interface ParsedFormula {
  referenceVariable: string;
  operation: OperationType;
  coefficient: string;
}

/**
 * 간단한 수식 파싱
 */
export function parseSimpleFormula(formula: string): ParsedFormula | null {
  if (!formula) return null;
  
  const multiplyMatch = /^(\w+)\s*\*\s*([\d.]+)$/.exec(formula);
  const divideMatch = /^(\w+)\s*\/\s*([\d.]+)$/.exec(formula);
  const addMatch = /^(\w+)\s*\+\s*([\d.]+)$/.exec(formula);
  const subtractMatch = /^(\w+)\s*-\s*([\d.]+)$/.exec(formula);
  
  if (multiplyMatch) {
    return {
      referenceVariable: multiplyMatch[1],
      operation: "multiply",
      coefficient: multiplyMatch[2],
    };
  }
  if (divideMatch) {
    return {
      referenceVariable: divideMatch[1],
      operation: "divide",
      coefficient: divideMatch[2],
    };
  }
  if (addMatch) {
    return {
      referenceVariable: addMatch[1],
      operation: "add",
      coefficient: addMatch[2],
    };
  }
  if (subtractMatch) {
    return {
      referenceVariable: subtractMatch[1],
      operation: "subtract",
      coefficient: subtractMatch[2],
    };
  }
  if (AVAILABLE_VARIABLES[formula]) {
    return {
      referenceVariable: formula,
      operation: "same",
      coefficient: "1",
    };
  }
  
  return null;
}

