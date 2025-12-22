"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { generateChartData } from "../lib/chart-data-generator";
import { findAllIntersections } from "../lib/intersection-finder";
import { calculateMinBreakEvenSMP, calculateDominanceZones } from "../lib/dominance-zone-calculator";
import { getOutputColor } from "../lib/output-color";
import { IntersectionPoint } from "./IntersectionPoint";
import { DominanceZoneChart } from "./DominanceZoneChart";
import { OutputSelector } from "./OutputSelector";
import type { ContributionProfitChartProps } from "../types";

export function ContributionProfitChart({
  inputParameters,
  plantRowInputs,
  formulas,
}: ContributionProfitChartProps) {
  // 선택된 출력 레벨 관리 (기본값: 65, 80, 93)
  const [selectedOutputs, setSelectedOutputs] = useState<number[]>([65, 80, 93]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [tempSelectedOutputs, setTempSelectedOutputs] = useState<number[]>([65, 80, 93]);

  // 출력 레벨 옵션 (65 ~ 95)
  const outputOptions = Array.from({ length: 31 }, (_, i) => 65 + i); // 65 ~ 95

  // 차트 데이터 생성 (선택된 출력 레벨에 따라 동적 생성)
  const chartData = useMemo(() => {
    return generateChartData(inputParameters, plantRowInputs, selectedOutputs, formulas);
  }, [inputParameters, plantRowInputs, selectedOutputs, formulas]);

  // 교차점 계산 (선택된 모든 출력 레벨 쌍에 대해)
  const intersections = useMemo(() => {
    return findAllIntersections(chartData, selectedOutputs);
  }, [chartData, selectedOutputs]);

  // 정지 구간의 끝점 계산
  const minBreakEvenSMP = useMemo(() => {
    return calculateMinBreakEvenSMP(chartData, selectedOutputs);
  }, [chartData, selectedOutputs]);

  // 우위 구간 계산
  const dominanceZones = useMemo(() => {
    return calculateDominanceZones(chartData, selectedOutputs, minBreakEvenSMP);
  }, [chartData, selectedOutputs, minBreakEvenSMP]);

  // 편집 다이얼로그 열기
  const handleOpenEdit = () => {
    setTempSelectedOutputs([...selectedOutputs]);
    setIsEditDialogOpen(true);
  };

  // 편집 다이얼로그 저장
  const handleSaveEdit = () => {
    if (tempSelectedOutputs.length > 0) {
      const sorted = [...tempSelectedOutputs].sort((a, b) => b - a); // 내림차순 정렬
      setSelectedOutputs(sorted);
    }
    setIsEditDialogOpen(false);
  };

  // 선택된 출력 레벨 정렬 (내림차순: 93MW -> 80MW -> 65MW)
  const sortedSelectedOutputs = useMemo(() => {
    return [...selectedOutputs].sort((a, b) => b - a);
  }, [selectedOutputs]);

  // 출력 레벨 토글
  const toggleOutput = (output: number) => {
    if (tempSelectedOutputs.includes(output)) {
      setTempSelectedOutputs(tempSelectedOutputs.filter((o) => o !== output));
    } else {
      setTempSelectedOutputs([...tempSelectedOutputs, output].sort((a, b) => b - a));
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          {/* 편집 버튼 - 우측 상단 */}
          <div className="flex justify-end mb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenEdit}
              className="gap-2"
            >
              <Pencil className="h-4 w-4 stroke-[2.5px]" />
              편집
            </Button>
          </div>

          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EB" />
                <XAxis
                  dataKey="smp"
                  label={{ value: "SMP (원/kWh)", position: "insideBottom", offset: -10 }}
                  stroke="#4E5968"
                  tick={{ fill: "#4E5968", fontSize: 12 }}
                />
                <YAxis
                  label={{ value: "공헌이익 (백만원)", angle: -90, position: "insideLeft" }}
                  stroke="#4E5968"
                  tick={{ fill: "#4E5968", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E8EB",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} 백만원`, ""]}
                  labelFormatter={(label) => `SMP: ${label} 원/kWh`}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="line"
                  formatter={(value) => value}
                />
                
                {/* 선택된 출력 레벨별 선 동적 생성 (내림차순: 93MW -> 80MW -> 65MW) */}
                {sortedSelectedOutputs.map((output) => (
                  <Line
                    key={`profit${output}`}
                    type="linear"
                    dataKey={`profit${output}`}
                    name={`${output}MW`}
                    stroke={getOutputColor(output)}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
                
                {/* 교차점 수직선 표시 */}
                {intersections.map((point) => (
                  <ReferenceLine
                    key={`ref-${point.smp}-${point.profit}`}
                    x={point.smp}
                    stroke="#8B95A1"
                    strokeDasharray="5 5"
                    strokeWidth={1}
                  />
                ))}
                
                {/* 교차점 포인터 */}
                <Scatter
                  data={intersections}
                  dataKey="profit"
                  fill="#191F28"
                  shape={IntersectionPoint}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        
          <DominanceZoneChart zones={dominanceZones} />
        </CardContent>
      </Card>

      <OutputSelector
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedOutputs={selectedOutputs}
        tempSelectedOutputs={tempSelectedOutputs}
        onToggleOutput={toggleOutput}
        onSave={handleSaveEdit}
        outputOptions={outputOptions}
      />
    </>
  );
}

