/**
 * 숫자 포맷팅 유틸리티 함수
 * 모든 숫자에 천 단위 구분 쉼표를 추가합니다.
 */

/**
 * 숫자를 천 단위 구분 쉼표가 포함된 문자열로 변환
 * @param value 숫자 값
 * @param decimals 소수점 자릿수 (기본값: 0)
 * @returns 포맷팅된 문자열 (예: 1000 -> "1,000")
 */
export function formatNumber(value: number, decimals: number = 0): string {
  if (isNaN(value) || !isFinite(value)) {
    return "0";
  }

  // 소수점 처리
  const fixedValue = value.toFixed(decimals);
  
  // 정수 부분과 소수 부분 분리
  const parts = fixedValue.split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // 정수 부분에 천 단위 쉼표 추가
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // 소수 부분이 있으면 합쳐서 반환
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

/**
 * 통화 형식으로 포맷팅 (백만원, 만원 등)
 * @param value 숫자 값
 * @param decimals 소수점 자릿수 (기본값: 1)
 * @returns 포맷팅된 문자열
 */
export function formatCurrency(value: number, decimals: number = 1): string {
  return formatNumber(value, decimals);
}

/**
 * 퍼센트 형식으로 포맷팅
 * @param value 숫자 값 (퍼센트)
 * @param decimals 소수점 자릿수 (기본값: 2)
 * @returns 포맷팅된 문자열
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return formatNumber(value, decimals);
}

/**
 * 입력 필드에서 숫자 문자열을 파싱 (천 단위 쉼표 제거)
 * @param value 입력된 문자열 (예: "1,000")
 * @returns 파싱된 숫자
 */
export function parseNumberInput(value: string): number {
  // 쉼표와 공백 제거 후 숫자로 변환
  const cleaned = value.replace(/,/g, "").trim();
  const parsed = Number.parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * 입력 필드에 표시할 값 포맷팅 (천 단위 쉼표 추가)
 * @param value 숫자 값
 * @param decimals 소수점 자릿수 (기본값: 0)
 * @returns 포맷팅된 문자열
 */
export function formatInputValue(value: number, decimals: number = 0): string {
  return formatNumber(value, decimals);
}

