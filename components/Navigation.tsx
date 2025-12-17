"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface NavigationProps {
  activeTab: "dashboard" | "simulation";
  onTabChange: (tab: "dashboard" | "simulation") => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bg-white elevation-1 border-b border-material-gray-200 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center h-14 relative">
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
            <h1 className="text-base font-semibold text-material-gray-900 whitespace-nowrap">
              바이오매스 공헌이익 시뮬레이터
            </h1>
          </div>

          {/* 중앙: 탭 네비게이션 */}
          <div className="flex items-center mx-auto">
            <button
              onClick={() => onTabChange("dashboard")}
              className={cn(
                "h-14 px-6 text-sm font-medium transition-all duration-material-standard relative",
                activeTab === "dashboard"
                  ? "text-primary-600"
                  : "text-material-gray-600 hover:text-material-gray-900"
              )}
            >
              대시보드
              {activeTab === "dashboard" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
            <button
              onClick={() => onTabChange("simulation")}
              className={cn(
                "h-14 px-6 text-sm font-medium transition-all duration-material-standard relative",
                activeTab === "simulation"
                  ? "text-primary-600"
                  : "text-material-gray-600 hover:text-material-gray-900"
              )}
            >
              시뮬레이션
              {activeTab === "simulation" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

