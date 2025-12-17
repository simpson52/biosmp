"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type {
  AppState,
  InputParameters,
  CurtailmentThresholds,
  PlantRowInput,
  OutputLevel,
} from "@/types";
import { loadStateFromStorage, saveStateToStorage } from "@/lib/storage";

interface AppContextType {
  state: AppState;
  updateInputParameters: (params: InputParameters) => void;
  updateCurtailmentThresholds: (thresholds: CurtailmentThresholds) => void;
  updatePlantRowInput: (output: OutputLevel, input: PlantRowInput) => void;
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

  const contextValue = useMemo(
    () => ({
      state,
      updateInputParameters,
      updateCurtailmentThresholds,
      updatePlantRowInput,
    }),
    [state]
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

