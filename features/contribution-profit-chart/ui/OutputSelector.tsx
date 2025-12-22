import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface OutputSelectorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOutputs: number[];
  tempSelectedOutputs: number[];
  onToggleOutput: (output: number) => void;
  onSave: () => void;
  outputOptions: number[];
}

export function OutputSelector({
  isOpen,
  onOpenChange,
  selectedOutputs,
  tempSelectedOutputs,
  onToggleOutput,
  onSave,
  outputOptions,
}: OutputSelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>출력 레벨 선택</DialogTitle>
          <DialogDescription>
            차트에 표시할 출력 레벨을 선택하세요. (65 ~ 95)
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-5 gap-3">
            {outputOptions.map((output) => {
              const isSelected = tempSelectedOutputs.includes(output);
              return (
                <button
                  key={output}
                  type="button"
                  onClick={() => onToggleOutput(output)}
                  className={cn(
                    "px-4 py-3 rounded-[16px] text-[17px] font-bold transition-all duration-200 active:scale-[0.96]",
                    isSelected
                      ? "bg-[#3182F6] text-white"
                      : "bg-[#F9FAFB] text-[#4E5968] hover:bg-[#F2F4F6]"
                  )}
                >
                  {output}
                </button>
              );
            })}
          </div>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-[#4E5968] text-[17px] font-medium hover:text-[#191F28] underline-offset-4 hover:underline transition-colors"
          >
            취소
          </button>
          <Button
            onClick={onSave}
            disabled={tempSelectedOutputs.length === 0}
            className="min-w-[120px]"
          >
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

