import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FixedStepProps {
  fieldLabel: string;
  fieldUnit: string;
  fixedValue: string;
  onFixedValueChange: (value: string) => void;
}

export function FixedStep({
  fieldLabel,
  fieldUnit,
  fixedValue,
  onFixedValueChange,
}: FixedStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-[18px] font-semibold text-[#191F28] mb-2">
          고정값을 입력해주세요
        </h4>
        <p className="text-[14px] text-[#4E5968]">
          {fieldLabel}이(가) 항상 이 값으로 계산됩니다.
        </p>
      </div>
      <div className="max-w-md">
        <Label htmlFor="fixed-value-input" className="text-[14px] font-semibold text-[#191F28]">
          값 ({fieldUnit})
        </Label>
        <Input
          id="fixed-value-input"
          type="number"
          value={fixedValue}
          onChange={(e) => onFixedValueChange(e.target.value)}
          placeholder="0"
          className="text-[16px] mt-2"
          autoFocus
        />
      </div>
    </div>
  );
}

