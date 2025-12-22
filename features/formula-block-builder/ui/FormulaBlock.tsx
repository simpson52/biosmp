import { X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormulaBlock } from "../types";

interface FormulaBlockProps {
  block: FormulaBlock;
  onRemove: (id: string) => void;
  onDragStart: (e: React.DragEvent, block: FormulaBlock) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging: boolean;
  isDragOver: boolean;
}

export function FormulaBlockComponent({
  block,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDragOver,
}: FormulaBlockProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, block)}
      onDragOver={(e) => onDragOver(e, 0)}
      onDrop={(e) => onDrop(e, 0)}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-[8px] bg-white border-2 border-gray-200 cursor-move transition-all",
        isDragging && "opacity-50",
        isDragOver && "border-[#3182F6] bg-[#E8F3FF]"
      )}
    >
      <GripVertical className="h-4 w-4 text-[#8B95A1] cursor-grab" />
      <span className="text-[14px] font-medium text-[#191F28]">
        {block.label || block.value}
      </span>
      <button
        type="button"
        onClick={() => onRemove(block.id)}
        className="ml-auto text-[#8B95A1] hover:text-[#F04452] transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

