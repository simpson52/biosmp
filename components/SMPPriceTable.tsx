"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { HourlySMPData } from "@/types";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { parseNumberInput, formatInputValue } from "@/lib/formatters";

interface SMPPriceTableProps {
  readonly hourlySMPData: HourlySMPData;
}

/**
 * 날짜를 "MM/DD(요일)" 형식으로 포맷팅
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];
  return `${month}/${day}(${weekday})`;
}

/**
 * 날짜의 요일을 반환 (0: 일요일, 6: 토요일)
 */
function getDayOfWeek(dateString: string): number {
  const date = new Date(dateString);
  return date.getDay();
}

export function SMPPriceTable({ hourlySMPData }: SMPPriceTableProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [curtailmentThreshold, setCurtailmentThreshold] = useState(80);
  const [tempThreshold, setTempThreshold] = useState("80");

  const handleSaveSettings = () => {
    const parsed = parseNumberInput(tempThreshold);
    if (parsed >= 0) {
      setCurtailmentThreshold(parsed);
      setIsSettingsOpen(false);
    }
  };

  const handleOpenSettings = () => {
    setTempThreshold(formatInputValue(curtailmentThreshold, 0));
    setIsSettingsOpen(true);
  };

  return (
    <>
      <Card className="elevation-1 hover:elevation-2 transition-shadow duration-material-standard">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-material-gray-900">
              시간대별 SMP 가격 변동 추이
            </CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={handleOpenSettings}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      <CardContent>
        <div className="w-full overflow-hidden">
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr className="bg-[#E0F2F7] border-b-2 border-material-gray-300">
                <th className="bg-[#E0F2F7] w-[70px] h-8 px-1 font-semibold text-[10px] text-material-gray-900 text-center border-r border-material-gray-300">
                  날짜/시간
                </th>
                {Array.from({ length: 24 }, (_, i) => i + 1).map((hour) => (
                  <th
                    key={hour}
                    className="w-[36px] h-8 px-1 font-semibold text-[10px] text-material-gray-900 text-center border-r border-material-gray-300 last:border-r-0"
                  >
                    {hour}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hourlySMPData.dailyData.map((dailyData) => {
                const dayOfWeek = getDayOfWeek(dailyData.date);
                const isSaturday = dayOfWeek === 6; // 토요일
                const isSunday = dayOfWeek === 0; // 일요일
                return (
                  <tr
                    key={dailyData.date}
                    className="hover:bg-material-gray-50/50 transition-colors border-b border-material-gray-100"
                  >
                    <td
                      className={cn(
                        "bg-white font-medium px-1 py-1.5 text-[10px] text-center border-r border-material-gray-200",
                        isSaturday && "text-primary-600", // 토요일: 파란색
                        isSunday && "text-[#D32F2F]" // 일요일: 빨간색 (error-600 색상)
                      )}
                    >
                      {formatDate(dailyData.date)}
                    </td>
                    {dailyData.hourlyPrices.map((price, hourIndex) => {
                      const isBelowThreshold = price <= curtailmentThreshold;
                      return (
                        <td
                          key={`${dailyData.date}-hour-${hourIndex + 1}`}
                          className={cn(
                            "text-center px-1 py-1.5 text-[10px] text-material-gray-900 border-r border-material-gray-200 last:border-r-0",
                            isBelowThreshold && "bg-[#fcb1b1]"
                          )}
                        >
                          {price}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    {/* 설정 다이얼로그 */}
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>감발 기준 SMP 가격 설정</DialogTitle>
          <DialogDescription>
            이 값 이하의 SMP 가격을 가진 시간대는 빨간색으로 표시됩니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="threshold" className="text-sm font-medium text-material-gray-700">
              감발 기준 SMP 가격 (원/kWh)
            </Label>
            <Input
              id="threshold"
              type="text"
              value={tempThreshold}
              onChange={(e) => setTempThreshold(e.target.value)}
              className="bg-[#FFF9E6] border-[#FFE066] hover:bg-[#FFF5D1] focus-visible:border-primary-600"
              placeholder="80"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsSettingsOpen(false)}
          >
            취소
          </Button>
          <Button onClick={handleSaveSettings}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
