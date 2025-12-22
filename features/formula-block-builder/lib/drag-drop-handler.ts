import type { FormulaBlock } from "../types";
import { moveBlock } from "./block-manipulator";

export interface DragDropState {
  draggedBlock: FormulaBlock | null;
  dragOverIndex: number | null;
}

/**
 * 드래그 시작 핸들러
 */
export function handleDragStart(
  e: React.DragEvent,
  block: FormulaBlock,
  setDraggedBlock: (block: FormulaBlock | null) => void
): void {
  setDraggedBlock(block);
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", block.id);
}

/**
 * 드롭 핸들러
 */
export function handleDrop(
  e: React.DragEvent,
  index: number,
  draggedBlock: FormulaBlock | null,
  blocks: FormulaBlock[],
  onBlocksChange: (blocks: FormulaBlock[]) => void,
  setDraggedBlock: (block: FormulaBlock | null) => void,
  setDragOverIndex: (index: number | null) => void
): void {
  e.preventDefault();
  if (draggedBlock) {
    const currentIndex = blocks.findIndex((b) => b.id === draggedBlock.id);
    if (currentIndex !== -1 && currentIndex !== index) {
      const newBlocks = moveBlock(blocks, currentIndex, index);
      onBlocksChange(newBlocks);
    }
  }
  setDragOverIndex(null);
  setDraggedBlock(null);
}

