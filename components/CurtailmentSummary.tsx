"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { HourlySMPData, InputParameters, PlantRowInput, OutputLevel } from "@/types";
import { calculatePlantAnalysis } from "@/lib/calculations";
import { formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface CurtailmentSummaryProps {
  readonly hourlySMPData: HourlySMPData;
  readonly inputParameters: InputParameters;
  readonly plantRowInputs: Record<OutputLevel, PlantRowInput>;
  readonly curtailmentThreshold: number; // 감발 기준 SMP 가격
}

interface DailyCurtailmentData {
  date: string;
  averageSMP: number; // 감발 평균 SMP
  curtailmentHours: number; // 감발시간
  hourlyProfit: number; // 시간당 수익 (만원)
  totalAmount: number; // 총 금액 (만원)
}

/**
 * 날짜를 "MM/DD(요일)" 형식으로 포맷팅
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];
  return `${month}/${day}(${weekday})`;
}

/**
 * 날짜의 요일을 반환 (0: 일요일, 6: 토요일)
 */
function getDayOfWeek(dateString: string): number {
  const date = new Date(dateString);
  return date.getDay();
}

export function CurtailmentSummary({
  hourlySMPData,
  inputParameters,
  plantRowInputs,
  curtailmentThreshold,
}: CurtailmentSummaryProps) {
  /**
   * 연속 구간 정보 인터페이스
   */
  interface ContinuousPeriod {
    startIndex: number; // 시작 인덱스 (0-based, 0 = 1시)
    length: number; // 구간 길이
    isConnectedToPreviousDay: boolean; // 전날과 연속인지 여부 (1시에 시작하는 경우)
  }

  /**
   * 기준가격 이하가 연속적으로 6시간 이상인 구간들을 찾아서 반환
   * 여러 구간이 있을 경우 가장 긴 구간만 선택 (길이가 같으면 전날과 연속인 구간 우선)
   */
  function findContinuousCurtailmentPeriods(
    hourlyPrices: number[],
    threshold: number,
    previousDayLastHourPrice: number | null // 전날의 24시(마지막 시간) 가격
  ): number[] {
    const periods: ContinuousPeriod[] = [];
    let currentStart = -1;
    let currentLength = 0;

    // 모든 연속 구간 찾기
    for (let i = 0; i < hourlyPrices.length; i++) {
      const price = hourlyPrices[i];
      
      // 기준가격 이하이고 유효한 값인 경우
      if (price > 0 && price <= threshold) {
        if (currentStart === -1) {
          // 새로운 연속 구간 시작
          currentStart = i;
          currentLength = 1;
        } else {
          // 기존 연속 구간 계속
          currentLength++;
        }
      } else {
        // 기준가격 초과 또는 유효하지 않은 값
        if (currentStart !== -1) {
          // 연속 구간 종료
          if (currentLength >= 6) {
            // 전날과 연속인지 확인 (1시에 시작하고 전날 24시도 기준가격 이하인 경우)
            const isConnectedToPreviousDay = 
              currentStart === 0 && 
              previousDayLastHourPrice !== null && 
              previousDayLastHourPrice > 0 && 
              previousDayLastHourPrice <= threshold;
            
            periods.push({
              startIndex: currentStart,
              length: currentLength,
              isConnectedToPreviousDay,
            });
          }
          currentStart = -1;
          currentLength = 0;
        }
      }
    }

    // 마지막 구간 처리 (배열 끝까지 연속인 경우)
    if (currentStart !== -1 && currentLength >= 6) {
      const isConnectedToPreviousDay = 
        currentStart === 0 && 
        previousDayLastHourPrice !== null && 
        previousDayLastHourPrice > 0 && 
        previousDayLastHourPrice <= threshold;
      
      periods.push({
        startIndex: currentStart,
        length: currentLength,
        isConnectedToPreviousDay,
      });
    }

    // 구간이 없으면 빈 배열 반환
    if (periods.length === 0) {
      return [];
    }

    // 구간이 1개면 그 구간 반환
    if (periods.length === 1) {
      const period = periods[0];
      const result: number[] = [];
      for (let j = period.startIndex; j < period.startIndex + period.length; j++) {
        result.push(hourlyPrices[j]);
      }
      return result;
    }

    // 구간이 2개 이상인 경우: 가장 긴 구간 선택, 길이가 같으면 전날과 연속인 구간 우선
    let selectedPeriod = periods[0];
    for (let i = 1; i < periods.length; i++) {
      const period = periods[i];
      
      // 더 긴 구간이면 선택
      if (period.length > selectedPeriod.length) {
        selectedPeriod = period;
      } 
      // 길이가 같고, 현재 선택된 구간이 전날과 연속이 아니고, 새로운 구간이 전날과 연속이면 선택
      else if (
        period.length === selectedPeriod.length &&
        !selectedPeriod.isConnectedToPreviousDay &&
        period.isConnectedToPreviousDay
      ) {
        selectedPeriod = period;
      }
    }

    // 선택된 구간의 SMP 값들 반환
    const result: number[] = [];
    for (let j = selectedPeriod.startIndex; j < selectedPeriod.startIndex + selectedPeriod.length; j++) {
      result.push(hourlyPrices[j]);
    }
    return result;
  }

  // 날짜별 감발 데이터 계산
  const dailyCurtailmentData = useMemo(() => {
    const results: DailyCurtailmentData[] = [];

    hourlySMPData.dailyData.forEach((dailyData, dayIndex) => {
      // 전날의 마지막 시간(24시) 가격 가져오기
      const previousDayLastHourPrice = dayIndex > 0 
        ? hourlySMPData.dailyData[dayIndex - 1].hourlyPrices[23] // 전날의 24시 (인덱스 23)
        : null;

      // 연속 6시간 이상인 감발 구간의 SMP 값들만 수집 (가장 긴 구간만)
      const curtailmentPrices = findContinuousCurtailmentPeriods(
        dailyData.hourlyPrices,
        curtailmentThreshold,
        previousDayLastHourPrice
      );

      if (curtailmentPrices.length === 0) {
        // 감발 시간이 없으면 0으로 표시
        results.push({
          date: dailyData.date,
          averageSMP: 0,
          curtailmentHours: 0,
          hourlyProfit: 0,
          totalAmount: 0,
        });
        return;
      }

      // 감발 평균 SMP 계산 (연속 6시간 이상 구간만)
      const averageSMP = curtailmentPrices.reduce((sum, price) => sum + price, 0) / curtailmentPrices.length;

      // 시간당 수익 계산 (80MW 기준, 감발 평균 SMP 사용)
      // calculatePlantAnalysis를 사용하여 시간당 기대수익 계산
      const analysis = calculatePlantAnalysis(
        80,
        inputParameters,
        plantRowInputs[80],
        averageSMP
      );
      const hourlyProfit = analysis.hourlyExpectedProfit; // 만원

      // 총 금액 = 감발시간 × 시간당 수익
      const totalAmount = curtailmentPrices.length * hourlyProfit;

      results.push({
        date: dailyData.date,
        averageSMP,
        curtailmentHours: curtailmentPrices.length,
        hourlyProfit,
        totalAmount,
      });
    });

    return results;
  }, [hourlySMPData, inputParameters, plantRowInputs, curtailmentThreshold]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="w-full overflow-hidden">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-gray-100">
                <th className="px-4 py-3 text-center font-bold text-[#191F28] tracking-[-0.02em]">
                  날짜
                </th>
                <th className="px-4 py-3 text-center font-bold text-[#191F28] tracking-[-0.02em]">
                  감발 평균 SMP
                </th>
                <th className="px-4 py-3 text-center font-bold text-[#191F28] tracking-[-0.02em]">
                  감발시간
                </th>
                <th className="px-4 py-3 text-center font-bold text-[#191F28] tracking-[-0.02em]">
                  시간당 수익
                  <br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(만원)</span>
                </th>
                <th className="px-4 py-3 text-center font-bold text-[#191F28] tracking-[-0.02em]">
                  총 금액
                  <br />
                  <span className="text-[12px] font-normal text-[#8B95A1]">(만원)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* 날짜별 데이터 행 */}
              {dailyCurtailmentData.map((data) => {
                const dayOfWeek = getDayOfWeek(data.date);
                const isSaturday = dayOfWeek === 6; // 토요일
                const isSunday = dayOfWeek === 0; // 일요일
                return (
                  <tr
                    key={data.date}
                    className="hover:bg-[#F9FAFB] transition-colors border-b border-gray-50 active:bg-[#F2F4F6]"
                  >
                    <td
                      className={cn(
                        "px-4 py-4 text-center bg-[#E8F3FF] font-bold text-[14px] tracking-[-0.02em]",
                        isSaturday && "text-[#3182F6]",
                        isSunday && "text-[#F04452]"
                      )}
                    >
                      {formatDate(data.date)}
                    </td>
                    <td className="px-4 py-4 text-center text-[#191F28] text-[14px] tracking-[-0.02em]">
                      {data.averageSMP > 0 ? formatNumber(data.averageSMP, 0) : "-"}
                    </td>
                    <td className="px-4 py-4 text-center text-[#191F28] text-[14px] bg-[#FFF9E6] font-medium tracking-[-0.02em]">
                      {data.curtailmentHours}
                    </td>
                    <td className="px-4 py-4 text-center text-[#191F28] text-[14px] bg-[#FFF9E6] font-medium tracking-[-0.02em]">
                      {data.hourlyProfit > 0 ? formatNumber(data.hourlyProfit, 0) : "-"}
                    </td>
                    <td className="px-4 py-4 text-center text-[#191F28] text-[14px] font-medium tracking-[-0.02em]">
                      {data.totalAmount > 0 ? formatNumber(data.totalAmount, 0) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* 설명 섹션 */}
        <div className="mt-6 p-6 bg-[#F9FAFB] rounded-[20px] border-0">
          <ul className="text-[14px] text-[#4E5968] space-y-2 list-disc list-inside tracking-[-0.02em]">
            <li>감발 기준가격 이하인 시간대가 <strong className="text-[#191F28]">연속적으로 6시간 이상</strong>인 구간만 계산합니다.</li>
            <li>하루에 해당하는 구간이 <strong className="text-[#191F28]">2개 이상</strong>인 경우, <strong className="text-[#191F28]">가장 긴 구간</strong>만 선택합니다.</li>
            <li>구간 길이가 같은 경우, <strong className="text-[#191F28]">전날 24시와 오늘 1시가 모두 기준 이하인 구간</strong>을 우선 선택합니다.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

