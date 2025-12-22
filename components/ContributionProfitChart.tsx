"use client";

import { useMemo, useState } from "react";
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
import { calculatePlantAnalysis } from "@/lib/calculations";
import type { InputParameters, PlantRowInput } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContributionProfitChartProps {
  readonly inputParameters: InputParameters;
  readonly plantRowInputs: {
    93: PlantRowInput;
    80: PlantRowInput;
    65: PlantRowInput;
  };
}

/**
 * 93MW와 80MW 사이의 값을 보간
 */
function interpolateBetween93And80(
  output: number,
  input93: PlantRowInput,
  input80: PlantRowInput
): PlantRowInput {
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
    return interpolateBetween93And80(output, plantRowInputs[93], plantRowInputs[80]);
  } else if (output > 65 && output < 80) {
    return interpolateBetween80And65(output, plantRowInputs[80], plantRowInputs[65]);
  } else {
    if (output > 93) return plantRowInputs[93];
    return plantRowInputs[65];
  }
}

/**
 * 출력 레벨별 색상 매핑
 */
function getOutputColor(output: number | string): string {
  if (typeof output === "string") {
    if (output === "정지") {
      return "#8B95A1"; // 회색 (정지 구간)
    }
    // "65MW", "80MW", "93MW" 같은 형식 처리
    const outputNum = Number.parseInt(output.replace('MW', ''), 10);
    if (!Number.isNaN(outputNum)) {
      if (outputNum === 93) return "#191F28"; // 검은색
      if (outputNum === 80) return "#F04452"; // 빨간색
      if (outputNum === 65) return "#3182F6"; // 파란색
    }
    return "#8B95A1";
  }
  if (typeof output === "number") {
    if (output === 93) return "#191F28"; // 검은색
    if (output === 80) return "#F04452"; // 빨간색
    if (output === 65) return "#3182F6"; // 파란색
    // 나머지는 회색 계열
    return "#8B95A1";
  }
  return "#8B95A1";
}

/**
 * 교차점 포인터 커스텀 shape
 */
const IntersectionPoint = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  
  return (
    <g>
      {/* 포인터 원 */}
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#FFFFFF"
        stroke="#191F28"
        strokeWidth={2}
      />
      {/* SMP 값 텍스트 (큰 글씨) */}
      <text
        x={cx}
        y={cy - 20}
        textAnchor="middle"
        fill="#191F28"
        fontSize={18}
        fontWeight="bold"
      >
        {payload.label}
      </text>
    </g>
  );
};


/**
 * 두 선의 교차점 찾기 (선형 보간)
 */
function findIntersection(
  line1: { smp: number; profit: number }[],
  line2: { smp: number; profit: number }[]
): { smp: number; profit: number } | null {
  for (let i = 0; i < line1.length - 1; i++) {
    const p1 = line1[i];
    const p2 = line1[i + 1];
    
    for (let j = 0; j < line2.length - 1; j++) {
      const p3 = line2[j];
      const p4 = line2[j + 1];
      
      // 선분 교차점 계산
      const denom = (p1.smp - p2.smp) * (p3.profit - p4.profit) - (p1.profit - p2.profit) * (p3.smp - p4.smp);
      if (Math.abs(denom) < 0.0001) continue;
      
      const t = ((p1.smp - p3.smp) * (p3.profit - p4.profit) - (p1.profit - p3.profit) * (p3.smp - p4.smp)) / denom;
      const u = -((p1.smp - p2.smp) * (p1.profit - p3.profit) - (p1.profit - p2.profit) * (p1.smp - p3.smp)) / denom;
      
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        const smp = p1.smp + t * (p2.smp - p1.smp);
        const profit = p1.profit + t * (p2.profit - p1.profit);
        return { smp, profit };
      }
    }
  }
  return null;
}

