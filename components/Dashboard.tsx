"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { calculatePlantAnalysis, calculateCurtailmentThresholds } from "@/lib/calculations";
import { useMemo } from "react";
import { formatNumber, formatCurrency } from "@/lib/formatters";
import { SMPPriceTable } from "@/components/SMPPriceTable";

export function Dashboard() {
  const { state } = useAppContext();

  // 전체 요약 통계 계산
  const summaryStats = useMemo(() => {
    const formulas = state.calculationSettings.analysisTableFormulas;
    const analysis93 = calculatePlantAnalysis(
      93,
      state.inputParameters,
      state.plantRowInputs[93],
      state.inputParameters.baseSMP,
      formulas
    );
    const analysis80 = calculatePlantAnalysis(
      80,
      state.inputParameters,
      state.plantRowInputs[80],
      state.inputParameters.baseSMP,
      formulas
    );
    const analysis65 = calculatePlantAnalysis(
      65,
      state.inputParameters,
      state.plantRowInputs[65],
      state.inputParameters.baseSMP,
      formulas
    );

    return {
      profit93: analysis93.hourlyExpectedProfit,
      profit80: analysis80.hourlyExpectedProfit,
      profit65: analysis65.hourlyExpectedProfit,
      contribution93: analysis93.contributionProfit,
      contribution80: analysis80.contributionProfit,
      contribution65: analysis65.contributionProfit,
    };
  }, [state.inputParameters, state.plantRowInputs, state.calculationSettings]);

  // 감발 임계값 계산 (자동 계산)
  const curtailmentThresholds = useMemo(() => {
    return calculateCurtailmentThresholds(state.inputParameters, state.plantRowInputs);
  }, [state.inputParameters, state.plantRowInputs]);

  return (
    <div className="space-y-8">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[18px] font-semibold text-[#4E5968]">
              93MW 정상 운전
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-[26px] font-bold text-[#191F28] tracking-[-0.03em]">
                {formatCurrency(summaryStats.profit93)}
                <span className="text-[17px] font-medium text-[#8B95A1] ml-1">
                  만원/h
                </span>
              </p>
              <p className="text-[14px] text-[#8B95A1] tracking-[-0.02em]">
                일일 공헌이익: {formatCurrency(summaryStats.contribution93)} 백만원
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[18px] font-semibold text-[#4E5968]">
              80MW 감발 운전
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-[26px] font-bold text-[#191F28] tracking-[-0.03em]">
                {formatCurrency(summaryStats.profit80)}
                <span className="text-[17px] font-medium text-[#8B95A1] ml-1">
                  만원/h
                </span>
              </p>
              <p className="text-[14px] text-[#8B95A1] tracking-[-0.02em]">
                일일 공헌이익: {formatCurrency(summaryStats.contribution80)} 백만원
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[18px] font-semibold text-[#4E5968]">
              65MW 감발 운전
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-[26px] font-bold text-[#191F28] tracking-[-0.03em]">
                {formatCurrency(summaryStats.profit65)}
                <span className="text-[17px] font-medium text-[#8B95A1] ml-1">
                  만원/h
                </span>
              </p>
              <p className="text-[14px] text-[#8B95A1] tracking-[-0.02em]">
                일일 공헌이익: {formatCurrency(summaryStats.contribution65)} 백만원
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 감발 임계값 표시 (자동 계산) */}
      <Card>
        <CardHeader>
          <CardTitle>감발 임계값 (자동 계산)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="text-[14px] font-medium text-[#4E5968]">
                80MW = 65MW 공헌이익 지점 (원/kWh)
              </Label>
              <div className="px-4 py-4 bg-[#F9FAFB] rounded-[20px] border-0">
                <p className="text-[22px] font-bold text-[#191F28] tracking-[-0.02em]">
                  {formatNumber(curtailmentThresholds.threshold65MW, 2)}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[14px] font-medium text-[#4E5968]">
                80MW 공헌이익 = 0 지점 (원/kWh)
              </Label>
              <div className="px-4 py-4 bg-[#F9FAFB] rounded-[20px] border-0">
                <p className="text-[22px] font-bold text-[#191F28] tracking-[-0.02em]">
                  {formatNumber(curtailmentThresholds.threshold80MW, 2)}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[14px] font-medium text-[#4E5968]">
                65MW 공헌이익 = 0 지점 (원/kWh)
              </Label>
              <div className="px-4 py-4 bg-[#F9FAFB] rounded-[20px] border-0">
                <p className="text-[22px] font-bold text-[#191F28] tracking-[-0.02em]">
                  {formatNumber(curtailmentThresholds.thresholdStop, 2)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 시간대별 SMP 가격 변동 추이 (읽기 전용) */}
      <SMPPriceTable hourlySMPData={state.hourlySMPData} readOnly={true} />
    </div>
  );
}

