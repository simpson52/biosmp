"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface NavigationProps {
  activeTab: "dashboard" | "simulation" | "settings";
  onTabChange: (tab: "dashboard" | "simulation" | "settings") => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center h-[56px] relative">
          {/* 좌측: 시스템 이름 및 CI 로고 */}
          <div className="flex items-center gap-3 absolute left-0">
            {/* CI 로고 이미지 */}
            <div className="relative w-auto h-8 flex items-center">
              <Image
                src="/images/ci-logo.svg"
                alt="CI Logo"
                width={99}
                height={46}
                className="h-8 w-auto"
                priority
              />
            </div>
            <h1 className="text-[17px] font-bold text-[#191F28] whitespace-nowrap tracking-[-0.02em]">
              바이오매스 공헌이익 시뮬레이터
            </h1>
          </div>

          {/* 중앙: 탭 네비게이션 */}
          <div className="flex items-center mx-auto">
            <button
              onClick={() => onTabChange("dashboard")}
              className={cn(
                "h-[56px] px-6 text-[17px] font-medium transition-all duration-200 relative active:scale-[0.96]",
                activeTab === "dashboard"
                  ? "text-[#3182F6]"
                  : "text-[#4E5968] hover:text-[#191F28]"
              )}
            >
              대시보드
              {activeTab === "dashboard" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3182F6] rounded-full" />
              )}
            </button>
            <button
              onClick={() => onTabChange("simulation")}
              className={cn(
                "h-[56px] px-6 text-[17px] font-medium transition-all duration-200 relative active:scale-[0.96]",
                activeTab === "simulation"
                  ? "text-[#3182F6]"
                  : "text-[#4E5968] hover:text-[#191F28]"
              )}
            >
              시뮬레이션
              {activeTab === "simulation" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3182F6] rounded-full" />
              )}
            </button>
          </div>

          {/* 우측: 설정 버튼 */}
          <div className="absolute right-0">
            <button
              onClick={() => onTabChange("settings")}
              className={cn(
                "h-[56px] px-6 text-[17px] font-medium transition-all duration-200 relative active:scale-[0.96]",
                activeTab === "settings"
                  ? "text-[#3182F6]"
                  : "text-[#4E5968] hover:text-[#191F28]"
              )}
            >
              설정
              {activeTab === "settings" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3182F6] rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

