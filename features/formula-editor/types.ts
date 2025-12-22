import type { CalculationMode } from "@/types";

export interface TextFormulaEditorProps {
  readonly field: string;
  readonly fieldLabel: string;
  readonly fieldUnit: string;
  readonly currentMode?: CalculationMode;
  readonly currentFormula?: string;
  readonly currentFixedValue?: number;
  readonly defaultFormula?: string; // 기본 공식 (변수 블럭으로 표시)
  readonly onSave: (
    mode: CalculationMode,
    formula: string,
    fixedValue: number
  ) => void;
  readonly onCancel: () => void;
}

export interface FormulaPart {
  type: "variable" | "text";
  content: string;
  variableCode?: string;
}

export interface VariableMatch {
  start: number;
  end: number;
  code: string;
  label: string;
}

export interface AutocompleteOption {
  code: string;
  label: string;
  description: string;
}

