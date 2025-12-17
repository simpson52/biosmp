"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  InputParameters,
  PlantRowInput,
  PlantAnalysisResult,
} from "@/types";
import { calculatePlantAnalysis } from "@/lib/calculations";
import { useMemo } from "react";
import { formatNumber, formatCurrency, formatPercent } from "@/lib/formatters";

interface DetailedAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputParameters: InputParameters;
  plantRowInputs: Record<93 | 80 | 65, PlantRowInput>;
}

/**
 * 93MW와 80MW 사이의 값을 보간
 */
function interpolateBetween93And80(
  output: number,
  input93: PlantRowInput,
  input80: PlantRowInput
): PlantRowInput {
  // 93MW와 80MW 사이의 비율 계산 (93MW = 1.0, 80MW = 0.0)
  const ratio = (93 - output) / (93 - 80);

  return {
    transmissionEfficiency:
      input93.transmissionEfficiency * (1 - ratio) +
      input80.transmissionEfficiency * ratio,
    internalConsumptionRate:
      input93.internalConsumptionRate * (1 - ratio) +
      input80.internalConsumptionRate * ratio,
  };
}

/**
 * 80MW와 65MW 사이의 값을 보간
 */
function interpolateBetween80And65(
  output: number,
  input80: PlantRowInput,
  input65: PlantRowInput
): PlantRowInput {
  // 80MW와 65MW 사이의 비율 계산 (80MW = 1.0, 65MW = 0.0)
  const ratio = (80 - output) / (80 - 65);

  return {
    transmissionEfficiency:
      input80.transmissionEfficiency * (1 - ratio) +
      input65.transmissionEfficiency * ratio,
    internalConsumptionRate:
      input80.internalConsumptionRate * (1 - ratio) +
      input65.internalConsumptionRate * ratio,
  };
}

/**
 * 특정 출력 레벨에 대한 입력값 보간
 */
function getInterpolatedInput(
  output: number,
  plantRowInputs: Record<93 | 80 | 65, PlantRowInput>
): PlantRowInput {
  if (output === 93) {
    return plantRowInputs[93];
  } else if (output === 80) {
    return plantRowInputs[80];
  } else if (output === 65) {
    return plantRowInputs[65];
  } else if (output > 80 && output < 93) {
    // 93MW와 80MW 사이
    return interpolateBetween93And80(output, plantRowInputs[93], plantRowInputs[80]);
  } else if (output > 65 && output < 80) {
    // 80MW와 65MW 사이
    return interpolateBetween80And65(output, plantRowInputs[80], plantRowInputs[65]);
  } else {
    // 범위 밖이면 가장 가까운 값 사용
    if (output > 93) return plantRowInputs[93];
    return plantRowInputs[65];
  }
}

