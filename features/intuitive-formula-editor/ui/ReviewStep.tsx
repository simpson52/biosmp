import { AVAILABLE_VARIABLES } from "@/lib/variable-mapper";
import type { CalculationMethod, OperationType } from "../types";

interface ReviewStepProps {
  fieldLabel: string;
  fieldUnit: string;
  method: CalculationMethod;
  fixedValue: string;
  referenceVariable: string;
  operation: OperationType;
  coefficient: string;
}

export function ReviewStep({
  fieldLabel,
  fieldUnit,
  method,
  fixedValue,
  referenceVariable,
  operation,
  coefficient,
}: ReviewStepProps) {
  const getPreviewFormula = (): string => {
    if (method === "fixed") {
      return `${fixedValue} ${fieldUnit}`;
    }
    if (!referenceVariable) return "";
    
    const refLabel = AVAILABLE_VARIABLES[referenceVariable]?.label || referenceVariable;
    if (operation === "same") {
      return refLabel;
    }
    const opSymbol = {
      multiply: "×",
      divide: "÷",
      add: "+",
      subtract: "-",
    }[operation];
    return `${refLabel} ${opSymbol} ${coefficient}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-[18px] font-semibold text-[#191F28] mb-2">
          설정 확인
        </h4>
        <p className="text-[14px] text-[#4E5968]">
          아래와 같이 계산됩니다. 저장하시겠습니까?
        </p>
      </div>
      <div className="p-6 bg-[#F9FAFB] rounded-[16px] border-2 border-gray-200">
        <div className="space-y-3">
          <div>
            <p className="text-[12px] text-[#8B95A1] mb-1">계산 대상</p>
            <p className="text-[16px] font-semibold text-[#191F28]">
              {fieldLabel} ({fieldUnit})
            </p>
          </div>
          <div className="h-px bg-gray-200" />
          <div>
            <p className="text-[12px] text-[#8B95A1] mb-1">계산 방식</p>
            <p className="text-[16px] font-semibold text-[#191F28]">
              {getPreviewFormula()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

