"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { calculatePlantAnalysis, calculateCurtailmentThresholds } from "@/lib/calculations";
import { useMemo } from "react";
import { formatNumber, formatCurrency } from "@/lib/formatters";

export function Dashboard() {
  const { state } = useAppContext();

  // 전체 요약 통계 계산
  const summaryStats = useMemo(() => {
    const analysis93 = calculatePlantAnalysis(
      93,
      state.inputParameters,
      state.plantRowInputs[93],
      state.inputParameters.baseSMP
    );
    const analysis80 = calculatePlantAnalysis(
      80,
      state.inputParameters,
      state.plantRowInputs[80],
      state.inputParameters.baseSMP
    );
    const analysis65 = calculatePlantAnalysis(
      65,
      state.inputParameters,
      state.plantRowInputs[65],
      state.inputParameters.baseSMP
    );

    return {
      profit93: analysis93.hourlyExpectedProfit,
      profit80: analysis80.hourlyExpectedProfit,
      profit65: analysis65.hourlyExpectedProfit,
      contribution93: analysis93.contributionProfit,
      contribution80: analysis80.contributionProfit,
      contribution65: analysis65.contributionProfit,
    };
  }, [state.inputParameters, state.plantRowInputs]);

  // 감발 임계값 계산 (자동 계산)
  const curtailmentThresholds = useMemo(() => {
    return calculateCurtailmentThresholds(state.inputParameters, state.plantRowInputs);
  }, [state.inputParameters, state.plantRowInputs]);

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="elevation-1 hover:elevation-2 transition-shadow duration-material-standard">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-material-gray-600">
              93MW 정상 운전
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl font-medium text-material-gray-900">
                {formatCurrency(summaryStats.profit93)}
                <span className="text-sm font-normal text-material-gray-500 ml-1">
                  만원/h
                </span>
              </p>
              <p className="text-xs text-material-gray-500">
                일일 공헌이익: {formatCurrency(summaryStats.contribution93)} 백만원
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="elevation-1 hover:elevation-2 transition-shadow duration-material-standard">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-material-gray-600">
              80MW 감발 운전
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl font-medium text-material-gray-900">
                {formatCurrency(summaryStats.profit80)}
                <span className="text-sm font-normal text-material-gray-500 ml-1">
                  만원/h
                </span>
              </p>
              <p className="text-xs text-material-gray-500">
                일일 공헌이익: {formatCurrency(summaryStats.contribution80)} 백만원
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="elevation-1 hover:elevation-2 transition-shadow duration-material-standard">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-material-gray-600">
              65MW 감발 운전
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl font-medium text-material-gray-900">
                {formatCurrency(summaryStats.profit65)}
                <span className="text-sm font-normal text-material-gray-500 ml-1">
                  만원/h
                </span>
              </p>
              <p className="text-xs text-material-gray-500">
                일일 공헌이익: {formatCurrency(summaryStats.contribution65)} 백만원
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 감발 임계값 표시 (자동 계산) */}
      <Card className="elevation-1 hover:elevation-2 transition-shadow duration-material-standard">
        <CardHeader>
          <CardTitle>감발 임계값 (자동 계산)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-material-gray-700">
                80MW = 65MW 공헌이익 지점 (원/kWh)
              </Label>
              <div className="px-4 py-3 bg-material-gray-50 rounded-xl border border-material-gray-200">
                <p className="text-lg font-semibold text-material-gray-900">
                  {formatNumber(curtailmentThresholds.threshold65MW, 2)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-material-gray-700">
                80MW 공헌이익 = 0 지점 (원/kWh)
              </Label>
              <div className="px-4 py-3 bg-material-gray-50 rounded-xl border border-material-gray-200">
                <p className="text-lg font-semibold text-material-gray-900">
                  {formatNumber(curtailmentThresholds.threshold80MW, 2)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-material-gray-700">
                65MW 공헌이익 = 0 지점 (원/kWh)
              </Label>
              <div className="px-4 py-3 bg-material-gray-50 rounded-xl border border-material-gray-200">
                <p className="text-lg font-semibold text-material-gray-900">
                  {formatNumber(curtailmentThresholds.thresholdStop, 2)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

