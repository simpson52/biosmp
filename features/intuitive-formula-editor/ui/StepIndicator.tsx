import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalculationStep, CalculationMethod, OperationType } from "../types";

interface StepIndicatorProps {
  step: CalculationStep;
  method: CalculationMethod | undefined;
  operation: OperationType;
}

export function StepIndicator({ step, method, operation }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-[#8B95A1]">
      <span className={cn("px-2 py-1 rounded", step === "method" && "bg-[#3182F6] text-white")}>
        1. 방식 선택
      </span>
      <ChevronRight className="h-3 w-3" />
      {method === "reference" && (
        <div className="flex items-center gap-2">
          <span className={cn("px-2 py-1 rounded", step === "reference" && "bg-[#3182F6] text-white")}>
            2. 참조 선택
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className={cn("px-2 py-1 rounded", step === "operation" && "bg-[#3182F6] text-white")}>
            3. 연산 선택
          </span>
          {operation !== "same" && (
            <div className="flex items-center gap-2">
              <ChevronRight className="h-3 w-3" />
              <span className={cn("px-2 py-1 rounded", step === "coefficient" && "bg-[#3182F6] text-white")}>
                4. 계수 입력
              </span>
            </div>
          )}
        </div>
      )}
      {method === "fixed" && (
        <span className={cn("px-2 py-1 rounded", step === "fixed" && "bg-[#3182F6] text-white")}>
          2. 값 입력
        </span>
      )}
      <ChevronRight className="h-3 w-3" />
      <span className={cn("px-2 py-1 rounded", step === "review" && "bg-[#3182F6] text-white")}>
        확인
      </span>
    </div>
  );
}

