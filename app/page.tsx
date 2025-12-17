"use client";

import { useState } from "react";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { Simulation } from "@/components/Simulation";

function AppContent() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "simulation">("dashboard");

  return (
    <div className="min-h-screen bg-material-gray-50 flex flex-col">
      {/* 네비게이션 바 */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-colors duration-material-standard">
        <div className="max-w-[1400px] mx-auto">
          {/* 탭 컨텐츠 */}
          {activeTab === "dashboard" ? (
            <Dashboard />
          ) : (
            <Simulation />
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
