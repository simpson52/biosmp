import { AVAILABLE_VARIABLES } from "@/lib/variable-mapper";
import type { FormulaPart, VariableMatch } from "../types";

/**
 * 정규식 특수문자 이스케이프
 */
export function escapeRegExp(str: string): string {
  return str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * 한글 변수명을 영문 코드로 변환
 */
export function koreanToCode(korean: string): string | null {
  for (const [code, info] of Object.entries(AVAILABLE_VARIABLES)) {
    if (info.label.includes(korean) || korean.includes(info.label)) {
      return code;
    }
  }
  return null;
}

/**
 * 영문 코드를 한글 변수명으로 변환
 */
export function codeToKorean(code: string): string {
  return AVAILABLE_VARIABLES[code]?.label || code;
}

/**
 * 한글 수식을 영문 코드 수식으로 변환
 */
export function parseKoreanFormula(koreanFormula: string): string {
  if (!koreanFormula) return "";
  
  let result = koreanFormula;
  
  // 모든 변수명을 길이 순으로 정렬 (긴 것부터 매칭하여 부분 매칭 방지)
  const sortedVariables = Object.entries(AVAILABLE_VARIABLES)
    .map(([code, info]) => ({ code, label: info.label }))
    .sort((a, b) => b.label.length - a.label.length);
  
  // 변수 매칭을 위한 정확한 위치 추적
  const matches: VariableMatch[] = [];
  
  // 모든 변수 매칭 찾기 (단어 경계 고려)
  for (const { code, label } of sortedVariables) {
    // 단어 경계를 고려한 정규식 (앞뒤가 연산자, 공백, 또는 문자열의 시작/끝)
    const wordBoundaryPattern = String.raw`(^|[+\-*/()\s])${escapeRegExp(label)}([+\-*/()\s]|$)`;
    const regex = new RegExp(wordBoundaryPattern, "g");
    let match;
    while ((match = regex.exec(result)) !== null) {
      // 실제 변수 시작 위치 (그룹 캡처 제외)
      const actualStart = match.index + (match[1]?.length || 0);
      const actualEnd = actualStart + label.length;
      
      matches.push({
        start: actualStart,
        end: actualEnd,
        code,
        label,
      });
    }
  }
  
  // 겹치는 매칭 제거 (긴 것 우선)
  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end; // 긴 것 우선
  });
  
  const filteredMatches: VariableMatch[] = [];
  for (const match of matches) {
    const overlaps = filteredMatches.some(
      (m) => !(match.end <= m.start || match.start >= m.end)
    );
    if (!overlaps) {
      filteredMatches.push(match);
    }
  }
  
  // 역순으로 정렬하여 뒤에서부터 치환 (인덱스 변경 방지)
  filteredMatches.sort((a, b) => b.start - a.start);
  
  // 매칭된 변수를 영문 코드로 치환
  for (const match of filteredMatches) {
    const before = result.substring(0, match.start);
    const after = result.substring(match.end);
    result = before + match.code + after;
  }
  
  return result;
}

/**
 * 수식에서 변수를 찾아서 파트 배열로 변환
 */
export function parseFormulaWithVariables(formula: string): FormulaPart[] {
  if (!formula) return [];
  
  const parts: FormulaPart[] = [];
  let remaining = formula;
  
  // 모든 변수명을 길이 순으로 정렬 (긴 것부터 매칭)
  const sortedVariables = Object.entries(AVAILABLE_VARIABLES)
    .map(([code, info]) => ({ code, label: info.label }))
    .sort((a, b) => b.label.length - a.label.length);
  
  const matches: VariableMatch[] = [];
  
  // 모든 변수 매칭 찾기 (단어 경계 고려)
  for (const { code, label } of sortedVariables) {
    // 단어 경계를 고려한 정규식 (앞뒤가 연산자, 공백, 또는 문자열의 시작/끝)
    const wordBoundaryPattern = String.raw`(^|[+\-*/()\s])${escapeRegExp(label)}([+\-*/()\s]|$)`;
    const regex = new RegExp(wordBoundaryPattern, "g");
    let match;
    while ((match = regex.exec(remaining)) !== null) {
      // 실제 변수 시작 위치 (그룹 캡처 제외)
      const actualStart = match.index + (match[1]?.length || 0);
      const actualEnd = actualStart + label.length;
      
      matches.push({
        start: actualStart,
        end: actualEnd,
        code,
        label,
      });
    }
  }
  
  // 겹치는 매칭 제거 (긴 것 우선)
  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end; // 긴 것 우선
  });
  
  const filteredMatches: VariableMatch[] = [];
  for (const match of matches) {
    const overlaps = filteredMatches.some(
      (m) => !(match.end <= m.start || match.start >= m.end)
    );
    if (!overlaps) {
      filteredMatches.push(match);
    }
  }
  
  filteredMatches.sort((a, b) => a.start - b.start);
  
  // 매칭된 부분과 텍스트 부분 분리
  let currentIndex = 0;
  for (const match of filteredMatches) {
    if (match.start > currentIndex) {
      parts.push({
        type: "text",
        content: remaining.substring(currentIndex, match.start),
      });
    }
    parts.push({
      type: "variable",
      content: match.label,
      variableCode: match.code,
    });
    currentIndex = match.end;
  }
  
  if (currentIndex < remaining.length) {
    parts.push({
      type: "text",
      content: remaining.substring(currentIndex),
    });
  }
  
  if (parts.length === 0) {
    parts.push({ type: "text", content: formula });
  }
  
  return parts;
}