export function DetailedAnalysisModal({
  open,
  onOpenChange,
  inputParameters,
  plantRowInputs,
}: DetailedAnalysisModalProps) {
  // 93MW부터 65MW까지 1MW 단위로 분석 결과 계산
  const detailedResults = useMemo(() => {
    const results: Array<{
      output: number;
      analysis: PlantAnalysisResult;
    }> = [];

    // 93MW부터 65MW까지 역순으로 (93, 92, 91, ..., 66, 65)
    for (let output = 93; output >= 65; output--) {
      const interpolatedInput = getInterpolatedInput(output, plantRowInputs);
      
      // calculatePlantAnalysis는 이제 number도 받을 수 있음
      const analysis = calculatePlantAnalysis(
        output,
        inputParameters,
        interpolatedInput,
        inputParameters.baseSMP
      );

      results.push({
        output,
        analysis,
      });
    }

    return results;
  }, [inputParameters, plantRowInputs]);

  // 포맷팅 함수는 formatters.ts에서 import

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>상세 수익 비교 분석 (93MW ~ 65MW)</DialogTitle>
          <DialogDescription>
            1MW 단위로 출력 레벨별 수익 분석 결과를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto border border-material-gray-200 rounded-lg">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 z-10 bg-material-gray-50">
              <TableRow className="border-b-2 border-material-gray-300">
                <TableHead className="sticky left-0 z-20 bg-material-gray-50 min-w-[80px] font-semibold text-material-gray-900">
                  출력<br />
                  <span className="text-xs font-normal text-material-gray-500">(MW)</span>
                </TableHead>
                <TableHead className="min-w-[100px] font-semibold text-material-gray-700 text-center">
                  송전량<br />
                  <span className="text-xs font-normal text-material-gray-500">(MWh/h)</span>
                </TableHead>
                <TableHead className="min-w-[100px] font-semibold text-material-gray-700 text-center">
                  발전효율<br />
                  <span className="text-xs font-normal text-material-gray-500">(%)</span>
                </TableHead>
                <TableHead className="min-w-[100px] font-semibold text-material-gray-700 text-center">
                  송전효율<br />
                  <span className="text-xs font-normal text-material-gray-500">(%)</span>
                </TableHead>
                <TableHead className="min-w-[100px] font-semibold text-material-gray-700 text-center">
                  소내소비율<br />
                  <span className="text-xs font-normal text-material-gray-500">(%)</span>
                </TableHead>
                <TableHead className="min-w-[120px] font-semibold text-material-gray-700 text-center border-l-2 border-material-gray-300">
                  매출 계<br />
                  <span className="text-xs font-normal text-material-gray-500">(백만원)</span>
                </TableHead>
                <TableHead className="min-w-[120px] font-semibold text-material-gray-700 text-center">
                  비용 계<br />
                  <span className="text-xs font-normal text-material-gray-500">(백만원)</span>
                </TableHead>
                <TableHead className="min-w-[120px] font-semibold text-material-gray-700 text-center border-l-2 border-material-gray-300 bg-amber-50">
                  공헌이익<br />
                  <span className="text-xs font-normal text-material-gray-500">(백만원/일)</span>
                </TableHead>
                <TableHead className="min-w-[120px] font-semibold text-material-gray-700 text-center bg-primary-50">
                  시간당 수익<br />
                  <span className="text-xs font-normal text-material-gray-500">(만원/h)</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailedResults.map(({ output, analysis }) => {
                const isKnownValue = output === 93 || output === 80 || output === 65;
                const isProfit = analysis.contributionProfit >= 0;
                const totalCost =
                  analysis.costFuel +
                  analysis.costChemical +
                  analysis.costWater;

                return (
                  <TableRow
                    key={output}
                    className={`hover:bg-material-gray-50/50 transition-colors border-b border-material-gray-100 ${
                      isKnownValue ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <TableCell className="sticky left-0 z-10 bg-white font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{output}MW</span>
                        {isKnownValue && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            기준값
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {formatNumber(analysis.transmissionAmount, 2)}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {formatPercent(analysis.generationEfficiency)}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {formatPercent(analysis.transmissionEfficiency)}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {formatPercent(analysis.internalConsumptionRate)}
                    </TableCell>
                    <TableCell className="text-center border-l-2 border-material-gray-200">
                      <span className="text-sm font-medium text-emerald-700">
                        {formatCurrency(analysis.salesTotal)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium text-red-700">
                        {formatCurrency(totalCost)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center border-l-2 border-material-gray-200 bg-amber-50">
                      <span
                        className={`text-base font-bold ${
                          isProfit
                            ? "text-emerald-700"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(analysis.contributionProfit)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center bg-primary-50">
                      <span className="text-base font-semibold text-primary-700">
                        {formatNumber(analysis.hourlyExpectedProfit)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="text-xs text-material-gray-500 space-y-1 pt-4 border-t border-material-gray-200">
          <p>• 93MW, 80MW, 65MW는 실제 측정된 기준값이며, 그 사이 값은 선형 보간으로 계산됩니다</p>
          <p>• 기준값은 파란색 배경으로 표시됩니다</p>
          <p>• 공헌이익이 양수면 녹색, 음수면 빨간색으로 표시됩니다</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

