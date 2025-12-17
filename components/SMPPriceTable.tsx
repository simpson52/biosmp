"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import type { HourlySMPData, DataSource } from "@/types";
import { cn } from "@/lib/utils";
import { Settings, Loader2, RefreshCw } from "lucide-react";
import { parseNumberInput, formatInputValue } from "@/lib/formatters";
import { fetchSMPDataByDateRange } from "@/lib/api";
import { useAppContext } from "@/contexts/AppContext";

interface SMPPriceTableProps {
  readonly hourlySMPData: HourlySMPData;
  readonly readOnly?: boolean; // 읽기 전용 모드 (대시보드용)
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

/**
 * 날짜를 YYYYMMDD 형식으로 포맷팅
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * YYYYMMDD 형식을 YYYY-MM-DD 형식으로 변환 (input type="date"용)
 */
function formatYYYYMMDDToInput(dateStr: string): string {
  if (dateStr.length === 8) {
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  }
  return dateStr;
}

/**
 * YYYY-MM-DD 형식을 YYYYMMDD 형식으로 변환
 */
function formatInputToYYYYMMDD(dateStr: string): string {
  return dateStr.replaceAll("-", "");
}

export function SMPPriceTable({ hourlySMPData, readOnly = false }: SMPPriceTableProps) {
  const { 
    state, 
    updateCurtailmentThreshold, 
    updateCurrentSMPData,
    updateExchangeSMPData,
    updateCurrentDataSource,
  } = useAppContext();
  
  // 읽기 전용 모드에서는 Context의 데이터 소스 사용, 아니면 로컬 상태 사용
  const [localDataSource, setLocalDataSource] = useState<DataSource>("manual");
  const dataSource = readOnly ? state.currentDataSource : localDataSource;
  
  const setDataSource = readOnly 
    ? updateCurrentDataSource 
    : setLocalDataSource;
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const curtailmentThreshold = state.curtailmentThreshold;
  const [tempThreshold, setTempThreshold] = useState("80");
  
  // 전력거래소 날짜 범위 설정 (기본값: 어제, 오늘, 내일)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const [startDate, setStartDate] = useState<string>(formatDateToYYYYMMDD(yesterday));
  const [endDate, setEndDate] = useState<string>(formatDateToYYYYMMDD(tomorrow));
  const [tempStartDate, setTempStartDate] = useState<string>(formatYYYYMMDDToInput(startDate));
  const [tempEndDate, setTempEndDate] = useState<string>(formatYYYYMMDDToInput(endDate));
  
  // 전력거래소 API 데이터 상태 (로컬 상태는 시뮬레이션 탭에서만 사용)
  const [localExchangeData, setLocalExchangeData] = useState<HourlySMPData | null>(null);
  const [isLoadingExchange, setIsLoadingExchange] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  // 현재 표시할 데이터 결정 (메모이제이션)
  const currentData = useMemo(() => {
    if (readOnly) {
      // 읽기 전용 모드: Context의 데이터 사용
      return dataSource === "manual" ? state.hourlySMPData : (state.exchangeSMPData || { dailyData: [] });
    }
    // 시뮬레이션 탭: 로컬 상태 사용
    return dataSource === "manual" ? hourlySMPData : (localExchangeData || { dailyData: [] });
  }, [readOnly, dataSource, state.hourlySMPData, state.exchangeSMPData, hourlySMPData, localExchangeData]);

  // 이전 데이터 참조 (무한 루프 방지)
  const prevDataRef = useRef<HourlySMPData | null>(null);

  // 현재 데이터가 실제로 변경되었을 때만 Context 업데이트 (읽기 전용 모드에서는 업데이트하지 않음)
  useEffect(() => {
    if (readOnly) {
      // 읽기 전용 모드에서는 Context 업데이트하지 않음
      return;
    }
    
    // 데이터가 실제로 변경되었는지 확인 (깊은 비교 대신 간단한 참조 비교)
    const prevData = prevDataRef.current;
    const hasChanged = 
      !prevData ||
      prevData.dailyData.length !== currentData.dailyData.length ||
      prevData.dailyData.some((prevDaily, index) => {
        const currentDaily = currentData.dailyData[index];
        return !currentDaily ||
          prevDaily.date !== currentDaily.date ||
          prevDaily.hourlyPrices.length !== currentDaily.hourlyPrices.length ||
          prevDaily.hourlyPrices.some((price, i) => price !== currentDaily.hourlyPrices[i]);
      });

    if (hasChanged) {
      prevDataRef.current = currentData;
      updateCurrentSMPData(currentData);
      // 데이터 소스도 함께 업데이트
      if (dataSource === "exchange" && localExchangeData) {
        updateExchangeSMPData(localExchangeData);
      }
      updateCurrentDataSource(dataSource);
    }
  }, [readOnly, currentData, updateCurrentSMPData, dataSource, localExchangeData, updateExchangeSMPData, updateCurrentDataSource]);

  // 전력거래소 데이터 로드 함수 (설정된 날짜 범위 사용)
  const loadExchangeData = useCallback(async () => {
    setIsLoadingExchange(true);
    setExchangeError(null);
    try {
      const data = await fetchSMPDataByDateRange(startDate, endDate);
      if (readOnly) {
        // 읽기 전용 모드에서는 Context 업데이트
        updateExchangeSMPData(data);
        updateCurrentDataSource("exchange");
      } else {
        // 시뮬레이션 탭에서는 로컬 상태 업데이트
        setLocalExchangeData(data);
      }
    } catch (error) {
      console.error("전력거래소 데이터 로드 실패:", error);
      setExchangeError(
        error instanceof Error ? error.message : "데이터를 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoadingExchange(false);
    }
  }, [readOnly, startDate, endDate, updateExchangeSMPData, updateCurrentDataSource]);

  // 자동 새로고침 타이머 참조
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 한국 표준시(KST) 기준으로 다음 23:01까지의 밀리초를 계산
   */
  const getNextAutoRefreshTime = useCallback((): number => {
    const now = new Date();
    
    // 한국 시간대(Asia/Seoul)의 현재 시간 가져오기
    const kstFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    
    const kstParts = kstFormatter.formatToParts(now);
    const year = kstParts.find((p) => p.type === "year")?.value || "";
    const month = kstParts.find((p) => p.type === "month")?.value || "";
    const day = kstParts.find((p) => p.type === "day")?.value || "";
    const hour = Number.parseInt(kstParts.find((p) => p.type === "hour")?.value || "0", 10);
    const minute = Number.parseInt(kstParts.find((p) => p.type === "minute")?.value || "0", 10);
    
    // 오늘 23:01 KST를 ISO 8601 형식으로 생성 (KST = UTC+9)
    const today2301KST = new Date(`${year}-${month}-${day}T23:01:00+09:00`);
    
    // 이미 23:01을 지났다면 내일 23:01로 설정
    if (hour > 23 || (hour === 23 && minute >= 1)) {
      const tomorrow = new Date(today2301KST);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.getTime() - now.getTime();
    }
    
    return today2301KST.getTime() - now.getTime();
  }, []);

  /**
   * 자동 새로고침 설정
   * 전력거래소 탭이 선택된 경우에만 동작 (읽기 전용 모드에서는 자동 새로고침 비활성화)
   */
  useEffect(() => {
    // 읽기 전용 모드이거나 전력거래소 탭이 아닌 경우 타이머 정리
    if (readOnly || dataSource !== "exchange") {
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
      return;
    }

    // 다음 23:01까지의 시간 계산
    const scheduleNextRefresh = () => {
      const delay = getNextAutoRefreshTime();
      
      console.log(`자동 새로고침 예약: ${Math.round(delay / 1000 / 60)}분 후 (23:01 KST)`);
      
      autoRefreshTimerRef.current = setTimeout(() => {
        console.log("자동 새로고침 실행 (23:01 KST)");
        loadExchangeData();
        
        // 다음 날 23:01을 위해 다시 스케줄링
        scheduleNextRefresh();
      }, delay);
    };

    // 초기 스케줄링
    scheduleNextRefresh();

    // 클린업: 컴포넌트 언마운트 또는 탭 변경 시 타이머 정리
    return () => {
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    };
  }, [dataSource, loadExchangeData, getNextAutoRefreshTime]);

  const handleSaveSettings = () => {
    // 감발 기준 SMP 가격 저장
    const parsed = parseNumberInput(tempThreshold);
    if (parsed >= 0) {
      updateCurtailmentThreshold(parsed);
    }
    
    // 전력거래소 탭일 때만 날짜 범위 저장
    if (dataSource === "exchange") {
      const newStartDate = formatInputToYYYYMMDD(tempStartDate);
      const newEndDate = formatInputToYYYYMMDD(tempEndDate);
      
      // 날짜 유효성 검사
      if (newStartDate.length === 8 && newEndDate.length === 8) {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
      }
    }
    
    setIsSettingsOpen(false);
  };

  const handleOpenSettings = () => {
    setTempThreshold(formatInputValue(curtailmentThreshold, 0));
    
    // 전력거래소 탭일 때만 날짜 범위 초기화
    if (dataSource === "exchange") {
      setTempStartDate(formatYYYYMMDDToInput(startDate));
      setTempEndDate(formatYYYYMMDDToInput(endDate));
    }
    
    setIsSettingsOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            {/* 탭 버튼 - 가장 왼쪽에 배치 */}
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
            {/* 오른쪽 버튼들 - 읽기 전용 모드에서는 표시하지 않음 */}
            {!readOnly && (
              <div className="flex items-center gap-2">
                {/* 전력거래소 탭일 때만 새로고침 버튼 표시 */}
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
        {/* 로딩 상태 */}
        {!readOnly && dataSource === "exchange" && isLoadingExchange && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#3182F6] mr-3 stroke-[2.5px]" />
            <span className="text-[17px] font-medium text-[#4E5968]">전력거래소 데이터를 불러오는 중...</span>
          </div>
        )}

        {/* 에러 상태 */}
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

        {/* 데이터 테이블 */}
        {readOnly || (!isLoadingExchange && !exchangeError) || dataSource === "manual" ? (
          <div className="w-full overflow-hidden">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-gray-100">
                  <th className="bg-[#F9FAFB] w-[70px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center border-r border-gray-100 tracking-[-0.02em]">
                    날짜/시간
                  </th>
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((hour) => (
                    <th
                      key={hour}
                      className="w-[36px] h-12 px-2 font-bold text-[14px] text-[#191F28] text-center border-r border-gray-100 last:border-r-0 tracking-[-0.02em]"
                    >
                      {hour}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.dailyData.length > 0 ? (
                  currentData.dailyData.map((dailyData) => {
                const dayOfWeek = getDayOfWeek(dailyData.date);
                const isSaturday = dayOfWeek === 6; // 토요일
                const isSunday = dayOfWeek === 0; // 일요일
                return (
                  <tr
                    key={dailyData.date}
                    className="hover:bg-[#F9FAFB] transition-colors border-b border-gray-50 active:bg-[#F2F4F6]"
                  >
                    <td
                      className={cn(
                        "bg-white font-bold px-3 py-4 text-[14px] text-center border-r border-gray-100 tracking-[-0.02em]",
                        isSaturday && "text-[#3182F6]",
                        isSunday && "text-[#F04452]"
                      )}
                    >
                      {formatDate(dailyData.date)}
                    </td>
                    {dailyData.hourlyPrices.map((price, hourIndex) => {
                      const isBelowThreshold = price > 0 && price <= curtailmentThreshold;
                      // 가격이 0이면 빈 셀로 표시 (데이터 없음)
                      const displayPrice = price > 0 ? Math.round(price * 100) / 100 : "";
                      return (
                        <td
                          key={`${dailyData.date}-hour-${hourIndex + 1}`}
                          className={cn(
                            "text-center px-2 py-4 text-[14px] text-[#191F28] border-r border-gray-100 last:border-r-0 tracking-[-0.02em]",
                            isBelowThreshold && "bg-[#FEE2E2]"
                          )}
                        >
                          {displayPrice}
                        </td>
                      );
                    })}
                  </tr>
                  );
                })
                ) : (
                  <tr>
                    <td
                      colSpan={25}
                      className="text-center py-12 text-[17px] font-medium text-[#8B95A1]"
                    >
                      {dataSource === "exchange"
                        ? "전력거래소 데이터가 없습니다."
                        : "데이터가 없습니다."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>
    </Card>

    {/* 설정 다이얼로그 - 읽기 전용 모드에서는 표시하지 않음 */}
    {!readOnly && (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {dataSource === "exchange" ? "전력거래소 설정" : "감발 기준 SMP 가격 설정"}
          </DialogTitle>
          <DialogDescription>
            {dataSource === "exchange"
              ? "날짜 범위와 감발 기준 SMP 가격을 설정할 수 있습니다."
              : "이 값 이하의 SMP 가격을 가진 시간대는 빨간색으로 표시됩니다."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* 전력거래소 탭일 때만 날짜 범위 설정 표시 */}
          {dataSource === "exchange" && (
            <>
              <div className="grid gap-3">
                <Label htmlFor="startDate" className="text-[14px] font-medium text-[#4E5968]">
                  시작일
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="bg-[#FFF9E6] hover:bg-[#FFF5D1] focus-visible:ring-[#3182F6]/20"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="endDate" className="text-[14px] font-medium text-[#4E5968]">
                  종료일
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="bg-[#FFF9E6] hover:bg-[#FFF5D1] focus-visible:ring-[#3182F6]/20"
                />
              </div>
            </>
          )}
          <div className="grid gap-3">
            <Label htmlFor="threshold" className="text-[14px] font-medium text-[#4E5968]">
              감발 기준 SMP 가격 (원/kWh)
            </Label>
            <Input
              id="threshold"
              type="text"
              value={tempThreshold}
              onChange={(e) => setTempThreshold(e.target.value)}
              className="bg-[#FFF9E6] hover:bg-[#FFF5D1] focus-visible:ring-[#3182F6]/20"
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
    )}
    </>
  );
}
