"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  InputParameters,
  PlantRowInput,
  OutputLevel,
} from "@/types";
import { calculatePlantAnalysis, calculateCurtailmentThresholds } from "@/lib/calculations";
import { useMemo } from "react";
import { formatNumber, formatCurrency, parseNumberInput, formatInputValue } from "@/lib/formatters";

interface InputSectionProps {
  inputParameters: InputParameters;
  plantRowInputs: Record<OutputLevel, PlantRowInput>;
  onInputParametersChange: (params: InputParameters) => void;
}

export function InputSection({
  inputParameters,
  plantRowInputs,
  onInputParametersChange,
}: InputSectionProps) {
  // 시간당 기대수익 계산
  const calculateHourlyProfit = (output: OutputLevel, smp: number) => {
    const analysis = calculatePlantAnalysis(
      output,
      inputParameters,
      plantRowInputs[output],
      smp
    );
    return analysis.hourlyExpectedProfit;
  };

  const handleInputChange = (
    field: keyof InputParameters,
    value: number
  ) => {
    onInputParametersChange({
      ...inputParameters,
      [field]: value,
    });
  };

  // 감발 임계값 계산 (자동 계산)
  const curtailmentThresholds = useMemo(() => {
    return calculateCurtailmentThresholds(inputParameters, plantRowInputs);
  }, [inputParameters, plantRowInputs]);

  // 기준 SMP에 따른 시간당 수익 계산
  const profit93MW = calculateHourlyProfit(93, inputParameters.baseSMP);
  const profit80MW = calculateHourlyProfit(80, inputParameters.baseSMP);
  const profit65MW = calculateHourlyProfit(65, inputParameters.baseSMP);

  return (
    <div className="space-y-8">
      {/* 주요 입력값 */}
      <Card>
        <CardHeader>
          <CardTitle>주요 입력값</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            <div className="space-y-3">
              <Label htmlFor="baseSMP" className="text-[14px] font-medium text-[#4E5968]">기준 SMP (원/kWh)</Label>
              <Input
                id="baseSMP"
                type="text"
                value={formatInputValue(inputParameters.baseSMP, 0)}
                onChange={(e) =>
                  handleInputChange("baseSMP", parseNumberInput(e.target.value))
                }
                className="bg-[#FFF9E6] hover:bg-[#FFF5D1] focus-visible:ring-[#3182F6]/20"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="pksCalorificValue" className="text-[14px] font-medium text-[#4E5968]">PKS 단위열량 (kcal/kg)</Label>
              <Input
                id="pksCalorificValue"
                type="text"
                value={formatInputValue(inputParameters.pksCalorificValue, 0)}
                onChange={(e) =>
                  handleInputChange(
                    "pksCalorificValue",
                    parseNumberInput(e.target.value)
                  )
                }
                className="bg-[#FFF9E6] hover:bg-[#FFF5D1] focus-visible:ring-[#3182F6]/20"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="wcCalorificValue" className="text-[14px] font-medium text-[#4E5968]">WC 단위열량 (kcal/kg)</Label>
              <Input
                id="wcCalorificValue"
                type="text"
                value={formatInputValue(inputParameters.wcCalorificValue, 0)}
                onChange={(e) =>
                  handleInputChange(
                    "wcCalorificValue",
                    parseNumberInput(e.target.value)
                  )
                }
                className="bg-[#FFF9E6] hover:bg-[#FFF5D1] focus-visible:ring-[#3182F6]/20"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="pksUnitPrice" className="text-[14px] font-medium text-[#4E5968]">PKS 단위가격 (원/톤)</Label>
              <Input
                id="pksUnitPrice"
                type="text"
                value={formatInputValue(inputParameters.pksUnitPrice, 0)}
                onChange={(e) =>
                  handleInputChange(
                    "pksUnitPrice",
                    parseNumberInput(e.target.value)
                  )
                }
                className="bg-[#FFF9E6] hover:bg-[#FFF5D1] focus-visible:ring-[#3182F6]/20"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="wcUnitPrice" className="text-[14px] font-medium text-[#4E5968]">WC 단위가격 (원/톤)</Label>
              <Input
                id="wcUnitPrice"
                type="text"
                value={formatInputValue(inputParameters.wcUnitPrice, 0)}
                onChange={(e) =>
                  handleInputChange(
                    "wcUnitPrice",
                    parseNumberInput(e.target.value)
                  )
                }
                className="bg-[#FFF9E6] hover:bg-[#FFF5D1] focus-visible:ring-[#3182F6]/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* 결과 요약 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>시간당 기대 수익 (만원)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-[#E8F3FF] rounded-[20px] border-0 transition-all duration-200 active:scale-[0.96]">
              <p className="text-[14px] font-medium text-[#4E5968] mb-3">93MW (정상)</p>
              <p className="text-[26px] font-bold text-[#191F28] mb-2 tracking-[-0.03em]">
                {formatCurrency(profit93MW)}
              </p>
              <p className="text-[14px] text-[#8B95A1]">만원/h</p>
            </div>
            <div className="text-center p-6 bg-[#E8F3FF] rounded-[20px] border-0 transition-all duration-200 active:scale-[0.96]">
              <p className="text-[14px] font-medium text-[#4E5968] mb-3">80MW (감발1)</p>
              <p className="text-[26px] font-bold text-[#191F28] mb-2 tracking-[-0.03em]">
                {formatCurrency(profit80MW)}
              </p>
              <p className="text-[14px] text-[#8B95A1]">만원/h</p>
            </div>
            <div className="text-center p-6 bg-[#E8F3FF] rounded-[20px] border-0 transition-all duration-200 active:scale-[0.96]">
              <p className="text-[14px] font-medium text-[#4E5968] mb-3">65MW (감발2)</p>
              <p className="text-[26px] font-bold text-[#191F28] mb-2 tracking-[-0.03em]">
                {formatCurrency(profit65MW)}
              </p>
              <p className="text-[14px] text-[#8B95A1]">만원/h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