export function ContributionProfitChart({
  inputParameters,
  plantRowInputs,
}: ContributionProfitChartProps) {
  // 선택된 출력 레벨 관리 (기본값: 65, 80, 93)
  const [selectedOutputs, setSelectedOutputs] = useState<number[]>([65, 80, 93]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [tempSelectedOutputs, setTempSelectedOutputs] = useState<number[]>([65, 80, 93]);

  // 출력 레벨 옵션 (65 ~ 95)
  const outputOptions = Array.from({ length: 31 }, (_, i) => 65 + i); // 65 ~ 95

  // 차트 데이터 생성 (선택된 출력 레벨에 따라 동적 생성)
  const chartData = useMemo(() => {
    const smpRange = Array.from({ length: 151 }, (_, i) => i); // 0 ~ 150
    
    const data = smpRange.map((smp) => {
      const result: Record<string, number> = { smp };
      
      selectedOutputs.forEach((output) => {
        const interpolatedInput = getInterpolatedInput(output, plantRowInputs);
        const analysis = calculatePlantAnalysis(output, inputParameters, interpolatedInput, smp);
        result[`profit${output}`] = analysis.contributionProfit;
      });
      
      return result;
    });
    
    return data;
  }, [inputParameters, plantRowInputs, selectedOutputs]);

  // 교차점 계산 (선택된 모든 출력 레벨 쌍에 대해)
  const intersections = useMemo(() => {
    const intersectionPoints: Array<{ smp: number; profit: number; label: string }> = [];
    
    // 모든 출력 레벨 쌍에 대해 교차점 찾기
    for (let i = 0; i < selectedOutputs.length; i++) {
      for (let j = i + 1; j < selectedOutputs.length; j++) {
        const output1 = selectedOutputs[i];
        const output2 = selectedOutputs[j];
        const line1 = chartData.map((d) => ({ smp: d.smp, profit: (d as any)[`profit${output1}`] }));
        const line2 = chartData.map((d) => ({ smp: d.smp, profit: (d as any)[`profit${output2}`] }));
        
        const intersection = findIntersection(line1, line2);
        if (intersection) {
          intersectionPoints.push({
            smp: intersection.smp,
            profit: intersection.profit,
            label: `${Math.round(intersection.smp)}`,
          });
        }
      }
    }
    
    return intersectionPoints;
  }, [chartData, selectedOutputs]);

  // 교차점 데이터 포인트는 intersections에서 직접 사용

  // 정지 구간의 끝점 계산 (모든 출력이 0 이하인 마지막 지점)
  const minBreakEvenSMP = useMemo(() => {
    let lastNegativeSMP = -1;
    
    // 모든 출력이 0 이하인 마지막 지점 찾기
    for (const data of chartData) {
      let allNegative = true;
      
      selectedOutputs.forEach((output) => {
        const profit = (data as any)[`profit${output}`];
        if (profit > 0) {
          allNegative = false;
        }
      });
      
      // 모든 출력이 0 이하인 경우
      if (allNegative) {
        lastNegativeSMP = data.smp;
      } else {
        // 양수가 나오면 중단
        break;
      }
    }
    
    return lastNegativeSMP + 1; // 다음 지점부터 시작
  }, [chartData, selectedOutputs]);

  // 우위 구간 계산 (선택된 출력 레벨에 따라 동적 계산, 정지 구간 포함)
  const dominanceZones = useMemo(() => {
    const zones: Array<{ start: number; end: number; dominant: string }> = [];
    
    // 정지 구간이 있는 경우 추가
    if (minBreakEvenSMP > 0) {
      zones.push({ start: 0, end: Math.ceil(minBreakEvenSMP), dominant: "정지" });
    }
    
    let currentDominant = "";
    let zoneStart = Math.max(0, Math.ceil(minBreakEvenSMP));
    
    for (const data of chartData) {
      // 정지 구간은 건너뛰기
      if (data.smp < Math.ceil(minBreakEvenSMP)) {
        continue;
      }
      
      // 선택된 출력 레벨 중 가장 높은 공헌이익 찾기
      let maxProfit = -Infinity;
      let dominant = "";
      
      selectedOutputs.forEach((output) => {
        const profit = (data as any)[`profit${output}`];
        if (profit > maxProfit && profit > 0) {
          maxProfit = profit;
          dominant = `${output}MW`;
        }
      });
      
      // 모든 출력이 0 이하인 경우 정지
      if (maxProfit <= 0) {
        dominant = "정지";
      }
      
      if (dominant !== currentDominant) {
        if (currentDominant && zoneStart < data.smp) {
          zones.push({ start: zoneStart, end: data.smp, dominant: currentDominant });
        }
        currentDominant = dominant;
        zoneStart = data.smp;
      }
    }
    
    // 마지막 구간 추가
    if (currentDominant && chartData.length > 0) {
      const lastData = chartData.at(-1);
      if (lastData && zoneStart <= lastData.smp) {
        zones.push({ start: zoneStart, end: lastData.smp, dominant: currentDominant });
      }
    }
    
    return zones;
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
        
        {/* 우위 구간 표시 - 가로 그래프 (숫자 선 형태) */}
        <div className="mt-4 p-4 bg-[#F9FAFB] rounded-[20px] border-0">
          <div className="space-y-4">
            {/* 가로 숫자 선 그래프 */}
            <div className="relative w-full">
              {/* 메인 선 */}
              <div className="relative w-full h-8 bg-white rounded-[8px] border border-[#E5E8EB] overflow-hidden">
                {/* 구간별 막대 */}
                {dominanceZones.map((zone) => {
                  const smpMin = 0;
                  const smpMax = 150;
                  const leftPercent = (zone.start / smpMax) * 100;
                  const widthPercent = ((zone.end - zone.start) / smpMax) * 100;
                  const zoneColor = getOutputColor(zone.dominant);
                  
                  return (
                    <div
                      key={`${zone.dominant}-${zone.start}-${zone.end}`}
                      className="absolute h-full flex items-center justify-center"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        backgroundColor: zoneColor,
                      }}
                    >
                      {widthPercent > 8 && (
                        <span className="text-[11px] font-bold text-white px-1 whitespace-nowrap">
                          {zone.dominant}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* 눈금 및 레이블 */}
              <div className="relative w-full mt-2">
                <div className="relative w-full h-6">
                  {/* 눈금선 */}
                  {[0, 25, 50, 75, 100, 125, 150].map((tick) => {
                    const tickPercent = (tick / 150) * 100;
                    return (
                      <div
                        key={tick}
                        className="absolute top-0"
                        style={{ left: `${tickPercent}%` }}
                      >
                        <div className="w-px h-2 bg-[#E5E8EB]" />
                        <div className="mt-1 text-[10px] text-[#8B95A1] font-medium whitespace-nowrap" style={{ transform: 'translateX(-50%)', marginLeft: '1px' }}>
                          {tick}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* 구간별 상세 정보 - 여러 줄 표시 (가운데 정렬) */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[12px] text-[#4E5968] tracking-[-0.02em]">
              {dominanceZones.map((zone) => {
                return (
                  <div
                    key={`info-${zone.dominant}-${zone.start}-${zone.end}`}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: getOutputColor(zone.dominant) }}
                    />
                    <span>
                      {zone.start} ~ {zone.end} 원/kWh
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* 편집 다이얼로그 */}
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>출력 레벨 선택</DialogTitle>
          <DialogDescription>
            차트에 표시할 출력 레벨을 선택하세요. (65 ~ 95)
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-5 gap-3">
            {outputOptions.map((output) => {
              const isSelected = tempSelectedOutputs.includes(output);
              return (
                <button
                  key={output}
                  type="button"
                  onClick={() => toggleOutput(output)}
                  className={cn(
                    "px-4 py-3 rounded-[16px] text-[17px] font-bold transition-all duration-200 active:scale-[0.96]",
                    isSelected
                      ? "bg-[#3182F6] text-white"
                      : "bg-[#F9FAFB] text-[#4E5968] hover:bg-[#F2F4F6]"
                  )}
                >
                  {output}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-row justify-end items-center gap-4 pt-6">
          <button
            type="button"
            onClick={() => setIsEditDialogOpen(false)}
            className="text-[#4E5968] text-[17px] font-medium hover:text-[#191F28] underline-offset-4 hover:underline transition-colors"
          >
            취소
          </button>
          <Button
            onClick={handleSaveEdit}
            disabled={tempSelectedOutputs.length === 0}
            className="min-w-[120px]"
          >
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

