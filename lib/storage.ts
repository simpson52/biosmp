import type { AppState } from "@/types";

const STORAGE_KEY = "smp_dashboard_state";

/**
 * 로컬 스토리지에서 상태 불러오기
 */
export function loadStateFromStorage(): AppState | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as AppState;
  } catch (error) {
    console.error("Failed to load state from storage:", error);
    return null;
  }
}

/**
 * 로컬 스토리지에 상태 저장하기
 */
export function saveStateToStorage(state: AppState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save state to storage:", error);
  }
}

