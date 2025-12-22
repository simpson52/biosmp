import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { getVariablesByCategory } from "@/lib/variable-mapper";

interface ReferenceStepProps {
  field: string;
  fieldLabel: string;
  referenceVariable: string;
  onVariableSelect: (code: string) => void;
}

export function ReferenceStep({
  field,
  fieldLabel,
  referenceVariable,
  onVariableSelect,
}: ReferenceStepProps) {
  const variablesByCategory = useMemo(() => getVariablesByCategory(), []);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-[18px] font-semibold text-[#191F28] mb-2">
          어떤 값을 참조하시겠습니까?
        </h4>
        <p className="text-[14px] text-[#4E5968]">
          {fieldLabel} 계산에 사용할 기준 값을 선택해주세요.
        </p>
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {Object.entries(variablesByCategory).map(([category, vars]) => (
          <div key={category} className="space-y-2">
            <p className="text-[12px] font-semibold text-[#8B95A1] uppercase tracking-wide">
              {category}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {vars
                .filter((v) => v.code !== field)
                .map((variable) => (
                  <button
                    key={variable.code}
                    type="button"
                    onClick={() => onVariableSelect(variable.code)}
                    className={cn(
                      "p-4 border-2 rounded-[12px] text-left transition-all hover:shadow-md",
                      referenceVariable === variable.code
                        ? "border-[#3182F6] bg-[#E8F3FF]"
                        : "border-gray-200 bg-white hover:border-[#3182F6]/30"
                    )}
                  >
                    <div className="font-medium text-[14px] text-[#191F28]">
                      {variable.label}
                    </div>
                    <div className="text-[12px] text-[#8B95A1] mt-1">
                      {variable.description}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

