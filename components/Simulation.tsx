"use client";

import { useAppContext } from "@/contexts/AppContext";
import { InputSection } from "@/components/InputSection";
import { AnalysisTable } from "@/components/AnalysisTable";
import { SMPPriceTable } from "@/components/SMPPriceTable";
import { CurtailmentSummary } from "@/components/CurtailmentSummary";
import { ContributionProfitChart } from "@/components/ContributionProfitChart";
import { Card, CardContent } from "@/components/ui/card";

export function Simulation() {
  const {
    state,
    updateInputParameters,
    updatePlantRowInput,
  } = useAppContext();

  return (
    <div className="space-y-8">
      {/* 상단: 입력 및 시뮬레이션 제어 */}
      <InputSection
        inputParameters={state.inputParameters}
        plantRowInputs={state.plantRowInputs}
        onInputParametersChange={updateInputParameters}
      />

      {/* 중단: 메인 분석 테이블 */}
      <Card>
        <CardContent className="p-6">
          <AnalysisTable
            inputParameters={state.inputParameters}
            plantRowInputs={state.plantRowInputs}
            onPlantRowInputChange={updatePlantRowInput}
            formulas={state.calculationSettings.analysisTableFormulas}
          />
        </CardContent>
      </Card>

      {/* 하단: 시간대별 SMP 가격 변동 추이 */}
      <SMPPriceTable hourlySMPData={state.hourlySMPData} />

      {/* 최하단: 2열 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 왼쪽 카드: 공헌이익 비교 차트 */}
        <ContributionProfitChart
          inputParameters={state.inputParameters}
          plantRowInputs={state.plantRowInputs}
          formulas={state.calculationSettings.analysisTableFormulas}
        />

        {/* 오른쪽 카드: 감발 요약 테이블 */}
        <CurtailmentSummary
          hourlySMPData={state.currentSMPData}
          inputParameters={state.inputParameters}
          plantRowInputs={state.plantRowInputs}
          curtailmentThreshold={state.curtailmentThreshold}
          formulas={state.calculationSettings.analysisTableFormulas}
        />
      </div>
    </div>
  );
}

