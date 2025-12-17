"use client";

import { useAppContext } from "@/contexts/AppContext";
import { InputSection } from "@/components/InputSection";
import { AnalysisTable } from "@/components/AnalysisTable";
import { SMPPriceTable } from "@/components/SMPPriceTable";
import { Card, CardContent } from "@/components/ui/card";

export function Simulation() {
  const {
    state,
    updateInputParameters,
    updatePlantRowInput,
  } = useAppContext();

  return (
    <div className="space-y-6">
      {/* 상단: 입력 및 시뮬레이션 제어 */}
      <InputSection
        inputParameters={state.inputParameters}
        plantRowInputs={state.plantRowInputs}
        onInputParametersChange={updateInputParameters}
      />

      {/* 중단: 메인 분석 테이블 */}
      <Card className="elevation-1 hover:elevation-2 transition-shadow duration-material-standard">
        <CardContent className="p-6">
          <AnalysisTable
            inputParameters={state.inputParameters}
            plantRowInputs={state.plantRowInputs}
            onPlantRowInputChange={updatePlantRowInput}
          />
        </CardContent>
      </Card>

      {/* 하단: 시간대별 SMP 가격 변동 추이 */}
      <SMPPriceTable hourlySMPData={state.hourlySMPData} />
    </div>
  );
}

