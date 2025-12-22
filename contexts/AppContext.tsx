"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type {
  AppState,
  InputParameters,
  CurtailmentThresholds,
  PlantRowInput,
  OutputLevel,
  HourlySMPData,
  DataSource,
} from "@/types";
import { loadStateFromStorage, saveStateToStorage } from "@/lib/storage";

interface AppContextType {
  state: AppState;
  updateInputParameters: (params: InputParameters) => void;
  updateCurtailmentThresholds: (thresholds: CurtailmentThresholds) => void;
  updatePlantRowInput: (output: OutputLevel, input: PlantRowInput) => void;
  updateCurtailmentThreshold: (threshold: number) => void;
  updateCurrentSMPData: (data: HourlySMPData) => void;
  updateExchangeSMPData: (data: HourlySMPData | null) => void;
  updateCurrentDataSource: (source: DataSource) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// 기본 상태값
const defaultState: AppState = {
  inputParameters: {
    baseSMP: 150,
    pksCalorificValue: 4000,
    wcCalorificValue: 3750,
    pksUnitPrice: 223000,
    wcUnitPrice: 49000,
  },
  curtailmentThresholds: {
    threshold80MW: 92,
    threshold65MW: 79,
    thresholdStop: 32,
  },
  plantRowInputs: {
    93: {
      transmissionEfficiency: 30.4,
      internalConsumptionRate: 8.4,
    },
    80: {
      transmissionEfficiency: 30.23,
      internalConsumptionRate: 8.7,
    },
    65: {
      transmissionEfficiency: 29.35,
      internalConsumptionRate: 10.5,
    },
  },
  hourlySMPData: {
    dailyData: [
      {
        date: "2024-12-13",
        hourlyPrices: [79, 72, 71, 69, 69, 70, 73, 79, 79, 72, 71, 70, 70, 72, 77, 78, 115, 123, 123, 123, 78, 78, 78, 78],
      },
      {
        date: "2024-12-14",
        hourlyPrices: [79, 71, 71, 71, 71, 71, 71, 73, 71, 66, 66, 66, 66, 66, 70, 73, 79, 123, 123, 79, 79, 79, 79, 79],
      },
      {
        date: "2024-12-15",
        hourlyPrices: [79, 70, 69, 69, 69, 70, 71, 112, 115, 114, 95, 95, 92, 95, 95, 95, 114, 95, 95, 95, 92, 82, 98, 98],
      },
    ],
  },
  exchangeSMPData: null, // 전력거래소 SMP 데이터
  currentDataSource: "manual" as DataSource, // 현재 선택된 데이터 소스
  curtailmentThreshold: 80, // 감발 기준 SMP 가격 (원/kWh)
  currentSMPData: {
    dailyData: [
      {
        date: "2024-12-13",
        hourlyPrices: [79, 72, 71, 69, 69, 70, 73, 79, 79, 72, 71, 70, 70, 72, 77, 78, 115, 123, 123, 123, 78, 78, 78, 78],
      },
      {
        date: "2024-12-14",
        hourlyPrices: [79, 71, 71, 71, 71, 71, 71, 73, 71, 66, 66, 66, 66, 66, 70, 73, 79, 123, 123, 79, 79, 79, 79, 79],
      },
      {
        date: "2024-12-15",
        hourlyPrices: [79, 70, 69, 69, 69, 70, 71, 112, 115, 114, 95, 95, 92, 95, 95, 95, 114, 95, 95, 95, 92, 82, 98, 98],
      },
    ],
  }, // 현재 표시 중인 SMP 데이터 (기본값: 매뉴얼 데이터)
};

export function AppProvider({ children }: { readonly children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  // 초기 로드 시 로컬 스토리지에서 상태 복원
  useEffect(() => {
    const savedState = loadStateFromStorage();
    if (savedState) {
      // 기존 상태에 hourlySMPData가 없으면 기본값으로 병합
      const mergedState: AppState = {
        ...defaultState,
        ...savedState,
        hourlySMPData: savedState.hourlySMPData || defaultState.hourlySMPData,
        exchangeSMPData: savedState.exchangeSMPData ?? defaultState.exchangeSMPData,
        currentDataSource: savedState.currentDataSource || defaultState.currentDataSource,
        currentSMPData: savedState.currentSMPData || savedState.hourlySMPData || defaultState.hourlySMPData,
      };
      setState(mergedState);
    }
    setIsLoaded(true);
  }, []);

  // 상태 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (isLoaded) {
      saveStateToStorage(state);
    }
  }, [state, isLoaded]);

  const updateInputParameters = (params: InputParameters) => {
    setState((prev) => ({
      ...prev,
      inputParameters: params,
    }));
  };

  const updateCurtailmentThresholds = (thresholds: CurtailmentThresholds) => {
    setState((prev) => ({
      ...prev,
      curtailmentThresholds: thresholds,
    }));
  };

  const updatePlantRowInput = (output: OutputLevel, input: PlantRowInput) => {
    setState((prev) => ({
      ...prev,
      plantRowInputs: {
        ...prev.plantRowInputs,
        [output]: input,
      },
    }));
  };

  const updateCurtailmentThreshold = (threshold: number) => {
    setState((prev) => ({
      ...prev,
      curtailmentThreshold: threshold,
    }));
  };

  const updateCurrentSMPData = useCallback((data: HourlySMPData) => {
    setState((prev) => ({
      ...prev,
      currentSMPData: data,
    }));
  }, []);

  const updateExchangeSMPData = useCallback((data: HourlySMPData | null) => {
    setState((prev) => ({
      ...prev,
      exchangeSMPData: data,
    }));
  }, []);

  const updateCurrentDataSource = useCallback((source: DataSource) => {
    setState((prev) => ({
      ...prev,
      currentDataSource: source,
      // 데이터 소스 변경 시 currentSMPData도 업데이트
      currentSMPData: source === "manual" 
        ? prev.hourlySMPData 
        : (prev.exchangeSMPData || prev.hourlySMPData),
    }));
  }, []);

  const contextValue = useMemo(
    () => ({
      state,
      updateInputParameters,
      updateCurtailmentThresholds,
      updatePlantRowInput,
      updateCurtailmentThreshold,
      updateCurrentSMPData,
      updateExchangeSMPData,
      updateCurrentDataSource,
    }),
    [state, updateCurrentSMPData, updateExchangeSMPData, updateCurrentDataSource]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

