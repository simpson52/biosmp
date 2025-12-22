/**
 * 날짜를 "MM/DD(요일)" 형식으로 포맷팅
 */
export function formatDate(dateString: string): string {
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
export function getDayOfWeek(dateString: string): number {
  const date = new Date(dateString);
  return date.getDay();
}

/**
 * 날짜를 YYYYMMDD 형식으로 포맷팅
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * YYYYMMDD 형식을 YYYY-MM-DD 형식으로 변환 (input type="date"용)
 */
export function formatYYYYMMDDToInput(dateStr: string): string {
  if (dateStr.length === 8) {
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  }
  return dateStr;
}

/**
 * YYYY-MM-DD 형식을 YYYYMMDD 형식으로 변환
 */
export function formatInputToYYYYMMDD(dateStr: string): string {
  return dateStr.replaceAll("-", "");
}

