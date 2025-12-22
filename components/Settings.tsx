"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { AnalysisTableEditor } from "@/components/AnalysisTableEditor";
import { cn } from "@/lib/utils";

export function Settings() {
  const [activeEditor, setActiveEditor] = useState<string | null>(null);

  const settingsCards = [
    {
      id: "analysis-table",
      title: "수익 비교 분석 테이블 편집",
      description: "수익 비교 분석 테이블의 모든 인자에 대한 계산식 또는 값을 편집할 수 있습니다.",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[28px] font-bold text-[#191F28] tracking-[-0.02em] mb-2">
          설정
        </h2>
        <p className="text-[16px] text-[#4E5968] tracking-[-0.02em]">
          애플리케이션의 다양한 설정을 관리할 수 있습니다.
        </p>
      </div>

      {activeEditor === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsCards.map((card) => (
            <Card
              key={card.id}
              className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]"
              onClick={() => setActiveEditor(card.id)}
            >
              <CardHeader>
                <CardTitle className="text-[18px] font-semibold text-[#191F28] tracking-[-0.02em]">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-[14px] text-[#4E5968] tracking-[-0.02em] flex-1">
                    {card.description}
                  </p>
                  <ChevronRight className="h-5 w-5 text-[#8B95A1] ml-4 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setActiveEditor(null)}
            className="text-[16px] text-[#3182F6] hover:text-[#1E6DD8] font-medium tracking-[-0.02em] flex items-center gap-2 transition-colors"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
            설정으로 돌아가기
          </button>

          {activeEditor === "analysis-table" && (
            <AnalysisTableEditor onClose={() => setActiveEditor(null)} />
          )}
        </div>
      )}
    </div>
  );
}





