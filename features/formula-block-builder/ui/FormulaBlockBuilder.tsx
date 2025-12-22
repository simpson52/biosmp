"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { blocksToFormula, createBlock, removeBlock } from "../lib/block-manipulator";
import { FormulaCanvas } from "./FormulaCanvas";
import { BlockPalette } from "./BlockPalette";
import type { FormulaBlockBuilderProps, BlockType } from "../types";

export function FormulaBlockBuilder({
  value,
  onChange,
  onFormulaChange,
  currentField,
}: FormulaBlockBuilderProps) {
  const [draggedBlock, setDraggedBlock] = useState<typeof value[0] | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [numberValue, setNumberValue] = useState("");

  const handleBlocksChange = (newBlocks: typeof value) => {
    onChange(newBlocks);
    const formula = blocksToFormula(newBlocks);
    onFormulaChange(formula);
  };

  const addBlock = (type: BlockType, blockValue: string, label?: string) => {
    const newBlock = createBlock(type, blockValue, label);
    handleBlocksChange([...value, newBlock]);
  };

  const removeBlockHandler = (id: string) => {
    const newBlocks = removeBlock(value, id);
    handleBlocksChange(newBlocks);
  };

  const addNumberBlock = () => {
    const num = Number.parseFloat(numberValue);
    if (!Number.isNaN(num)) {
      addBlock("number", numberValue, numberValue);
      setNumberValue("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="number-input" className="text-[14px] font-semibold text-[#191F28]">
          숫자 추가
        </Label>
        <div className="flex gap-2">
          <Input
            id="number-input"
            type="number"
            value={numberValue}
            onChange={(e) => setNumberValue(e.target.value)}
            placeholder="숫자 입력"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addNumberBlock();
              }
            }}
          />
          <button
            type="button"
            onClick={addNumberBlock}
            className="px-4 py-2 bg-[#3182F6] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#2563EB] transition-colors"
          >
            추가
          </button>
        </div>
      </div>

      <FormulaCanvas
        blocks={value}
        draggedBlock={draggedBlock}
        dragOverIndex={dragOverIndex}
        onRemoveBlock={removeBlockHandler}
        setDraggedBlock={setDraggedBlock}
        setDragOverIndex={setDragOverIndex}
        onBlocksChange={handleBlocksChange}
      />

      <BlockPalette currentField={currentField} onAddBlock={addBlock} />
    </div>
  );
}

