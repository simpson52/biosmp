"use client";

import { useState } from "react";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { Simulation } from "@/components/Simulation";
import { Settings } from "@/components/Settings";

function AppContent() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "simulation" | "settings">("dashboard");

  return (
    <div className="min-h-screen bg-[#F2F4F6] flex flex-col">
      {/* 네비게이션 바 */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 p-6 md:p-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          {/* 탭 컨텐츠 */}
          {activeTab === "dashboard" ? (
            <Dashboard />
          ) : activeTab === "simulation" ? (
            <Simulation />
          ) : (
            <Settings />
          )}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
