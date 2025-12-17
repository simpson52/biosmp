import type { DailySMPData, HourlySMPData } from "@/types";

/**
 * Next.js API Route를 통해 공공데이터포털 API에서 SMP 가격 데이터를 가져오는 함수
 * CORS 문제를 해결하기 위해 서버 사이드 API Route를 사용
 * @param date 날짜 (YYYYMMDD 형식)
 * @returns 시간대별 SMP 가격 데이터
 */
export async function fetchSMPDataFromExchange(
  date: string
): Promise<DailySMPData | null> {
  try {
    // Next.js API Route를 통해 서버 사이드에서 호출
    const response = await fetch(`/api/smp?date=${date}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API 호출 실패: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data as DailySMPData;
  } catch (error) {
    console.error("전력거래소 API 호출 오류:", error);
    throw error;
  }
}

/**
 * 시작일과 종료일 사이의 모든 날짜에 대한 SMP 데이터를 가져오는 함수
 * Next.js API Route를 통해 서버 사이드에서 호출하여 CORS 문제 해결
 * @param startDate 시작일 (YYYYMMDD 형식)
 * @param endDate 종료일 (YYYYMMDD 형식)
 */
export async function fetchSMPDataByDateRange(
  startDate: string,
  endDate: string
): Promise<HourlySMPData> {
  // 시작일과 종료일 사이의 모든 날짜 생성
  const dates: string[] = [];
  const start = parseYYYYMMDD(startDate);
  const end = parseYYYYMMDD(endDate);
  
  if (!start || !end) {
    throw new Error("잘못된 날짜 형식입니다. YYYYMMDD 형식을 사용해주세요.");
  }
  
  // 시작일부터 종료일까지 모든 날짜 추가
  const current = new Date(start);
  while (current <= end) {
    dates.push(formatDateToYYYYMMDD(current));
    current.setDate(current.getDate() + 1);
  }
  
  // 모든 날짜에 대해 병렬로 API 호출
  const results = await Promise.allSettled(
    dates.map((date) => fetchSMPDataFromExchange(date))
  );
  
  // 성공한 결과만 필터링하여 DailySMPData 배열 생성
  const dailyData: DailySMPData[] = results
    .map((result, index) => {
      if (result.status === "fulfilled" && result.value !== null) {
        return result.value;
      }
      if (result.status === "rejected") {
        console.error(`날짜 ${dates[index]} 데이터 로드 실패:`, result.reason);
      }
      return null;
    })
    .filter((data): data is DailySMPData => data !== null)
    .sort((a, b) => a.date.localeCompare(b.date)); // 날짜순으로 정렬
  
  return { dailyData };
}

/**
 * 어제, 오늘, 내일 3일간의 SMP 데이터를 가져오는 헬퍼 함수 (기본값)
 * Next.js API Route를 통해 서버 사이드에서 호출하여 CORS 문제 해결
 */
export async function fetchRecentSMPData(): Promise<HourlySMPData> {
  const today = new Date();
  
  // 어제, 오늘, 내일 날짜 목록 생성 (YYYYMMDD 형식)
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const startDate = formatDateToYYYYMMDD(yesterday);
  const endDate = formatDateToYYYYMMDD(tomorrow);
  
  return fetchSMPDataByDateRange(startDate, endDate);
}

/**
 * 날짜를 YYYYMMDD 형식으로 포맷팅 (공공데이터포털 API용)
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * YYYYMMDD 형식 문자열을 Date 객체로 변환
 */
function parseYYYYMMDD(dateStr: string): Date | null {
  if (dateStr.length !== 8) {
    return null;
  }
  
  const year = Number.parseInt(dateStr.substring(0, 4), 10);
  const month = Number.parseInt(dateStr.substring(4, 6), 10) - 1; // month는 0-based
  const day = Number.parseInt(dateStr.substring(6, 8), 10);
  
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }
  
  const date = new Date(year, month, day);
  
  // 유효한 날짜인지 확인
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  
  return date;
}
