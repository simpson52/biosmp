import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseNumberInput, formatInputValue } from "@/lib/formatters";
import { formatYYYYMMDDToInput, formatInputToYYYYMMDD } from "../lib/date-formatters";
import type { DataSource } from "../types";

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  curtailmentThreshold: number;
  tempThreshold: string;
  onTempThresholdChange: (value: string) => void;
  dataSource: DataSource;
  startDate: string;
  endDate: string;
  tempStartDate: string;
  tempEndDate: string;
  onTempStartDateChange: (value: string) => void;
  onTempEndDateChange: (value: string) => void;
  onSave: () => void;
}

export function SettingsDialog({
  isOpen,
  onOpenChange,
  curtailmentThreshold,
  tempThreshold,
  onTempThresholdChange,
  dataSource,
  startDate,
  endDate,
  tempStartDate,
  tempEndDate,
  onTempStartDateChange,
  onTempEndDateChange,
  onSave,
}: SettingsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>설정</DialogTitle>
          <DialogDescription>
            감발 기준 SMP 가격과 전력거래소 데이터 범위를 설정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="threshold-input" className="text-[14px] font-semibold text-[#191F28]">
              감발 기준 SMP 가격 (원/kWh)
            </Label>
            <Input
              id="threshold-input"
              type="text"
              value={tempThreshold}
              onChange={(e) => onTempThresholdChange(e.target.value)}
              placeholder="80"
              className="text-[16px]"
            />
            <p className="text-[12px] text-[#8B95A1]">
              이 가격 이상일 때 감발 조건으로 표시됩니다.
            </p>
          </div>

          {dataSource === "exchange" && (
            <div className="space-y-4">
              <div className="h-px bg-gray-200" />
              <div className="space-y-2">
                <Label className="text-[14px] font-semibold text-[#191F28]">
                  전력거래소 데이터 범위
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date-input" className="text-[13px] text-[#4E5968]">
                      시작 날짜
                    </Label>
                    <Input
                      id="start-date-input"
                      type="date"
                      value={tempStartDate}
                      onChange={(e) => onTempStartDateChange(e.target.value)}
                      className="text-[16px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date-input" className="text-[13px] text-[#4E5968]">
                      종료 날짜
                    </Label>
                    <Input
                      id="end-date-input"
                      type="date"
                      value={tempEndDate}
                      onChange={(e) => onTempEndDateChange(e.target.value)}
                      className="text-[16px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={onSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

