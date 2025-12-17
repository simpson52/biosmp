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
    <div className="space-y-4">
      {/* 주요 입력값 */}
      <Card>
        <CardHeader>
          <CardTitle>주요 입력값</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseSMP" className="text-xs font-medium text-material-gray-700">기준 SMP (원/kWh)</Label>
              <Input
                id="baseSMP"
                type="text"
                value={formatInputValue(inputParameters.baseSMP, 0)}
                onChange={(e) =>
                  handleInputChange("baseSMP", parseNumberInput(e.target.value))
                }
                className="bg-[#FFF9E6] border-[#FFE066] hover:bg-[#FFF5D1] focus-visible:border-primary-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pksCalorificValue" className="text-xs font-medium text-material-gray-700">PKS 단위열량 (kcal/kg)</Label>
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
                className="bg-[#FFF9E6] border-[#FFE066] hover:bg-[#FFF5D1] focus-visible:border-primary-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wcCalorificValue" className="text-xs font-medium text-material-gray-700">WC 단위열량 (kcal/kg)</Label>
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
                className="bg-[#FFF9E6] border-[#FFE066] hover:bg-[#FFF5D1] focus-visible:border-primary-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pksUnitPrice" className="text-xs font-medium text-material-gray-700">PKS 단위가격 (원/톤)</Label>
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
                className="bg-[#FFF9E6] border-[#FFE066] hover:bg-[#FFF5D1] focus-visible:border-primary-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wcUnitPrice" className="text-xs font-medium text-material-gray-700">WC 단위가격 (원/톤)</Label>
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
                className="bg-[#FFF9E6] border-[#FFE066] hover:bg-[#FFF5D1] focus-visible:border-primary-600"
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

      {/* 결과 요약 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>시간당 기대 수익 (만원)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-6 bg-primary-50 rounded-lg border border-primary-200 elevation-1 transition-all duration-material-standard hover:elevation-2">
              <p className="text-xs font-medium text-material-gray-600 mb-2">93MW (정상)</p>
              <p className="text-2xl font-medium text-material-gray-900 mb-1">
                {formatCurrency(profit93MW)}
              </p>
              <p className="text-xs text-material-gray-500">만원/h</p>
            </div>
            <div className="text-center p-6 bg-secondary-50 rounded-lg border border-secondary-200 elevation-1 transition-all duration-material-standard hover:elevation-2">
              <p className="text-xs font-medium text-material-gray-600 mb-2">80MW (감발1)</p>
              <p className="text-2xl font-medium text-material-gray-900 mb-1">
                {formatCurrency(profit80MW)}
              </p>
              <p className="text-xs text-material-gray-500">만원/h</p>
            </div>
            <div className="text-center p-6 bg-success-50 rounded-lg border border-success-200 elevation-1 transition-all duration-material-standard hover:elevation-2">
              <p className="text-xs font-medium text-material-gray-600 mb-2">65MW (감발2)</p>
              <p className="text-2xl font-medium text-material-gray-900 mb-1">
                {formatCurrency(profit65MW)}
              </p>
              <p className="text-xs text-material-gray-500">만원/h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

