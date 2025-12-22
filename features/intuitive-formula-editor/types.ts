import type { CalculationMode } from "@/types";

export interface IntuitiveFormulaEditorProps {
  readonly field: string;
  readonly fieldLabel: string;
  readonly fieldUnit: string;
  readonly currentMode?: CalculationMode;
  readonly currentFormula?: string;
  readonly currentFixedValue?: number;
  readonly onSave: (
    mode: CalculationMode,
    formula: string,
    fixedValue: number
  ) => void;
  readonly onCancel: () => void;
}

export type CalculationStep =
  | "method" // 계산 방식 선택
  | "reference" // 참조 값 선택
  | "operation" // 연산 방법 선택
  | "coefficient" // 계수 입력
  | "fixed" // 고정값 입력
  | "review"; // 최종 확인

export type CalculationMethod = "fixed" | "reference" | "formula";

export type OperationType = "multiply" | "divide" | "add" | "subtract" | "same";

