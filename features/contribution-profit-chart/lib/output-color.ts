/**
 * 출력 레벨별 색상 매핑
 */
export function getOutputColor(output: number | string): string {
  if (typeof output === "string") {
    if (output === "정지") {
      return "#8B95A1"; // 회색 (정지 구간)
    }
    // "65MW", "80MW", "93MW" 같은 형식 처리
    const outputNum = Number.parseInt(output.replace('MW', ''), 10);
    if (!Number.isNaN(outputNum)) {
      if (outputNum === 93) return "#191F28"; // 검은색
      if (outputNum === 80) return "#F04452"; // 빨간색
      if (outputNum === 65) return "#3182F6"; // 파란색
    }
    return "#8B95A1";
  }
  if (typeof output === "number") {
    if (output === 93) return "#191F28"; // 검은색
    if (output === 80) return "#F04452"; // 빨간색
    if (output === 65) return "#3182F6"; // 파란색
    // 나머지는 회색 계열
    return "#8B95A1";
  }
  return "#8B95A1";
}

