import { Plus, Minus, X as Multiply, Divide } from "lucide-react";
import { getVariablesByCategory } from "@/lib/variable-mapper";
import { useMemo } from "react";
import type { BlockType } from "../types";

interface BlockPaletteProps {
  currentField?: string;
  onAddBlock: (type: BlockType, value: string, label?: string) => void;
}

export function BlockPalette({ currentField, onAddBlock }: BlockPaletteProps) {
  const variablesByCategory = useMemo(() => getVariablesByCategory(), []);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-[14px] font-semibold text-[#191F28] mb-3">연산자</h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onAddBlock("operator", "+", "+")}
            className="px-4 py-2 bg-[#F9FAFB] rounded-[8px] text-[14px] font-medium text-[#191F28] hover:bg-[#E8F3FF] transition-colors"
          >
            <Plus className="h-4 w-4 inline mr-1" />
            더하기
          </button>
          <button
            type="button"
            onClick={() => onAddBlock("operator", "-", "-")}
            className="px-4 py-2 bg-[#F9FAFB] rounded-[8px] text-[14px] font-medium text-[#191F28] hover:bg-[#E8F3FF] transition-colors"
          >
            <Minus className="h-4 w-4 inline mr-1" />
            빼기
          </button>
          <button
            type="button"
            onClick={() => onAddBlock("operator", "*", "×")}
            className="px-4 py-2 bg-[#F9FAFB] rounded-[8px] text-[14px] font-medium text-[#191F28] hover:bg-[#E8F3FF] transition-colors"
          >
            <Multiply className="h-4 w-4 inline mr-1" />
            곱하기
          </button>
          <button
            type="button"
            onClick={() => onAddBlock("operator", "/", "÷")}
            className="px-4 py-2 bg-[#F9FAFB] rounded-[8px] text-[14px] font-medium text-[#191F28] hover:bg-[#E8F3FF] transition-colors"
          >
            <Divide className="h-4 w-4 inline mr-1" />
            나누기
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-[14px] font-semibold text-[#191F28] mb-3">변수</h4>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {Object.entries(variablesByCategory).map(([category, vars]) => {
            const filteredVars = vars.filter((v) => v.code !== currentField);
            if (filteredVars.length === 0) return null;

            return (
              <div key={category}>
                <p className="text-[12px] font-semibold text-[#8B95A1] mb-2">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {filteredVars.map((variable) => (
                    <button
                      key={variable.code}
                      type="button"
                      onClick={() => onAddBlock("variable", variable.code, variable.label)}
                      className="px-3 py-1.5 bg-[#F9FAFB] rounded-[8px] text-[13px] font-medium text-[#191F28] hover:bg-[#E8F3FF] transition-colors"
                    >
                      {variable.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

