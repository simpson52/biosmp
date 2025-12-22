import type { FormulaBlock } from "../types";

/**
 * 블록을 수식 문자열로 변환
 */
export function blocksToFormula(blocks: FormulaBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "variable" || block.type === "number") {
        return block.value;
      }
      if (block.type === "operator") {
        return block.value;
      }
      return "";
    })
    .join(" ");
}

/**
 * 블록 추가
 */
export function createBlock(type: FormulaBlock["type"], value: string, label?: string): FormulaBlock {
  return {
    id: `block-${Date.now()}-${Math.random()}`,
    type,
    value,
    label,
  };
}

/**
 * 블록 삭제
 */
export function removeBlock(blocks: FormulaBlock[], id: string): FormulaBlock[] {
  return blocks.filter((block) => block.id !== id);
}

/**
 * 블록 이동
 */
export function moveBlock(blocks: FormulaBlock[], fromIndex: number, toIndex: number): FormulaBlock[] {
  const newBlocks = [...blocks];
  const [removed] = newBlocks.splice(fromIndex, 1);
  newBlocks.splice(toIndex, 0, removed);
  return newBlocks;
}

