"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import type { InputParameters, PlantRowInput, OutputLevel } from "@/types";
import { calculatePlantAnalysis } from "@/lib/calculations";
import { DetailedAnalysisModal } from "@/components/DetailedAnalysisModal";
import { AnalysisTableHeader } from "./AnalysisTableHeader";
import { AnalysisTableRow } from "./AnalysisTableRow";
import type { AnalysisTableFormulas } from "@/types";

interface AnalysisTableProps {
  inputParameters: InputParameters;
  plantRowInputs: Record<OutputLevel, PlantRowInput>;
  onPlantRowInputChange: (
    output: OutputLevel,
    input: PlantRowInput
  ) => void;
  formulas?: AnalysisTableFormulas;
}

export function AnalysisTable({
  inputParameters,
  plantRowInputs,
  onPlantRowInputChange,
  formulas,
}: AnalysisTableProps) {
  const analysisResults = useMemo(() => {
    const results = {
      93: calculatePlantAnalysis(93, inputParameters, plantRowInputs[93], inputParameters.baseSMP, formulas),
      80: calculatePlantAnalysis(80, inputParameters, plantRowInputs[80], inputParameters.baseSMP, formulas),
      65: calculatePlantAnalysis(65, inputParameters, plantRowInputs[65], inputParameters.baseSMP, formulas),
    };
    return results;
  }, [inputParameters, plantRowInputs, formulas]);

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

  const rows: OutputLevel[] = [93, 80, 65];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState<OutputLevel | null>(null);

  return (
    <div className="space-y-6">
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

      <div className="border-0 rounded-[24px] overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <Table className="min-w-full border-collapse text-xs">
            <AnalysisTableHeader />
            <TableBody>
              {rows.map((output) => (
                <AnalysisTableRow
                  key={output}
                  output={output}
                  plantRowInput={plantRowInputs[output]}
                  analysisResult={analysisResults[output]}
                  onInputChange={handleInputChange}
                  onDetailClick={() => {
                    setSelectedOutput(output);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedOutput && (
        <DetailedAnalysisModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOutput(null);
          }}
          output={selectedOutput}
          inputParameters={inputParameters}
          plantRowInput={plantRowInputs[selectedOutput]}
          analysisResult={analysisResults[selectedOutput]}
          onPlantRowInputChange={(input) => onPlantRowInputChange(selectedOutput, input)}
        />
      )}
    </div>
  );
}

