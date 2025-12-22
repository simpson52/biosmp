import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { formatNumber, formatCurrency, formatPercent, parseNumberInput, formatInputValue } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { OutputLevel, PlantRowInput, PlantAnalysisResult } from "@/types";

interface AnalysisTableRowProps {
  output: OutputLevel;
  plantRowInput: PlantRowInput;
  analysisResult: PlantAnalysisResult;
  onInputChange: (output: OutputLevel, field: keyof PlantRowInput, value: number) => void;
  onDetailClick: () => void;
}

export function AnalysisTableRow({
  output,
  plantRowInput,
  analysisResult,
  onInputChange,
  onDetailClick,
}: AnalysisTableRowProps) {
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

  const outputInfo = getOutputLabel(output);
  const isProfit = analysisResult.contributionProfit >= 0;

  return (
    <TableRow className="hover:bg-[#F9FAFB] transition-colors border-b border-gray-50 active:bg-[#F2F4F6]">
      <TableCell className="sticky left-0 z-10 bg-white font-bold px-3 py-4">
        <span className="text-[17px] text-[#191F28] tracking-[-0.02em]">{outputInfo.label}</span>
      </TableCell>

      <TableCell
        className={cn(
          "text-center border-l border-gray-100 bg-[#FFF9E6] px-3 py-4",
          isProfit ? "text-[#3182F6]" : "text-[#F04452]"
        )}
      >
        <span className="text-[17px] font-bold tracking-[-0.02em]">
          {formatCurrency(analysisResult.contributionProfit)}
        </span>
      </TableCell>

      <TableCell
        className={cn(
          "text-center bg-[#E8F3FF] px-3 py-4",
          isProfit ? "text-[#3182F6]" : "text-[#F04452]"
        )}
      >
        <span className="text-[17px] font-bold tracking-[-0.02em]">
          {formatCurrency(analysisResult.hourlyExpectedProfit)}
        </span>
      </TableCell>

      <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em]">
        {formatNumber(analysisResult.transmissionAmount, 2)}
      </TableCell>

      <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em]">
        {formatPercent(analysisResult.generationEfficiency)}
      </TableCell>

      <TableCell className="text-center px-3 py-4">
        <Input
          type="text"
          value={formatInputValue(plantRowInput.transmissionEfficiency, 2)}
          onChange={(e) => {
            const parsed = parseNumberInput(e.target.value);
            if (!Number.isNaN(parsed)) {
              onInputChange(output, "transmissionEfficiency", parsed);
            }
          }}
          className="w-20 text-center text-[14px] bg-[#FFF9E6] border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20"
        />
      </TableCell>

      <TableCell className="text-center px-3 py-4">
        <Input
          type="text"
          value={formatInputValue(plantRowInput.internalConsumptionRate, 2)}
          onChange={(e) => {
            const parsed = parseNumberInput(e.target.value);
            if (!Number.isNaN(parsed)) {
              onInputChange(output, "internalConsumptionRate", parsed);
            }
          }}
          className="w-20 text-center text-[14px] bg-[#FFF9E6] border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20"
        />
      </TableCell>

      <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em]">
        {formatPercent(analysisResult.wcCoFiringRate)}
      </TableCell>

      <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em] border-l border-gray-100">
        {formatCurrency(analysisResult.totalGenerationCost)}
      </TableCell>

      <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em]">
        {formatCurrency(analysisResult.chemicalCost)}
      </TableCell>

      <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em]">
        {formatCurrency(analysisResult.waterFee)}
      </TableCell>

      <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em] border-l border-gray-100">
        {formatCurrency(analysisResult.salesPower)}
      </TableCell>

      <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em]">
        {formatCurrency(analysisResult.salesREC)}
      </TableCell>

      <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em] bg-[#E8F3FF]">
        {formatCurrency(analysisResult.salesTotal)}
      </TableCell>

      <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em] border-l border-gray-100">
        {formatNumber(analysisResult.pksFuelConsumption + analysisResult.wcFuelConsumption, 2)}
      </TableCell>

      <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em]">
        {formatCurrency(analysisResult.costFuel)}
      </TableCell>

      <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em]">
        {formatCurrency(analysisResult.costChemical)}
      </TableCell>

      <TableCell className="text-center text-[14px] text-[#191F28] px-3 py-4 tracking-[-0.02em]">
        {formatCurrency(analysisResult.costWater)}
      </TableCell>

      <TableCell className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDetailClick}
          className="flex items-center gap-1"
        >
          상세
          <ChevronRight className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

