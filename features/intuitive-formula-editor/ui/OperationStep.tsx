import { cn } from "@/lib/utils";
import { AVAILABLE_VARIABLES } from "@/lib/variable-mapper";
import type { OperationType } from "../types";

interface OperationStepProps {
  referenceVariable: string;
  operation: OperationType;
  onOperationSelect: (operation: OperationType) => void;
}

export function OperationStep({
  referenceVariable,
  operation,
  onOperationSelect,
}: OperationStepProps) {
  const operations = [
    { op: "same" as const, label: "그대로 사용", icon: "=" },
    { op: "multiply" as const, label: "곱하기", icon: "×" },
    { op: "divide" as const, label: "나누기", icon: "÷" },
    { op: "add" as const, label: "더하기", icon: "+" },
    { op: "subtract" as const, label: "빼기", icon: "-" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-[18px] font-semibold text-[#191F28] mb-2">
          어떻게 계산하시겠습니까?
        </h4>
        <p className="text-[14px] text-[#4E5968]">
          {AVAILABLE_VARIABLES[referenceVariable]?.label} 값을 어떻게 사용할지 선택해주세요.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {operations.map(({ op, label, icon }) => (
          <button
            key={op}
            type="button"
            onClick={() => onOperationSelect(op)}
            className={cn(
              "p-4 border-2 rounded-[12px] text-center transition-all hover:shadow-md",
              operation === op
                ? "border-[#3182F6] bg-[#E8F3FF]"
                : "border-gray-200 bg-white hover:border-[#3182F6]/30"
            )}
          >
            <div className="text-[24px] mb-2">{icon}</div>
            <div className="text-[13px] font-medium text-[#191F28]">
              {label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

