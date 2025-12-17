"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type {
  InputParameters,
  PlantRowInput,
  OutputLevel,
  PlantAnalysisResult,
} from "@/types";
import { calculatePlantAnalysis } from "@/lib/calculations";
import { useMemo, useState } from "react";
import { DetailedAnalysisModal } from "@/components/DetailedAnalysisModal";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatCurrency, formatPercent, parseNumberInput, formatInputValue } from "@/lib/formatters";

interface AnalysisTableProps {
  inputParameters: InputParameters;
  plantRowInputs: Record<OutputLevel, PlantRowInput>;
  onPlantRowInputChange: (
    output: OutputLevel,
    input: PlantRowInput
  ) => void;
}

export function AnalysisTable({
  inputParameters,
  plantRowInputs,
  onPlantRowInputChange,
}: AnalysisTableProps) {
  // 각 출력 레벨별 분석 결과 계산
  const analysisResults = useMemo(() => {
    const results: Record<OutputLevel, PlantAnalysisResult> = {
      93: calculatePlantAnalysis(
        93,
        inputParameters,
        plantRowInputs[93],
        inputParameters.baseSMP
      ),
      80: calculatePlantAnalysis(
        80,
        inputParameters,
        plantRowInputs[80],
        inputParameters.baseSMP
      ),
      65: calculatePlantAnalysis(
        65,
        inputParameters,
        plantRowInputs[65],
        inputParameters.baseSMP
      ),
    };
    return results;
  }, [inputParameters, plantRowInputs]);

  const handleInputChange = (
    output: OutputLevel,
    field: keyof PlantRowInput,
    value: number
  ) => {
    onPlantRowInputChange(output, {
      ...plantRowInputs[output],
      [field]: value,
    });
  };

  // 포맷팅 함수는 formatters.ts에서 import

  const rows: OutputLevel[] = [93, 80, 65];

  const getOutputLabel = (output: OutputLevel) => {
    switch (output) {
      case 93:
        return { label: "93MW" };
      case 80:
        return { label: "80MW" };
      case 65:
        return { label: "65MW" };
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* 헤더와 더보기 버튼 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-material-gray-900">
          수익 비교 분석
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-2"
        >
          더보기
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 개선된 테이블 */}
      <div className="border border-material-gray-200 rounded-lg overflow-hidden elevation-1">
        <div className="overflow-x-auto">
          <Table className="min-w-full border-collapse text-xs">
            <TableHeader>
              <TableRow className="bg-material-gray-50 border-b-2 border-material-gray-300">
                <TableHead className="sticky left-0 z-10 bg-material-gray-50 min-w-[80px] h-10 px-2 font-semibold text-xs text-material-gray-900">
                  출력 레벨
                </TableHead>
                <TableHead className="min-w-[90px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center border-l-2 border-material-gray-300 bg-amber-50">
                  공헌이익<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(백만원/일)</span>
                </TableHead>
                <TableHead className="min-w-[90px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center bg-primary-50">
                  시간당 수익<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(만원/h)</span>
                </TableHead>
                <TableHead className="min-w-[80px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center">
                  송전량<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(MWh/h)</span>
                </TableHead>
                <TableHead className="min-w-[75px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center">
                  발전효율<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(%)</span>
                </TableHead>
                <TableHead className="min-w-[80px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center">
                  송전효율<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(%)</span>
                </TableHead>
                <TableHead className="min-w-[80px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center">
                  소내소비율<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(%)</span>
                </TableHead>
                <TableHead className="min-w-[75px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center">
                  WC 혼소율<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(%)</span>
                </TableHead>
                <TableHead className="min-w-[90px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center border-l-2 border-material-gray-300">
                  발전단가<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(원/kWh)</span>
                </TableHead>
                <TableHead className="min-w-[75px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center">
                  약품비<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(원/kWh)</span>
                </TableHead>
                <TableHead className="min-w-[75px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center">
                  수전요금<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(원/kWh)</span>
                </TableHead>
                <TableHead className="min-w-[90px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center border-l-2 border-material-gray-300">
                  매출 전력량<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(백만원)</span>
                </TableHead>
                <TableHead className="min-w-[80px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center">
                  매출 REC<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(백만원)</span>
                </TableHead>
                <TableHead className="min-w-[80px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center bg-emerald-50">
                  매출 계<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(백만원)</span>
                </TableHead>
                <TableHead className="min-w-[75px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center border-l-2 border-material-gray-300">
                  연료비<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(백만원)</span>
                </TableHead>
                <TableHead className="min-w-[75px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center">
                  약품비<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(백만원)</span>
                </TableHead>
                <TableHead className="min-w-[75px] h-10 px-2 font-semibold text-xs text-material-gray-700 text-center">
                  수전료<br />
                  <span className="text-[10px] font-normal text-material-gray-500">(백만원)</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((output) => {
                const result = analysisResults[output];
                const outputInfo = getOutputLabel(output);
                const isProfit = result.contributionProfit >= 0;

                return (
                  <TableRow
                    key={output}
                    className="hover:bg-material-gray-50/50 transition-colors border-b border-material-gray-100"
                  >
                    {/* 출력 레벨 - 고정 컬럼 */}
                    <TableCell className="sticky left-0 z-10 bg-white font-semibold px-2 py-1.5">
                      <span className="text-sm">{outputInfo.label}</span>
                    </TableCell>

                    {/* 공헌이익 */}
                    <TableCell
                      className={cn(
                        "text-center border-l-2 border-material-gray-200 bg-amber-50 px-2 py-1.5",
                        isProfit ? "text-success-700" : "text-error-700"
                      )}
                    >
                      <span className="text-sm font-bold">
                        {formatCurrency(result.contributionProfit)}
                      </span>
                    </TableCell>

                    {/* 시간당 수익 */}
                    <TableCell
                      className={cn(
                        "text-center bg-primary-50 px-2 py-1.5",
                        isProfit ? "text-success-700" : "text-error-700"
                      )}
                    >
                      <span className="text-sm font-semibold">
                        {formatCurrency(result.hourlyExpectedProfit)}
                      </span>
                    </TableCell>

                    {/* 송전량 */}
                    <TableCell className="text-center text-xs px-2 py-1.5">
                      {formatNumber(result.transmissionAmount, 2)}
                    </TableCell>

                    {/* 발전효율 */}
                    <TableCell className="text-center text-xs px-2 py-1.5">
                      {formatPercent(result.generationEfficiency)}
                    </TableCell>

                    {/* 송전효율 - 입력 필드 */}
                    <TableCell className="text-center px-2 py-1.5">
                      <Input
                        type="text"
                        value={formatInputValue(result.transmissionEfficiency, 2)}
                        onChange={(e) => {
                          const parsed = parseNumberInput(e.target.value);
                          handleInputChange(
                            output,
                            "transmissionEfficiency",
                            parsed
                          );
                        }}
                        className="w-full h-7 bg-[#FFF9E6] border-[#FFE066] hover:bg-[#FFF5D1] focus-visible:border-primary-600 text-xs text-center px-1"
                      />
                    </TableCell>

                    {/* 소내소비율 - 입력 필드 */}
                    <TableCell className="text-center px-2 py-1.5">
                      <Input
                        type="text"
                        value={formatInputValue(result.internalConsumptionRate, 2)}
                        onChange={(e) => {
                          const parsed = parseNumberInput(e.target.value);
                          handleInputChange(
                            output,
                            "internalConsumptionRate",
                            parsed
                          );
                        }}
                        className="w-full h-7 bg-[#FFF9E6] border-[#FFE066] hover:bg-[#FFF5D1] focus-visible:border-primary-600 text-xs text-center px-1"
                      />
                    </TableCell>

                    {/* WC 혼소율 */}
                    <TableCell className="text-center text-xs px-2 py-1.5">
                      {formatPercent(result.wcCoFiringRate)}
                    </TableCell>

                    {/* 발전단가 */}
                    <TableCell className="text-center border-l-2 border-material-gray-200 px-2 py-1.5">
                      <div className="text-[10px] space-y-0.5 leading-tight">
                        <div className="text-material-gray-600">
                          PKS: {formatNumber(result.pksGenerationCost)}
                        </div>
                        <div className="text-material-gray-600">
                          WC: {formatNumber(result.wcGenerationCost)}
                        </div>
                        <div className="font-semibold text-material-gray-900 pt-0.5 border-t border-material-gray-200">
                          계: {formatNumber(result.totalGenerationCost)}
                        </div>
                      </div>
                    </TableCell>

                    {/* 약품비 */}
                    <TableCell className="text-center text-xs px-2 py-1.5">
                      {formatNumber(result.chemicalCost)}
                    </TableCell>

                    {/* 수전요금 */}
                    <TableCell className="text-center text-xs px-2 py-1.5">
                      {formatNumber(result.waterFee, 2)}
                    </TableCell>

                    {/* 매출 전력량 */}
                    <TableCell className="text-center border-l-2 border-material-gray-200 px-2 py-1.5">
                      <span className="text-xs font-medium text-emerald-700">
                        {formatCurrency(result.salesPower)}
                      </span>
                    </TableCell>

                    {/* 매출 REC */}
                    <TableCell className="text-center px-2 py-1.5">
                      <span className="text-xs font-medium text-emerald-700">
                        {formatCurrency(result.salesREC)}
                      </span>
                    </TableCell>

                    {/* 매출 계 */}
                    <TableCell className="text-center bg-emerald-50 px-2 py-1.5">
                      <span className="text-xs font-semibold text-emerald-900">
                        {formatCurrency(result.salesTotal)}
                      </span>
                    </TableCell>

                    {/* 연료비 */}
                    <TableCell className="text-center border-l-2 border-material-gray-200 px-2 py-1.5">
                      <span className="text-xs font-medium text-red-700">
                        {formatCurrency(result.costFuel)}
                      </span>
                    </TableCell>

                    {/* 약품비 */}
                    <TableCell className="text-center px-2 py-1.5">
                      <span className="text-xs font-medium text-red-700">
                        {formatCurrency(result.costChemical)}
                      </span>
                    </TableCell>

                    {/* 수전료 */}
                    <TableCell className="text-center px-2 py-1.5">
                      <span className="text-xs font-medium text-red-700">
                        {formatCurrency(result.costWater)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 하단 안내 */}
      <div className="flex items-start gap-3 text-[10px] text-material-gray-600 bg-material-gray-50 rounded-lg p-2">
        <div className="flex-1">
          <p className="font-medium text-material-gray-700 mb-0.5 text-xs">💡 사용 팁</p>
          <p>• 노란색 배경의 송전효율과 소내소비율은 수정 가능한 입력 필드입니다</p>
          <p>• 매출은 녹색, 비용은 빨간색으로 구분되어 표시됩니다</p>
          <p>• 공헌이익이 양수면 녹색, 음수면 빨간색으로 강조됩니다</p>
        </div>
        <div className="flex-1">
          <p className="font-medium text-material-gray-700 mb-0.5 text-xs">📊 컬럼 설명</p>
          <p>• 왼쪽 고정 컬럼: 출력 레벨과 상태 배지</p>
          <p>• 중간 구분선: 효율/단가 정보와 매출/비용 정보를 구분</p>
          <p>• 강조 컬럼: 공헌이익과 시간당 수익은 배경색으로 강조</p>
        </div>
      </div>

      {/* 상세 분석 모달 */}
      <DetailedAnalysisModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        inputParameters={inputParameters}
        plantRowInputs={plantRowInputs}
      />
    </div>
  );
}
