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
    <div className="space-y-6">
      {/* 헤더와 더보기 버튼 */}
      <div className="flex items-center justify-between">
        <h3 className="text-[22px] font-bold text-[#191F28] tracking-[-0.02em]">
          수익 비교 분석
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-2"
        >
          더보기
          <ChevronRight className="h-4 w-4 stroke-[2.5px]" />
        </Button>
      </div>

      {/* 개선된 테이블 */}
      <div className="border-0 rounded-[24px] overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <Table className="min-w-full border-collapse text-xs">
            <TableHeader>
              <TableRow className="bg-[#F9FAFB] border-b border-gray-100">
                <TableHead className="sticky left-0 z-10 bg-[#F9FAFB] min-w-[80px] h-12 px-3 font-bold text-[14px] text-[#191F28] tracking-[-0.02em] whitespace-nowrap">
                  출력 레벨
                </TableHead>
                <TableHead className="min-w-[90px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center border-l border-gray-100 bg-[#FFF9E6] tracking-[-0.02em] whitespace-nowrap">
                  공헌이익<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(백만원/일)</span>
                </TableHead>
                <TableHead className="min-w-[90px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center bg-[#E8F3FF] tracking-[-0.02em] whitespace-nowrap">
                  시간당 수익<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(만원/h)</span>
                </TableHead>
                <TableHead className="min-w-[80px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
                  송전량<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(MWh/h)</span>
                </TableHead>
                <TableHead className="min-w-[75px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
                  발전효율<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(%)</span>
                </TableHead>
                <TableHead className="min-w-[80px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
                  송전효율<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(%)</span>
                </TableHead>
                <TableHead className="min-w-[90px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
                  소내소비율<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(%)</span>
                </TableHead>
                <TableHead className="min-w-[90px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
                  WC 혼소율<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(%)</span>
                </TableHead>
                <TableHead className="min-w-[90px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center border-l border-gray-100 tracking-[-0.02em] whitespace-nowrap">
                  발전단가<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(원/kWh)</span>
                </TableHead>
                <TableHead className="min-w-[75px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
                  약품비<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(원/kWh)</span>
                </TableHead>
                <TableHead className="min-w-[75px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
                  수전요금<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(원/kWh)</span>
                </TableHead>
                <TableHead className="min-w-[90px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center border-l border-gray-100 tracking-[-0.02em] whitespace-nowrap">
                  매출 전력량<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(백만원)</span>
                </TableHead>
                <TableHead className="min-w-[80px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
                  매출 REC<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(백만원)</span>
                </TableHead>
                <TableHead className="min-w-[80px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center bg-[#E8F3FF] tracking-[-0.02em] whitespace-nowrap">
                  매출 계<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(백만원)</span>
                </TableHead>
                <TableHead className="min-w-[90px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center border-l border-gray-100 tracking-[-0.02em] whitespace-nowrap">
                  연료사용량<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(톤/일)</span>
                </TableHead>
                <TableHead className="min-w-[75px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
                  연료비<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(백만원)</span>
                </TableHead>
                <TableHead className="min-w-[75px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
                  약품비<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(백만원)</span>
                </TableHead>
                <TableHead className="min-w-[75px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
                  수전료<br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(백만원)</span>
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
                    className="hover:bg-[#F9FAFB] transition-colors border-b border-gray-50 active:bg-[#F2F4F6]"
                  >
                    {/* 출력 레벨 - 고정 컬럼 */}
                    <TableCell className="sticky left-0 z-10 bg-white font-bold px-3 py-4">
                      <span className="text-[17px] text-[#191F28] tracking-[-0.02em]">{outputInfo.label}</span>
                    </TableCell>

                    {/* 공헌이익 */}
                    <TableCell
                      className={cn(
                        "text-center border-l border-gray-100 bg-[#FFF9E6] px-3 py-4",
                        isProfit ? "text-[#3182F6]" : "text-[#F04452]"
                      )}
                    >
                      <span className="text-[17px] font-bold tracking-[-0.02em]">
                        {formatCurrency(result.contributionProfit)}
                      </span>
                    </TableCell>

                    {/* 시간당 수익 */}
                    <TableCell
                      className={cn(
                        "text-center bg-[#E8F3FF] px-3 py-4",
                        isProfit ? "text-[#3182F6]" : "text-[#F04452]"
                      )}
                    >
                      <span className="text-[17px] font-bold tracking-[-0.02em]">
                        {formatCurrency(result.hourlyExpectedProfit)}
                      </span>
                    </TableCell>

                    {/* 송전량 */}
                    <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em]">
                      {formatNumber(result.transmissionAmount, 2)}
                    </TableCell>

                    {/* 발전효율 */}
                    <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em]">
                      {formatPercent(result.generationEfficiency)}
                    </TableCell>

                    {/* 송전효율 - 입력 필드 */}
                    <TableCell className="text-center px-3 py-4">
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
                        className="w-full h-10 bg-[#FFF9E6] hover:bg-[#FFF5D1] focus-visible:ring-[#3182F6]/20 text-[14px] text-center px-2 tracking-[-0.02em]"
                      />
                    </TableCell>

                    {/* 소내소비율 - 입력 필드 */}
                    <TableCell className="text-center px-3 py-4">
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
                        className="w-full h-10 bg-[#FFF9E6] hover:bg-[#FFF5D1] focus-visible:ring-[#3182F6]/20 text-[14px] text-center px-2 tracking-[-0.02em]"
                      />
                    </TableCell>

                    {/* WC 혼소율 */}
                    <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em]">
                      {formatPercent(result.wcCoFiringRate)}
                    </TableCell>

                    {/* 발전단가 */}
                    <TableCell className="text-center border-l border-gray-100 px-3 py-4">
                      <div className="text-[12px] space-y-1 leading-tight">
                        <div className="text-[#4E5968]">
                          PKS: {formatNumber(result.pksGenerationCost)}
                        </div>
                        <div className="text-[#4E5968]">
                          WC: {formatNumber(result.wcGenerationCost)}
                        </div>
                        <div className="font-bold text-[#191F28] pt-1 border-t border-gray-100">
                          계: {formatNumber(result.totalGenerationCost)}
                        </div>
                      </div>
                    </TableCell>

                    {/* 약품비 */}
                    <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em]">
                      {formatNumber(result.chemicalCost)}
                    </TableCell>

                    {/* 수전요금 */}
                    <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em]">
                      {formatNumber(result.waterFee, 2)}
                    </TableCell>

                    {/* 매출 전력량 */}
                    <TableCell className="text-center border-l border-gray-100 px-3 py-4">
                      <span className="text-[14px] font-bold text-[#3182F6] tracking-[-0.02em]">
                        {formatCurrency(result.salesPower)}
                      </span>
                    </TableCell>

                    {/* 매출 REC */}
                    <TableCell className="text-center px-3 py-4">
                      <span className="text-[14px] font-bold text-[#3182F6] tracking-[-0.02em]">
                        {formatCurrency(result.salesREC)}
                      </span>
                    </TableCell>

                    {/* 매출 계 */}
                    <TableCell className="text-center bg-[#E8F3FF] px-3 py-4">
                      <span className="text-[14px] font-bold text-[#3182F6] tracking-[-0.02em]">
                        {formatCurrency(result.salesTotal)}
                      </span>
                    </TableCell>

                    {/* 연료사용량 */}
                    <TableCell className="text-center border-l border-gray-100 px-3 py-4">
                      <div className="text-[12px] space-y-1 leading-tight">
                        <div className="text-[#4E5968]">
                          PKS: {formatNumber(result.pksFuelConsumption, 1)}
                        </div>
                        <div className="text-[#4E5968]">
                          WC: {formatNumber(result.wcFuelConsumption, 1)}
                        </div>
                      </div>
                    </TableCell>

                    {/* 연료비 */}
                    <TableCell className="text-center px-3 py-4">
                      <span className="text-[14px] font-bold text-[#F04452] tracking-[-0.02em]">
                        {formatCurrency(result.costFuel)}
                      </span>
                    </TableCell>

                    {/* 약품비 */}
                    <TableCell className="text-center px-3 py-4">
                      <span className="text-[14px] font-bold text-[#F04452] tracking-[-0.02em]">
                        {formatCurrency(result.costChemical)}
                      </span>
                    </TableCell>

                    {/* 수전료 */}
                    <TableCell className="text-center px-3 py-4">
                      <span className="text-[14px] font-bold text-[#F04452] tracking-[-0.02em]">
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
      <div className="flex items-start gap-6 text-[14px] text-[#4E5968] bg-[#F9FAFB] rounded-[20px] p-6 tracking-[-0.02em]">
        <div className="flex-1">
          <p className="font-bold text-[#191F28] mb-2 text-[14px]">💡 사용 팁</p>
          <p className="mb-1">• 노란색 배경의 송전효율과 소내소비율은 수정 가능한 입력 필드입니다</p>
          <p className="mb-1">• 매출은 파란색, 비용은 빨간색으로 구분되어 표시됩니다</p>
          <p>• 공헌이익이 양수면 파란색, 음수면 빨간색으로 강조됩니다</p>
        </div>
        <div className="flex-1">
          <p className="font-bold text-[#191F28] mb-2 text-[14px]">📊 컬럼 설명</p>
          <p className="mb-1">• 왼쪽 고정 컬럼: 출력 레벨과 상태 배지</p>
          <p className="mb-1">• 중간 구분선: 효율/단가 정보와 매출/비용 정보를 구분</p>
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
