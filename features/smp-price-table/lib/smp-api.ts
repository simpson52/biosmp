import type { HourlySMPData } from "@/types";
import { fetchSMPDataByDateRange } from "@/lib/api";

/**
 * 전력거래소 API에서 SMP 데이터 가져오기
 */
export async function fetchSMPData(
  startDate: string,
  endDate: string
): Promise<HourlySMPData> {
  return fetchSMPDataByDateRange(startDate, endDate);
}

