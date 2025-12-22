"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, getDayOfWeek } from "../lib/date-formatters";
import { useSMPData } from "../model/useSMPData";
import { SMPTableHeader } from "./SMPTableHeader";
import { SMPTableCell } from "./SMPTableCell";
import { SettingsDialog } from "./SettingsDialog";
import type { SMPPriceTableProps } from "../types";

export function SMPPriceTable({ hourlySMPData, readOnly = false }: SMPPriceTableProps) {
  const {
    dataSource,
    setDataSource,
    isSettingsOpen,
    setIsSettingsOpen,
    curtailmentThreshold,
    tempThreshold,
    setTempThreshold,
    startDate,
    endDate,
    tempStartDate,
    tempEndDate,
    setTempStartDate,
    setTempEndDate,
    isLoadingExchange,
    exchangeError,
    currentData,
    loadExchangeData,
    handleSaveSettings,
    handleOpenSettings,
  } = useSMPData({ hourlySMPData, readOnly });

  const handlePriceChange = (date: string, hour: number, newPrice: number) => {
    // 가격 변경 로직은 상위 컴포넌트에서 처리
    // 여기서는 로컬 상태 업데이트만 수행
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-[#F9FAFB] rounded-[16px] p-1">
              <button
                type="button"
                onClick={() => setDataSource("manual")}
                className={cn(
                  "px-4 py-2 text-[17px] font-medium rounded-[14px] transition-all duration-200 active:scale-[0.96]",
                  dataSource === "manual"
                    ? "bg-white text-[#191F28] shadow-sm"
                    : "text-[#4E5968] hover:text-[#191F28]"
                )}
              >
                매뉴얼
              </button>
              <button
                type="button"
                onClick={() => setDataSource("exchange")}
                className={cn(
                  "px-4 py-2 text-[17px] font-medium rounded-[14px] transition-all duration-200 active:scale-[0.96]",
                  dataSource === "exchange"
                    ? "bg-white text-[#191F28] shadow-sm"
                    : "text-[#4E5968] hover:text-[#191F28]"
                )}
              >
                전력거래소
              </button>
            </div>
            {!readOnly && (
              <div className="flex items-center gap-2">
                {dataSource === "exchange" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={loadExchangeData}
                    disabled={isLoadingExchange}
                    title="데이터 새로고침"
                  >
                    <RefreshCw className={cn("h-5 w-5 stroke-[2.5px]", isLoadingExchange && "animate-spin")} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenSettings}
                >
                  <Settings className="h-5 w-5 stroke-[2.5px]" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!readOnly && dataSource === "exchange" && isLoadingExchange && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#3182F6] mr-3 stroke-[2.5px]" />
              <span className="text-[17px] font-medium text-[#4E5968]">전력거래소 데이터를 불러오는 중...</span>
            </div>
          )}

          {!readOnly && dataSource === "exchange" && exchangeError && !isLoadingExchange && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-[17px] font-medium text-[#F04452] mb-4">{exchangeError}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={loadExchangeData}
              >
                다시 시도
              </Button>
            </div>
          )}

          {(readOnly || (!isLoadingExchange && !exchangeError) || dataSource === "manual") && (
            <div className="w-full overflow-hidden">
              <table className="w-full border-collapse text-[14px]">
                <SMPTableHeader />
                <tbody>
                  {currentData.dailyData.length > 0 ? (
                    currentData.dailyData.map((dailyData) => {
                      const dayOfWeek = getDayOfWeek(dailyData.date);
                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                      return (
                        <tr key={dailyData.date} className={cn("border-b border-gray-100", isWeekend && "bg-[#F9FAFB]")}>
                          <td className="bg-[#F9FAFB] w-[70px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center border-r border-gray-100 tracking-[-0.02em]">
                            {formatDate(dailyData.date)}
                          </td>
                          {dailyData.hourlyPrices.map((price, hourIndex) => (
                            <SMPTableCell
                              key={hourIndex}
                              price={price}
                              curtailmentThreshold={curtailmentThreshold}
                              isWeekend={isWeekend}
                              readOnly={readOnly}
                              onPriceChange={(newPrice) => handlePriceChange(dailyData.date, hourIndex + 1, newPrice)}
                            />
                          ))}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={25} className="text-center py-12 text-[#8B95A1]">
                        데이터가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        curtailmentThreshold={curtailmentThreshold}
        tempThreshold={tempThreshold}
        onTempThresholdChange={setTempThreshold}
        dataSource={dataSource}
        startDate={startDate}
        endDate={endDate}
        tempStartDate={tempStartDate}
        tempEndDate={tempEndDate}
        onTempStartDateChange={setTempStartDate}
        onTempEndDateChange={setTempEndDate}
        onSave={handleSaveSettings}
      />
    </>
  );
}

