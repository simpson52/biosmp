import { cn } from "@/lib/utils";

interface ModeSelectorProps {
  mode: "fixed" | "formula";
  onModeChange: (mode: "fixed" | "formula") => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onModeChange("formula")}
          className={cn(
            "p-6 rounded-[24px] text-left transition-all active:scale-[0.96]",
            mode === "formula"
              ? "bg-[#E8F3FF]"
              : "bg-white hover:bg-[#F9FAFB]"
          )}
        >
          <div className="font-bold text-[17px] text-[#191F28] mb-1 tracking-[-0.02em]">
            계산식
          </div>
          <div className="text-[14px] text-[#8B95A1] tracking-[-0.02em]">
            한글 변수명으로 입력
          </div>
        </button>
        <button
          type="button"
          onClick={() => onModeChange("fixed")}
          className={cn(
            "p-6 rounded-[24px] text-left transition-all active:scale-[0.96]",
            mode === "fixed"
              ? "bg-[#E8F3FF]"
              : "bg-white hover:bg-[#F9FAFB]"
          )}
        >
          <div className="font-bold text-[17px] text-[#191F28] mb-1 tracking-[-0.02em]">
            고정값
          </div>
          <div className="text-[14px] text-[#8B95A1] tracking-[-0.02em]">
            숫자 직접 입력
          </div>
        </button>
      </div>
    </div>
  );
}

