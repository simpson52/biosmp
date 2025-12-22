import { cn } from "@/lib/utils";
import { FormulaBlockComponent } from "./FormulaBlock";
import type { FormulaBlock } from "../types";
import { handleDragStart, handleDrop } from "../lib/drag-drop-handler";

interface FormulaCanvasProps {
  blocks: FormulaBlock[];
  draggedBlock: FormulaBlock | null;
  dragOverIndex: number | null;
  onRemoveBlock: (id: string) => void;
  setDraggedBlock: (block: FormulaBlock | null) => void;
  setDragOverIndex: (index: number | null) => void;
  onBlocksChange: (blocks: FormulaBlock[]) => void;
}

export function FormulaCanvas({
  blocks,
  draggedBlock,
  dragOverIndex,
  onRemoveBlock,
  setDraggedBlock,
  setDragOverIndex,
  onBlocksChange,
}: FormulaCanvasProps) {
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  return (
    <div
      className={cn(
        "min-h-[100px] p-4 rounded-[16px] border-2 border-dashed border-gray-200 bg-[#F9FAFB]",
        blocks.length === 0 && "flex items-center justify-center"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (blocks.length === 0) {
          setDragOverIndex(0);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (blocks.length === 0 && draggedBlock) {
          onBlocksChange([draggedBlock]);
        }
        setDragOverIndex(null);
        setDraggedBlock(null);
      }}
    >
      {blocks.length === 0 ? (
        <p className="text-[14px] text-[#8B95A1]">블록을 드래그하여 수식을 만드세요</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {blocks.map((block, index) => (
            <FormulaBlockComponent
              key={block.id}
              block={block}
              onRemove={onRemoveBlock}
              onDragStart={(e, b) => handleDragStart(e, b, setDraggedBlock)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index, draggedBlock, blocks, onBlocksChange, setDraggedBlock, setDragOverIndex)}
              isDragging={draggedBlock?.id === block.id}
              isDragOver={dragOverIndex === index}
            />
          ))}
        </div>
      )}
    </div>
  );
}

