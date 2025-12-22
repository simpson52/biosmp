import { cn } from "@/lib/utils";

interface MethodStepProps {
  fieldLabel: string;
  method: "fixed" | "reference" | "formula" | undefined;
  onMethodSelect: (method: "fixed" | "reference" | "formula") => void;
}

export function MethodStep({ fieldLabel, method, onMethodSelect }: MethodStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-[18px] font-semibold text-[#191F28] mb-2">
          {fieldLabel}을(를) 어떻게 계산하시겠습니까?
        </h4>
        <p className="text-[14px] text-[#4E5968]">
          계산 방식을 선택해주세요.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onMethodSelect("fixed")}
          className={cn(
            "p-6 border-2 rounded-[16px] text-left transition-all hover:shadow-md",
            method === "fixed"
              ? "border-[#3182F6] bg-[#E8F3FF]"
              : "border-gray-200 bg-white hover:border-[#3182F6]/30"
          )}
        >
          <div className="text-[32px] mb-3">🔢</div>
          <div className="font-semibold text-[16px] text-[#191F28] mb-2">
            고정값 사용
          </div>
          <div className="text-[13px] text-[#4E5968]">
            항상 동일한 숫자 값으로 계산합니다
          </div>
        </button>

        <button
          type="button"
          onClick={() => onMethodSelect("reference")}
          className={cn(
            "p-6 border-2 rounded-[16px] text-left transition-all hover:shadow-md",
            method === "reference"
              ? "border-[#3182F6] bg-[#E8F3FF]"
              : "border-gray-200 bg-white hover:border-[#3182F6]/30"
          )}
        >
          <div className="text-[32px] mb-3">🔗</div>
          <div className="font-semibold text-[16px] text-[#191F28] mb-2">
            다른 값 참조
          </div>
          <div className="text-[13px] text-[#4E5968]">
            다른 계산 결과를 참조하여 계산합니다
          </div>
        </button>

        <button
          type="button"
          onClick={() => onMethodSelect("formula")}
          className={cn(
            "p-6 border-2 rounded-[16px] text-left transition-all hover:shadow-md",
            method === "formula"
              ? "border-[#3182F6] bg-[#E8F3FF]"
              : "border-gray-200 bg-white hover:border-[#3182F6]/30"
          )}
        >
          <div className="text-[32px] mb-3">⚙️</div>
          <div className="font-semibold text-[16px] text-[#191F28] mb-2">
            고급 계산식
          </div>
          <div className="text-[13px] text-[#4E5968]">
            복잡한 수식을 직접 입력합니다
          </div>
        </button>
      </div>
    </div>
  );
}

