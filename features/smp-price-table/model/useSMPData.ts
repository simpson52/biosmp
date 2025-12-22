import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { HourlySMPData, DataSource } from "@/types";
import { useAppContext } from "@/contexts/AppContext";
import { fetchSMPData } from "../lib/smp-api";
import { formatDateToYYYYMMDD, formatYYYYMMDDToInput, formatInputToYYYYMMDD } from "../lib/date-formatters";
import { parseNumberInput, formatInputValue } from "@/lib/formatters";

interface UseSMPDataProps {
  hourlySMPData: HourlySMPData;
  readOnly: boolean;
}

export function useSMPData({ hourlySMPData, readOnly }: UseSMPDataProps) {
  const {
    state,
    updateCurtailmentThreshold,
    updateCurrentSMPData,
    updateExchangeSMPData,
    updateCurrentDataSource,
  } = useAppContext();

  const [localDataSource, setLocalDataSource] = useState<DataSource>("manual");
  const dataSource = readOnly ? state.currentDataSource : localDataSource;
  const setDataSource = readOnly ? updateCurrentDataSource : setLocalDataSource;

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
      return dataSource === "manual" ? state.hourlySMPData : (state.exchangeSMPData || { dailyData: [] });
    }
    return dataSource === "manual" ? hourlySMPData : (localExchangeData || { dailyData: [] });
  }, [readOnly, dataSource, state.hourlySMPData, state.exchangeSMPData, hourlySMPData, localExchangeData]);

  // 이전 데이터 참조 (무한 루프 방지)
  const prevDataRef = useRef<HourlySMPData | null>(null);

  // 현재 데이터가 실제로 변경되었을 때만 Context 업데이트
  useEffect(() => {
    if (readOnly) return;

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
      if (dataSource === "exchange" && localExchangeData) {
        updateExchangeSMPData(localExchangeData);
      }
      updateCurrentDataSource(dataSource);
    }
  }, [readOnly, currentData, updateCurrentSMPData, dataSource, localExchangeData, updateExchangeSMPData, updateCurrentDataSource]);

  // 전력거래소 데이터 로드 함수
  const loadExchangeData = useCallback(async () => {
    setIsLoadingExchange(true);
    setExchangeError(null);
    try {
      const data = await fetchSMPData(startDate, endDate);
      if (readOnly) {
        updateExchangeSMPData(data);
        updateCurrentDataSource("exchange");
      } else {
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

  const handleSaveSettings = () => {
    const parsed = parseNumberInput(tempThreshold);
    if (parsed >= 0) {
      updateCurtailmentThreshold(parsed);
    }

    if (dataSource === "exchange") {
      const newStartDate = formatInputToYYYYMMDD(tempStartDate);
      const newEndDate = formatInputToYYYYMMDD(tempEndDate);

      if (newStartDate.length === 8 && newEndDate.length === 8) {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
      }
    }

    setIsSettingsOpen(false);
  };

  const handleOpenSettings = () => {
    setTempThreshold(formatInputValue(curtailmentThreshold, 0));

    if (dataSource === "exchange") {
      setTempStartDate(formatYYYYMMDDToInput(startDate));
      setTempEndDate(formatYYYYMMDDToInput(endDate));
    }

    setIsSettingsOpen(true);
  };

  return {
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
    localExchangeData,
    isLoadingExchange,
    exchangeError,
    currentData,
    loadExchangeData,
    handleSaveSettings,
    handleOpenSettings,
  };
}

