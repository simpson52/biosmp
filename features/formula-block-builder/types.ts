export type BlockType = "variable" | "operator" | "number" | "parenthesis";

export interface FormulaBlock {
  id: string;
  type: BlockType;
  value: string; // 변수 코드 또는 연산자 또는 숫자
  label?: string; // 표시용 라벨
}

export interface FormulaBlockBuilderProps {
  readonly value: FormulaBlock[];
  readonly onChange: (blocks: FormulaBlock[]) => void;
  readonly onFormulaChange: (formula: string) => void;
  readonly currentField?: string; // 현재 편집 중인 필드 (자기 자신 제외용)
}

