import { getOutputColor } from "../lib/output-color";
import type { DominanceZone } from "../lib/dominance-zone-calculator";

interface DominanceZoneChartProps {
  zones: DominanceZone[];
}

export function DominanceZoneChart({ zones }: DominanceZoneChartProps) {
  return (
    <div className="mt-4 p-4 bg-[#F9FAFB] rounded-[20px] border-0">
      <div className="space-y-4">
        {/* 가로 숫자 선 그래프 */}
        <div className="relative w-full">
          {/* 메인 선 */}
          <div className="relative w-full h-8 bg-white rounded-[8px] border border-[#E5E8EB] overflow-hidden">
            {/* 구간별 막대 */}
            {zones.map((zone) => {
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
          {zones.map((zone) => {
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
  );
}

