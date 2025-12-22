import { useMemo } from "react";
import { getVariablesByCategory } from "@/lib/variable-mapper";

interface VariableListProps {
  field: string;
  onVariableClick: (label: string) => void;
}

export function VariableList({ field, onVariableClick }: VariableListProps) {
  const variablesByCategory = useMemo(() => getVariablesByCategory(), []);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[24px] p-6 shadow-sm max-h-[300px] overflow-y-auto">
        <div className="space-y-4">
          {Object.entries(variablesByCategory).map(([category, vars]) => {
            const filteredVars = vars.filter((v) => v.code !== field);
            if (filteredVars.length === 0) return null;
            
            return (
              <div key={category}>
                <p className="text-[14px] font-semibold text-[#8B95A1] mb-2 tracking-[-0.02em]">
                  {category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {filteredVars.map((variable) => (
                    <button
                      key={variable.code}
                      type="button"
                      onClick={() => onVariableClick(variable.label)}
                      className="px-4 py-2 bg-[#F9FAFB] rounded-[16px] text-[14px] font-medium text-[#191F28] hover:bg-[#E8F3FF] active:scale-[0.96] transition-all tracking-[-0.02em]"
                      title={variable.description}
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

