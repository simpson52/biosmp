import { AVAILABLE_VARIABLES } from "@/lib/variable-mapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OperationType } from "../types";

interface CoefficientStepProps {
  referenceVariable: string;
  operation: OperationType;
  coefficient: string;
  onCoefficientChange: (value: string) => void;
}

export function CoefficientStep({
  referenceVariable,
  operation,
  coefficient,
  onCoefficientChange,
}: CoefficientStepProps) {
  const operationLabels = {
    multiply: "곱할",
    divide: "나눌",
    add: "더할",
    subtract: "뺄",
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-[18px] font-semibold text-[#191F28] mb-2">
          계수를 입력해주세요
        </h4>
        <p className="text-[14px] text-[#4E5968]">
          {AVAILABLE_VARIABLES[referenceVariable]?.label}에 {operationLabels[operation]} 숫자를 입력해주세요.
        </p>
      </div>
      <div className="max-w-md">
        <Label htmlFor="coefficient-input" className="text-[14px] font-semibold text-[#191F28]">
          계수
        </Label>
        <Input
          id="coefficient-input"
          type="number"
          value={coefficient}
          onChange={(e) => onCoefficientChange(e.target.value)}
          placeholder="1"
          className="text-[16px] mt-2"
          autoFocus
        />
        <p className="text-[12px] text-[#8B95A1] mt-2">
          예: 1.1 (10% 증가), 0.9 (10% 감소), 2 (2배)
        </p>
      </div>
    </div>
  );
}

