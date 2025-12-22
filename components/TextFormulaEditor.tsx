"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AVAILABLE_VARIABLES, getVariablesByCategory } from "@/lib/variable-mapper";
import { evaluateFormula } from "@/lib/formula-evaluator";
import { useAppContext } from "@/contexts/AppContext";
import { formatNumber } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CalculationMode } from "@/types";

interface TextFormulaEditorProps {
  readonly field: string;
  readonly fieldLabel: string;
  readonly fieldUnit: string;
  readonly currentMode?: CalculationMode;
  readonly currentFormula?: string;
  readonly currentFixedValue?: number;
  readonly defaultFormula?: string; // 기본 공식 (변수 블럭으로 표시)
  readonly onSave: (
    mode: CalculationMode,
    formula: string,
    fixedValue: number
  ) => void;
  readonly onCancel: () => void;
}

// 한글 변수명을 영문 코드로 변환
function koreanToCode(korean: string): string | null {
  for (const [code, info] of Object.entries(AVAILABLE_VARIABLES)) {
    if (info.label.includes(korean) || korean.includes(info.label)) {
      return code;
    }
  }
  return null;
}

// 영문 코드를 한글 변수명으로 변환
function codeToKorean(code: string): string {
  return AVAILABLE_VARIABLES[code]?.label || code;
}

// 한글 수식을 영문 코드 수식으로 변환
function parseKoreanFormula(koreanFormula: string): string {
  if (!koreanFormula) return "";
  
  let result = koreanFormula;
  
  // 모든 변수명을 길이 순으로 정렬 (긴 것부터 매칭하여 부분 매칭 방지)
  const sortedVariables = Object.entries(AVAILABLE_VARIABLES)
    .map(([code, info]) => ({ code, label: info.label }))
    .sort((a, b) => b.label.length - a.label.length);
  
  // 변수 매칭을 위한 정확한 위치 추적
  const matches: Array<{ start: number; end: number; code: string; label: string }> = [];
  
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
  
  const filteredMatches: typeof matches = [];
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

  // 영문 코드 수식을 한글 변수명으로 변환 (표시용)
function formatFormulaForDisplay(formula: string): string {
  let result = formula;
  
  // 영문 코드를 한글 변수명으로 변환
  for (const [code, info] of Object.entries(AVAILABLE_VARIABLES)) {
    const regex = new RegExp(String.raw`\b${code}\b`, "g");
    result = result.replaceAll(regex, info.label);
  }
  
  return result;
}

// 수식에서 변수를 찾아서 JSX 요소로 변환
function parseFormulaWithVariables(formula: string): Array<{ type: "variable" | "text"; content: string; variableCode?: string }> {
  if (!formula) return [];
  
  const parts: Array<{ type: "variable" | "text"; content: string; variableCode?: string }> = [];
  let remaining = formula;
  
  // 모든 변수명을 길이 순으로 정렬 (긴 것부터 매칭)
  const sortedVariables = Object.entries(AVAILABLE_VARIABLES)
    .map(([code, info]) => ({ code, label: info.label }))
    .sort((a, b) => b.label.length - a.label.length);
  
  const matches: Array<{ start: number; end: number; code: string; label: string }> = [];
  
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
  
  const filteredMatches: typeof matches = [];
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

// 정규식 특수문자 이스케이프
function escapeRegExp(str: string): string {
  return str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

export function TextFormulaEditor({
  field,
  fieldLabel,
  fieldUnit,
  currentMode,
  currentFormula,
  currentFixedValue,
  defaultFormula,
  onSave,
  onCancel,
}: TextFormulaEditorProps) {
  const { state } = useAppContext();
  const [mode, setMode] = useState<"fixed" | "formula">(
    currentMode === "fixed" ? "fixed" : "formula"
  );
  // 초기 koreanFormula 설정 (기본 공식 포함)
  const getInitialFormula = () => {
    if (currentMode === "formula") {
      const formulaToUse = currentFormula || defaultFormula || "";
      if (formulaToUse) {
        return formatFormulaForDisplay(formulaToUse);
      }
    }
    return "";
  };

  const [koreanFormula, setKoreanFormula] = useState<string>(getInitialFormula());
  const [fixedValue, setFixedValue] = useState<string>(
    currentFixedValue?.toString() || "0"
  );
  
  // 자동완성 관련
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState("");
  const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(0);
  const editableRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const variablesByCategory = useMemo(() => getVariablesByCategory(), []);

  // 현재 수식을 한글로 변환하여 표시 (기본 공식 포함)
  useEffect(() => {
    if (currentMode === "formula" || mode === "formula") {
      // currentFormula가 있으면 사용, 없으면 defaultFormula 사용
      const formulaToUse = currentFormula || defaultFormula || "";
      
      if (formulaToUse) {
        const displayFormula = formatFormulaForDisplay(formulaToUse);
      setKoreanFormula(displayFormula);
        
        // 초기 로드 시 contentEditable에 변수 블록 형태로 표시
        // setTimeout을 사용하여 DOM이 준비된 후 실행
        setTimeout(() => {
          if (editableRef.current) {
            const parts = parseFormulaWithVariables(displayFormula);
            editableRef.current.innerHTML = parts.map((part, index) => {
              if (part.type === "variable") {
                return `<span class="variable-block inline-block px-1.5 py-0.5 rounded" contenteditable="false" data-variable-index="${index}" style="background-color: #E5E7EB; color: #DC2626; border-radius: 6px; font-weight: 600; user-select: none;">${escapeHtml(part.content)}</span>`;
              }
              return escapeHtml(part.content);
            }).join("");
          }
        }, 0);
      } else {
        setKoreanFormula("");
        if (editableRef.current) {
          editableRef.current.innerHTML = "";
        }
      }
    }
  }, [currentFormula, currentMode, defaultFormula, mode]);

  // contentEditable에서 텍스트 추출
  const getTextFromEditable = useCallback((element: HTMLElement | null): string => {
    if (!element) return "";
    return element.textContent || "";
  }, []);

  // contentEditable에서 커서 위치 설정 (변수 블록 고려)
  const setCursorInEditable = useCallback((element: HTMLElement, position: number) => {
    const range = document.createRange();
    const selection = globalThis.getSelection();
    
    let currentPos = 0;
    let targetNode: Node | null = null;
    let targetOffset = 0;
    
    // 모든 노드를 순회 (텍스트 노드와 요소 노드 모두)
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null
    );
    
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nodeLength = node.textContent?.length || 0;
        if (currentPos + nodeLength >= position) {
          targetNode = node;
          targetOffset = position - currentPos;
          break;
        }
        currentPos += nodeLength;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.classList.contains('variable-block')) {
          const blockLength = el.textContent?.length || 0;
          if (currentPos + blockLength >= position) {
            // 변수 블록 내부 또는 바로 뒤에 커서를 위치시켜야 함
            // 변수 블록 뒤에 텍스트 노드가 있으면 그곳에, 없으면 변수 블록 뒤에 빈 텍스트 노드 생성
            if (position === currentPos + blockLength) {
              // 변수 블록 바로 뒤에 커서 위치
              const nextSibling = el.nextSibling;
              if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
                targetNode = nextSibling;
                targetOffset = 0;
              } else {
                // 텍스트 노드가 없으면 변수 블록 뒤에 생성
                const textNode = document.createTextNode("");
                el.parentElement?.insertBefore(textNode, el.nextSibling);
                targetNode = textNode;
                targetOffset = 0;
              }
            } else {
              // 변수 블록 내부 (이론적으로는 발생하지 않아야 함)
              targetNode = el.firstChild || el;
              targetOffset = position - currentPos;
            }
            break;
          }
          currentPos += blockLength;
        } else {
          // 일반 요소 노드의 텍스트 길이 추가
          const textLength = el.textContent?.length || 0;
          if (currentPos + textLength >= position) {
            // 요소 내부의 텍스트 노드를 찾아야 함
            const textWalker = document.createTreeWalker(
              el,
              NodeFilter.SHOW_TEXT,
              null
            );
            let textNode: Node | null;
            let innerPos = currentPos;
            while ((textNode = textWalker.nextNode())) {
              const nodeLength = textNode.textContent?.length || 0;
              if (innerPos + nodeLength >= position) {
                targetNode = textNode;
                targetOffset = position - innerPos;
                break;
              }
              innerPos += nodeLength;
            }
            if (targetNode) break;
          }
          currentPos += textLength;
        }
      }
    }
    
    // 커서 위치 설정
    if (targetNode) {
      if (targetNode.nodeType === Node.TEXT_NODE) {
        range.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
        range.setEnd(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
      } else {
        // 요소 노드인 경우 (변수 블록)
        range.setStartAfter(targetNode);
        range.setEndAfter(targetNode);
      }
    } else {
      // 위치를 찾지 못한 경우 마지막에 커서 위치
      const lastNode = element.lastChild;
      if (lastNode) {
        if (lastNode.nodeType === Node.TEXT_NODE) {
          range.setStart(lastNode, lastNode.textContent?.length || 0);
          range.setEnd(lastNode, lastNode.textContent?.length || 0);
        } else {
          range.setStartAfter(lastNode);
          range.setEndAfter(lastNode);
        }
      } else {
        range.setStart(element, 0);
        range.setEnd(element, 0);
      }
    }
    
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  // contentEditable 내용 업데이트 (debounce) - 사용자 입력이 끝났을 때만 변수 하이라이트
  useEffect(() => {
    if (!editableRef.current || isComposing || isTyping) return;
    
    const timer = setTimeout(() => {
      if (!editableRef.current || isTyping) return;
      
      const currentText = getTextFromEditable(editableRef.current);
      // 저장된 텍스트와 현재 텍스트가 다를 때만 업데이트
      // 단, 변수 블록이 포함되어 있으면 텍스트 비교가 정확하지 않을 수 있으므로
      // 변수 블록을 제거한 순수 텍스트로 비교
      const plainText = currentText.replace(/\s+/g, ' ').trim();
      const plainFormula = koreanFormula.replace(/\s+/g, ' ').trim();
      
      if (koreanFormula && plainText !== plainFormula) {
        const selection = globalThis.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        const cursorOffset = range ? getCursorOffset(editableRef.current, range) : null;
        
        // 내용 업데이트
        const parts = parseFormulaWithVariables(koreanFormula);
        editableRef.current.innerHTML = parts.map((part, index) => {
          if (part.type === "variable") {
            return `<span class="variable-block inline-block px-1.5 py-0.5 rounded" contenteditable="false" data-variable-index="${index}" style="background-color: #E5E7EB; color: #DC2626; border-radius: 6px; font-weight: 600; user-select: none;">${escapeHtml(part.content)}</span>`;
          }
          return escapeHtml(part.content);
        }).join("");
        
        // 커서 위치 복원
        if (cursorOffset !== null) {
          setTimeout(() => {
            if (editableRef.current) {
              setCursorInEditable(editableRef.current, cursorOffset);
            }
          }, 0);
        }
      } else if (!koreanFormula && plainText === "") {
        // 빈 값일 때는 내용 초기화
        editableRef.current.innerHTML = "";
      }
    }, 400);
    
    return () => clearTimeout(timer);
  }, [koreanFormula, isComposing, isTyping, getTextFromEditable, setCursorInEditable]);

  // 예상 결과 카드 높이를 계산식 입력 필드와 동기화
  useEffect(() => {
    if (koreanFormula && editableRef.current) {
      const updatePreviewHeight = () => {
        const inputHeight = editableRef.current?.getBoundingClientRect().height;
        const previewCard = document.querySelector('[data-preview-card]') as HTMLElement;
        if (previewCard && inputHeight) {
          previewCard.style.height = `${inputHeight}px`;
        }
      };
      
      // 초기 높이 설정
      const timer = setTimeout(updatePreviewHeight, 100);
      
      // ResizeObserver로 높이 변경 감지
      const resizeObserver = new ResizeObserver(() => {
        updatePreviewHeight();
      });
      
      if (editableRef.current) {
        resizeObserver.observe(editableRef.current);
      }
      
      return () => {
        clearTimeout(timer);
        resizeObserver.disconnect();
      };
    }
  }, [koreanFormula, isTyping]);

  // 커서 오프셋 계산 (변수 블록 고려)
  const getCursorOffset = (element: HTMLElement, range: Range): number => {
    let offset = 0;
    const startContainer = range.startContainer;
    const startOffset = range.startOffset;
    
    // 변수 블록 내부에 커서가 있는지 확인
    let variableBlock: HTMLElement | null = null;
    if (startContainer.nodeType === Node.ELEMENT_NODE) {
      variableBlock = (startContainer as HTMLElement).closest('.variable-block') as HTMLElement | null;
    } else if (startContainer.nodeType === Node.TEXT_NODE) {
      variableBlock = startContainer.parentElement?.closest('.variable-block') as HTMLElement | null;
    }
    
    // 변수 블록 내부에 커서가 있으면 블록의 끝 위치 반환
    if (variableBlock) {
      // 변수 블록 이전의 모든 텍스트 계산
      let node: Node | null = element.firstChild;
      while (node && node !== variableBlock) {
        if (node.nodeType === Node.TEXT_NODE) {
          offset += node.textContent?.length || 0;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.classList.contains('variable-block')) {
            offset += el.textContent?.length || 0;
          } else {
            offset += el.textContent?.length || 0;
          }
        }
        node = node.nextSibling;
      }
      // 변수 블록의 텍스트 길이 추가
      offset += variableBlock.textContent?.length || 0;
      return offset;
    }
    
    // 일반 텍스트 노드 처리
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node === startContainer) {
        offset += startOffset;
        break;
      }
      offset += node.textContent?.length || 0;
    }
    
    return offset;
  };

  // HTML 이스케이프
  const escapeHtml = (text: string): string => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  // 자동완성 필터링
  const autocompleteOptions = useMemo(() => {
    if (!autocompleteQuery) return [];
    
    const query = autocompleteQuery.toLowerCase();
    const options: Array<{ code: string; label: string; description: string }> = [];
    
    for (const [code, info] of Object.entries(AVAILABLE_VARIABLES)) {
      if (code === field) continue; // 자기 자신 제외
      
      const labelLower = info.label.toLowerCase();
      const descLower = info.description.toLowerCase();
      
      if (labelLower.includes(query) || descLower.includes(query) || code.toLowerCase().includes(query)) {
        options.push({ code, label: info.label, description: info.description });
      }
    }
    
    return options.slice(0, 10); // 최대 10개
  }, [autocompleteQuery, field]);

  // 입력 필드에서 자동완성 처리
  const handleInputChange = useCallback((value: string) => {
    setKoreanFormula(value);
    
    // 마지막 한글 단어 추출 (공백, 연산자 기준)
    // 한글만 추출하여 변수명으로 인식
    const lastWordRegex = /[\uAC00-\uD7A3]+$/;
    const lastWordMatch = lastWordRegex.exec(value);
    if (lastWordMatch) {
      const lastWord = lastWordMatch[0];
      // 최소 1글자 이상일 때만 자동완성 표시
      if (lastWord.length >= 1) {
      setAutocompleteQuery(lastWord);
      
        // 드롭다운 위치 업데이트
        updateAutocompletePosition();
        
        // 자동완성 옵션이 있으면 표시
        setTimeout(() => {
          const query = lastWord.toLowerCase();
          const hasOptions = Object.entries(AVAILABLE_VARIABLES).some(([code, info]) => {
            if (code === field) return false;
            const labelLower = info.label.toLowerCase();
            const descLower = info.description.toLowerCase();
            return labelLower.includes(query) || descLower.includes(query) || code.toLowerCase().includes(query);
          });
          setShowAutocomplete(hasOptions);
        }, 0);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setAutocompleteQuery("");
      setShowAutocomplete(false);
    }
  }, [field]);

  // 자동완성 드롭다운 위치 업데이트 (현재는 상대 위치 사용으로 불필요하지만 향후 확장을 위해 유지)
  const updateAutocompletePosition = useCallback(() => {
    // 드롭다운이 입력 필드 바로 아래에 상대적으로 배치되므로 별도 위치 계산 불필요
    // 필요시 여기에 추가 로직 구현 가능
  }, []);

  // 변수 블록 삭제 처리
  const handleVariableBlockDeletion = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!editableRef.current) return false;
    
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    
    // 변수 블록이 선택된 경우
    if (!range.collapsed) {
      const variableBlock = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? (range.commonAncestorContainer as HTMLElement).closest('.variable-block') as HTMLElement | null
        : (range.commonAncestorContainer.parentElement?.closest('.variable-block') as HTMLElement | null);
      
      if (variableBlock) {
      e.preventDefault();
        const variableText = variableBlock.textContent || "";
        const beforeBlock = getTextFromEditable(editableRef.current).split(variableText)[0] || "";
        const afterBlock = getTextFromEditable(editableRef.current).split(variableText)[1] || "";
        const newText = beforeBlock + afterBlock;
        
        variableBlock.remove();
        setKoreanFormula(newText);
        
        // 커서 위치 설정
        setTimeout(() => {
          if (editableRef.current) {
            const newTextNode = document.createTextNode("");
            editableRef.current.insertBefore(newTextNode, editableRef.current.firstChild);
            const newRange = document.createRange();
            newRange.setStart(newTextNode, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }, 0);
        return true;
      }
    }
    
    // 변수 블록 앞/뒤에 커서가 있는 경우
    const container = range.commonAncestorContainer;
    let variableBlock: HTMLElement | null = null;
    if (container.nodeType === Node.TEXT_NODE) {
      variableBlock = container.parentElement?.closest('.variable-block') as HTMLElement | null;
    } else if (container.nodeType === Node.ELEMENT_NODE) {
      variableBlock = (container as HTMLElement).closest('.variable-block') as HTMLElement | null;
    }
    
    if (variableBlock && range.collapsed) {
      const variableText = variableBlock.textContent || "";
      const currentText = getTextFromEditable(editableRef.current);
      const variableIndex = currentText.indexOf(variableText);
      
      if (variableIndex !== -1) {
        // 변수 블록 앞에 커서가 있는 경우 (Backspace)
        if (e.key === "Backspace") {
          const cursorPos = getCursorOffset(editableRef.current, range);
          if (cursorPos === variableIndex) {
            e.preventDefault();
            const newText = currentText.substring(0, variableIndex) + currentText.substring(variableIndex + variableText.length);
            variableBlock.remove();
            setKoreanFormula(newText);
            return true;
          }
        }
        // 변수 블록 뒤에 커서가 있는 경우 (Delete)
        else if (e.key === "Delete") {
          const cursorPos = getCursorOffset(editableRef.current, range);
          if (cursorPos === variableIndex + variableText.length) {
            e.preventDefault();
            const newText = currentText.substring(0, variableIndex) + currentText.substring(variableIndex + variableText.length);
            variableBlock.remove();
            setKoreanFormula(newText);
            return true;
          }
        }
      }
    }
    
    return false;
  }, [getTextFromEditable, getCursorOffset]);

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 변수 블록 삭제 처리 먼저 시도
    if (e.key === "Backspace" || e.key === "Delete") {
      if (handleVariableBlockDeletion(e)) {
        return;
      }
    }
    
    // 자동완성 관련 키 처리
    if (e.key === "Escape") {
      e.preventDefault();
      setShowAutocomplete(false);
      setAutocompleteQuery("");
    } else if (showAutocomplete && autocompleteOptions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedAutocompleteIndex((prev) =>
          Math.min(prev + 1, autocompleteOptions.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedAutocompleteIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        insertVariable(autocompleteOptions[selectedAutocompleteIndex].label);
      } else if (e.key === "Tab") {
        e.preventDefault();
        insertVariable(autocompleteOptions[selectedAutocompleteIndex].label);
      }
    }
  };

  // 변수 삽입
  const insertVariable = useCallback((variableLabel: string) => {
    if (!editableRef.current) return;
    
    const selection = globalThis.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    if (!range) return;
    
    // 변수 블록 내부에 커서가 있는지 확인
    let variableBlock: HTMLElement | null = null;
    const container = range.commonAncestorContainer;
    if (container.nodeType === Node.ELEMENT_NODE) {
      variableBlock = (container as HTMLElement).closest('.variable-block') as HTMLElement | null;
    } else if (container.nodeType === Node.TEXT_NODE) {
      variableBlock = container.parentElement?.closest('.variable-block') as HTMLElement | null;
    }
    
    // 변수 블록이 선택되어 있거나 내부에 커서가 있으면, 그 블록 뒤에 삽입
    let textOffset: number;
    if (variableBlock) {
      // 변수 블록 뒤의 위치 계산
      const blockText = variableBlock.textContent || "";
      const allText = getTextFromEditable(editableRef.current);
      const blockIndex = allText.indexOf(blockText);
      if (blockIndex !== -1) {
        textOffset = blockIndex + blockText.length;
      } else {
        // 찾을 수 없으면 현재 커서 위치 사용
        textOffset = getCursorOffset(editableRef.current, range);
      }
    } else {
      // 정확한 텍스트 오프셋 계산
      textOffset = getCursorOffset(editableRef.current, range);
    }
    
    const currentValue = getTextFromEditable(editableRef.current);
    
    // 마지막 한글 단어를 변수명으로 교체
    const beforeCursor = currentValue.substring(0, textOffset);
    const afterCursor = currentValue.substring(textOffset);
    const lastWordRegex = /[\uAC00-\uD7A3]+$/;
    const lastWordMatch = lastWordRegex.exec(beforeCursor);
    
    let newValue: string;
    let newCursorPos: number;
    if (lastWordMatch && lastWordMatch[0].length >= 1) {
      // 마지막 한글 단어가 있으면 교체
      const wordStart = textOffset - lastWordMatch[0].length;
      newValue =
        currentValue.substring(0, wordStart) +
        variableLabel +
        afterCursor;
      newCursorPos = wordStart + variableLabel.length;
    } else {
      // 없으면 현재 위치에 삽입
      newValue = beforeCursor + variableLabel + afterCursor;
      newCursorPos = textOffset + variableLabel.length;
    }
    
    // 타이핑 상태 해제하여 즉시 업데이트
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    setKoreanFormula(newValue);
    setShowAutocomplete(false);
    setAutocompleteQuery("");
    
    // contentEditable div 즉시 업데이트
    const parts = parseFormulaWithVariables(newValue);
    editableRef.current.innerHTML = parts.map((part, index) => {
      if (part.type === "variable") {
        return `<span class="variable-block inline-block px-1.5 py-0.5 rounded" contenteditable="false" data-variable-index="${index}" data-variable-label="${escapeHtml(part.content)}" style="background-color: #E5E7EB; color: #DC2626; border-radius: 6px; font-weight: 600; user-select: none;">${escapeHtml(part.content)}</span>`;
      }
      return escapeHtml(part.content);
    }).join("");
    
    // 다음 렌더링 후 커서 위치 설정
    setTimeout(() => {
      if (editableRef.current) {
        // 삽입된 변수 블록을 찾아서 그 뒤에 커서 위치
        const insertedVariableBlock = editableRef.current.querySelector(
          `[data-variable-label="${escapeHtml(variableLabel)}"]`
        ) as HTMLElement;
        
        if (insertedVariableBlock) {
          // 변수 블록 바로 뒤에 커서 위치
          const range = document.createRange();
          const selection = globalThis.getSelection();
          
          // 변수 블록 뒤에 텍스트 노드가 있는지 확인
          let nextNode = insertedVariableBlock.nextSibling;
          if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
            range.setStart(nextNode, 0);
            range.setEnd(nextNode, 0);
          } else {
            // 텍스트 노드가 없으면 변수 블록 뒤에 생성
            const textNode = document.createTextNode("");
            insertedVariableBlock.parentElement?.insertBefore(textNode, insertedVariableBlock.nextSibling);
            range.setStart(textNode, 0);
            range.setEnd(textNode, 0);
          }
          
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } else {
          // 변수 블록을 찾지 못한 경우 기존 방식 사용
          setCursorInEditable(editableRef.current, newCursorPos);
        }
        
        editableRef.current.focus();
      }
    }, 0);
  }, [getTextFromEditable, setCursorInEditable, getCursorOffset]);

  // 전체 변수 목록 렌더링 (중첩 깊이 줄이기)
  const renderFullVariableList = useCallback(() => {
    return (
      <div className="p-2">
        {Object.entries(variablesByCategory).map(([category, vars]) => {
          const filteredVars = vars.filter((v) => v.code !== field);
          return (
            <div key={category} className="mt-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#8B95A1] uppercase">
                {category}
              </div>
              {filteredVars.map((variable) => (
                <button
                  key={variable.code}
                  type="button"
                  onClick={() => insertVariable(variable.label)}
                  className="w-full text-left p-2 rounded-[8px] hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="font-medium text-[13px] text-[#191F28]">
                    {variable.label}
                  </div>
                  <div className="text-[11px] text-[#8B95A1] mt-0.5">
                    {variable.description}
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    );
  }, [variablesByCategory, field, insertVariable]);

  // 저장
  const handleSave = () => {
    if (mode === "fixed") {
      const numValue = Number.parseFloat(fixedValue);
      if (Number.isNaN(numValue)) {
        alert("올바른 숫자를 입력해주세요.");
        return;
      }
      onSave("fixed", "", numValue);
      return;
    }
    
    if (mode === "formula") {
      const englishFormula = parseKoreanFormula(koreanFormula);
      onSave("formula", englishFormula, 0);
    }
  };

  // 계산식 예상 결과 계산
  const calculatePreviewResult = useMemo(() => {
    if (mode !== "formula" || !koreanFormula) return null;
    
    try {
      const englishFormula = parseKoreanFormula(koreanFormula);
      if (!englishFormula.trim()) return null;
      
      // 디버깅: 변환된 공식 확인
      if (process.env.NODE_ENV === "development") {
        console.log("[Formula Debug] Korean:", koreanFormula);
        console.log("[Formula Debug] English:", englishFormula);
      }
      
      // 기본 변수 컨텍스트 구성 (93MW 기준) - getDefaultValue와 동일한 로직 사용
      const output = 93;
      const inputParams = state.inputParameters;
      const rowInput = state.plantRowInputs[93];
      
      if (!rowInput) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[Formula Debug] rowInput for 93MW not found");
        }
        return null;
      }
      
      const smp = inputParams.baseSMP;
      
      // 기본 입력 변수들 - getDefaultValue와 동일하게 직접 사용 (기본값 없음)
      const context: Record<string, number> = {
        output,
        smp,
        transmissionEfficiency: rowInput.transmissionEfficiency,
        internalConsumptionRate: rowInput.internalConsumptionRate,
        pksCalorificValue: inputParams.pksCalorificValue,
        wcCalorificValue: inputParams.wcCalorificValue,
        pksUnitPrice: inputParams.pksUnitPrice,
        wcUnitPrice: inputParams.wcUnitPrice,
      };
      
      // 계산 결과 변수들 계산 (93MW 기준) - getDefaultValue와 동일한 로직 사용
      // 송전량 = 출력 * (1 - 소내소비율/100)
      const transmissionAmount = output * (1 - rowInput.internalConsumptionRate / 100);
      context.transmissionAmount = transmissionAmount;
      
      // 발전효율 = 송전효율 / (1 - 소내소비율/100)
      const generationEfficiency = rowInput.transmissionEfficiency / (1 - rowInput.internalConsumptionRate / 100);
      context.generationEfficiency = generationEfficiency;
      
      // PKS 연료사용량 = ((출력 / 발전효율) * 860 * 24 - (700 * WC단위열량)) / PKS단위열량
      const pksFuelConsumption = ((output / (generationEfficiency / 100)) * 860 * 24 - (700 * inputParams.wcCalorificValue)) / inputParams.pksCalorificValue;
      context.pksFuelConsumption = pksFuelConsumption;
      
      // WC 연료사용량 = 700 (고정값)
      context.wcFuelConsumption = 700;
      
      // WC 혼소율 = (700 * WC단위열량) / (PKS연료사용량 * PKS단위열량 + 700 * WC단위열량)
      // 주의: calculatePlantAnalysis와 동일하게 0-1 범위로 계산 (백분율 아님)
      // 사용자가 입력한 공식에서 "WC 혼소율 / 100"을 사용하므로, 컨텍스트에는 0-1 범위 값 사용
      const wcCoFiringRateRaw = (700 * inputParams.wcCalorificValue) / (pksFuelConsumption * inputParams.pksCalorificValue + 700 * inputParams.wcCalorificValue);
      // calculatePlantAnalysis와 동일: 컨텍스트에는 0-1 범위 값 사용
      context.wcCoFiringRate = wcCoFiringRateRaw;
      
      // PKS 발전단가 = (PKS단위가격 / PKS단위열량) * 860 * (100 / 송전효율) / 1000
      const pksGenerationCost = (inputParams.pksUnitPrice / inputParams.pksCalorificValue) * 860 * (100 / rowInput.transmissionEfficiency) / 1000;
      context.pksGenerationCost = pksGenerationCost;
      
      // WC 발전단가 = (WC단위가격 / WC단위열량) * 860 * (100 / 송전효율) / 1000
      const wcGenerationCost = (inputParams.wcUnitPrice / inputParams.wcCalorificValue) * 860 * (100 / rowInput.transmissionEfficiency) / 1000;
      context.wcGenerationCost = wcGenerationCost;
      
      // 총 발전단가 = PKS발전단가 * (1 - WC혼소율) + WC발전단가 * WC혼소율
      // 주의: getDefaultValue와 동일하게 wcCoFiringRateRaw (0-1 범위) 사용
      context.totalGenerationCost = pksGenerationCost * (1 - wcCoFiringRateRaw) + wcGenerationCost * wcCoFiringRateRaw;
      
      // 약품비 = 출력이 93MW면 7.6, 아니면 (93 / 출력) * 7.6 * 0.95
      const chemicalCost = output === 93 ? 7.6 : (93 / output) * 7.6 * 0.95;
      context.chemicalCost = chemicalCost;
      
      // 수전요금 = 1158000 / (송전량 * 24 * 316)
      const waterFee = 1158000 / (transmissionAmount * 24 * 316);
      context.waterFee = waterFee;
      
      // 매출 전력량 = (SMP * 출력 * 1000 * (1 - 소내소비율/100) * 24) / 1000000
      const salesPower = (smp * output * 1000 * (1 - rowInput.internalConsumptionRate / 100) * 24) / 1000000;
      context.salesPower = salesPower;
      
      // 매출 REC = (63 * 출력 * 1000 * (1 - 소내소비율/100) * 24) / 1000000
      const salesREC = (63 * output * 1000 * (1 - rowInput.internalConsumptionRate / 100) * 24) / 1000000;
      context.salesREC = salesREC;
      
      // 매출 계 = 매출 전력량 + 매출 REC
      const salesTotal = salesPower + salesREC;
      context.salesTotal = salesTotal;
      
      // 비용 연료비 = (PKS연료사용량 * PKS단위가격 + 700 * WC단위가격) / 1000000
      const costFuel = (pksFuelConsumption * inputParams.pksUnitPrice + 700 * inputParams.wcUnitPrice) / 1000000;
      context.costFuel = costFuel;
      
      // 비용 약품비 = (출력 * (1 - 소내소비율/100) * 1000 * 약품비 * 24) / 1000000
      const costChemical = (output * (1 - rowInput.internalConsumptionRate / 100) * 1000 * chemicalCost * 24) / 1000000;
      context.costChemical = costChemical;
      
      // 비용 수전요금 = (출력 * 1000 * (1 - 소내소비율/100) * 수전요금 * 24) / 1000000
      const costWater = (output * 1000 * (1 - rowInput.internalConsumptionRate / 100) * waterFee * 24) / 1000000;
      context.costWater = costWater;
      
      // 기여이익 = 매출 계 - (비용 연료비 + 비용 약품비 + 비용 수전요금)
      const contributionProfit = salesTotal - (costFuel + costChemical + costWater);
      context.contributionProfit = contributionProfit;
      
      // 시간당 기대이익 = (기여이익 / 24) * 10
      context.hourlyExpectedProfit = (contributionProfit / 24) * 10;
      
      // 디버깅: 컨텍스트 확인
      if (process.env.NODE_ENV === "development") {
        const missingVars = englishFormula.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g)?.filter(
          (varName) => !context.hasOwnProperty(varName) && !["Math", "Number", "parseFloat", "parseInt"].includes(varName)
        );
        if (missingVars && missingVars.length > 0) {
          console.warn("[Formula Debug] Missing variables:", missingVars);
          console.log("[Formula Debug] Available context keys:", Object.keys(context));
        }
      }
      
      const result = evaluateFormula(englishFormula, context);
      
      // 결과 검증
      if (typeof result !== "number" || !isFinite(result)) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[Formula Debug] Invalid result:", result);
        }
        return null;
      }
      
      return result;
    } catch (error) {
      // 상세한 에러 정보 로깅
      console.error("[Formula Error] Calculation failed:", error);
      if (error instanceof Error) {
        console.error("[Formula Error] Message:", error.message);
        console.error("[Formula Error] Stack:", error.stack);
      }
      if (process.env.NODE_ENV === "development") {
        console.error("[Formula Error] Korean formula:", koreanFormula);
        try {
          const englishFormula = parseKoreanFormula(koreanFormula);
          console.error("[Formula Error] English formula:", englishFormula);
        } catch (parseError) {
          console.error("[Formula Error] Parse error:", parseError);
        }
      }
      return null;
    }
  }, [mode, koreanFormula, state]);


  return (
    <div className="space-y-8 w-full">
      {/* 모드 선택 */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setMode("formula")}
            className={cn(
              "p-6 rounded-[24px] text-left transition-all active:scale-[0.96]",
              mode === "formula"
                ? "bg-[#E8F3FF]"
                : "bg-white hover:bg-[#F9FAFB]"
            )}
          >
            <div className="font-bold text-[17px] text-[#191F28] mb-1 tracking-[-0.02em]">
              계산식
            </div>
            <div className="text-[14px] text-[#8B95A1] tracking-[-0.02em]">
              한글 변수명으로 입력
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMode("fixed")}
            className={cn(
              "p-6 rounded-[24px] text-left transition-all active:scale-[0.96]",
              mode === "fixed"
                ? "bg-[#E8F3FF]"
                : "bg-white hover:bg-[#F9FAFB]"
            )}
          >
            <div className="font-bold text-[17px] text-[#191F28] mb-1 tracking-[-0.02em]">
              고정값
            </div>
            <div className="text-[14px] text-[#8B95A1] tracking-[-0.02em]">
              숫자 직접 입력
            </div>
          </button>
        </div>
      </div>

      {/* 고정값 입력 */}
      {mode === "fixed" && (
        <div className="space-y-4">
          <Input
            id="fixed-value"
            type="number"
            value={fixedValue}
            onChange={(e) => setFixedValue(e.target.value)}
            placeholder={`고정값 (${fieldUnit})`}
            className="w-full bg-[#F9FAFB] text-[#191F28] rounded-[16px] px-4 py-4 text-[17px] font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6]/20 placeholder-[#8B95A1] tracking-[-0.02em]"
            autoFocus
          />
        </div>
      )}

      {/* 계산식 입력 */}
      {mode === "formula" && (
        <div className="space-y-4">
          {/* 왼쪽: 계산식 입력, 중앙: = 기호, 오른쪽: 예상 결과 카드 */}
          <div className="grid grid-cols-[1fr_auto_minmax(0,150px)] gap-3 items-center">
            {/* 왼쪽 열: 계산식 입력 */}
            <div className="flex flex-col">
              {/* 계산식 입력 */}
          <div className="space-y-2">
            <div className="relative">
                  <div
                    ref={editableRef}
                id="formula-input"
                    contentEditable
                    suppressContentEditableWarning
                    aria-label="계산식 입력"
                    aria-multiline="true"
                    onInput={(e) => {
                      const text = getTextFromEditable(e.currentTarget);
                      // 타이핑 중 플래그 설정
                      setIsTyping(true);
                      if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                      }
                      typingTimeoutRef.current = setTimeout(() => {
                        setIsTyping(false);
                      }, 500);
                      
                      // 상태만 업데이트하고, innerHTML은 useEffect에서 처리
                      setKoreanFormula(text);
                      handleInputChange(text);
                      // 입력 후 위치 업데이트
                      setTimeout(() => updateAutocompletePosition(), 0);
                    }}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                onKeyDown={handleKeyDown}
                    onMouseDown={(e) => {
                      // 변수 블록 클릭 시 전체 블록 선택
                      const target = e.target as HTMLElement;
                      const variableBlock = target.closest('.variable-block') as HTMLElement;
                      if (variableBlock) {
                        e.preventDefault();
                        const selection = globalThis.getSelection();
                        if (selection) {
                          const range = document.createRange();
                          range.selectNodeContents(variableBlock);
                          selection.removeAllRanges();
                          selection.addRange(range);
                        }
                      }
                    }}
                onFocus={() => {
                  if (autocompleteQuery) {
                    setShowAutocomplete(autocompleteOptions.length > 0);
                        updateAutocompletePosition();
                  }
                }}
                onBlur={(e) => {
                  // 자동완성 클릭을 기다림
                  setTimeout(() => {
                    if (!autocompleteRef.current?.contains(e.relatedTarget as Node)) {
                      setShowAutocomplete(false);
                    }
                  }, 200);
                }}
                    data-placeholder="예: 출력*(1-소내소비율/100)"
                    className={cn(
                      "min-h-[48px] w-full rounded-[16px] bg-[#F9FAFB] px-4 py-4 text-[17px] font-medium",
                      "focus:outline-none focus:ring-2 focus:ring-[#3182F6]/20",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      !koreanFormula && "before:content-[attr(data-placeholder)] before:text-[#8B95A1] before:text-[14px] before:pointer-events-none"
                    )}
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      lineHeight: "1.5",
                      color: "#191F28",
                    }}
                  />

          {/* 자동완성 드롭다운 */}
          {showAutocomplete && (
            <div
              ref={autocompleteRef}
                      className="absolute z-50 w-full max-w-md bg-white rounded-[24px] shadow-lg max-h-[300px] overflow-y-auto mt-2"
              style={{
                        top: "100%",
                        left: 0,
              }}
            >
              {(() => {
                        // 검색 결과 표시
                  if (autocompleteOptions.length > 0) {
                    return (
                      <div className="p-2">
                        {autocompleteOptions.map((option, index) => (
                          <button
                            key={option.code}
                            type="button"
                            onClick={() => insertVariable(option.label)}
                            className={cn(
                              "w-full text-left p-4 rounded-[16px] transition-all active:scale-[0.96]",
                              index === selectedAutocompleteIndex
                                ? "bg-[#E8F3FF]"
                                : "hover:bg-[#F9FAFB]"
                            )}
                          >
                            <div className="font-bold text-[17px] text-[#191F28] tracking-[-0.02em]">
                              {option.label}
                            </div>
                            <div className="text-[14px] text-[#8B95A1] mt-1 tracking-[-0.02em]">
                              {option.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <div className="p-6 text-center text-[14px] text-[#8B95A1] tracking-[-0.02em]">
                      일치하는 변수가 없습니다
                    </div>
                  );
                      })()}
                  </div>
                  )}
                      </div>
              </div>
            </div>

            {/* 중앙: = 기호 */}
            {koreanFormula && (
              <div className="flex items-center justify-center">
                <span className="text-[32px] font-bold text-[#191F28] tracking-[-0.02em]">
                  =
                </span>
              </div>
            )}

            {/* 오른쪽 열: 계산 결과 - 계산식 입력 박스와 정확히 동일한 높이 및 디자인 */}
            {koreanFormula && (
              <div className="flex h-full min-w-0">
                <div 
                  data-preview-card
                  className="w-full rounded-[16px] bg-[#F9FAFB] px-4 py-4 flex flex-col justify-center items-center min-w-0"
                  style={{
                    height: editableRef.current?.getBoundingClientRect().height || '48px',
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: "1.5",
                    color: "#191F28",
                  }}
                >
                  {calculatePreviewResult !== null ? (
                    <div className="flex items-baseline gap-1.5 justify-center flex-wrap min-w-0 w-full">
                      <span className="text-[17px] font-medium text-[#191F28] leading-tight tracking-[-0.02em] break-words">
                        {typeof calculatePreviewResult === "number" 
                          ? calculatePreviewResult.toLocaleString("ko-KR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : calculatePreviewResult}
                      </span>
                      {fieldUnit && (
                        <span className="text-[14px] text-[#8B95A1] font-medium tracking-[-0.02em] whitespace-nowrap">
                          {fieldUnit}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-[17px] text-[#F04452] font-medium tracking-[-0.02em] break-words text-center">
                      계산식 오류
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 변수 값 표시 - 별도 행으로 배치 (태그 높이 제외) */}
          {koreanFormula && (() => {
                      const parts = parseFormulaWithVariables(koreanFormula);
                      const variables = parts.filter((p) => p.type === "variable" && p.variableCode);
                      const uniqueVariables = Array.from(
                        new Map(variables.map((v) => [v.variableCode, v])).values()
                      );

                      if (uniqueVariables.length === 0) return null;

                      // 93MW 기준으로 변수 값 계산
                      const output = 93;
                      const inputParams = state.inputParameters;
                      const rowInput = state.plantRowInputs[93];
                      const smp = state.inputParameters.baseSMP;

                      // 기본 컨텍스트
                      const baseContext: Record<string, number> = {
                        output,
                        smp,
                        transmissionEfficiency: rowInput.transmissionEfficiency,
                        internalConsumptionRate: rowInput.internalConsumptionRate,
                        pksCalorificValue: inputParams.pksCalorificValue,
                        wcCalorificValue: inputParams.wcCalorificValue,
                        pksUnitPrice: inputParams.pksUnitPrice,
                        wcUnitPrice: inputParams.wcUnitPrice,
                      };

                      // 계산 결과 변수들 계산 (getDefaultValue와 동일한 로직)
                      const transmissionAmount = output * (1 - rowInput.internalConsumptionRate / 100);
                      const generationEfficiency = rowInput.transmissionEfficiency / (1 - rowInput.internalConsumptionRate / 100);
                      const pksFuelConsumption = ((output / (generationEfficiency / 100)) * 860 * 24 - (700 * inputParams.wcCalorificValue)) / inputParams.pksCalorificValue;
                      // wcCoFiringRate는 0-1 범위로 계산하되, 표시는 백분율로 변환
                      const wcCoFiringRateRaw = (700 * inputParams.wcCalorificValue) / (pksFuelConsumption * inputParams.pksCalorificValue + 700 * inputParams.wcCalorificValue);
                      const wcCoFiringRate = wcCoFiringRateRaw * 100; // 백분율로 변환하여 표시
                      const pksGenerationCost = (inputParams.pksUnitPrice / inputParams.pksCalorificValue) * 860 * (100 / rowInput.transmissionEfficiency) / 1000;
                      const wcGenerationCost = (inputParams.wcUnitPrice / inputParams.wcCalorificValue) * 860 * (100 / rowInput.transmissionEfficiency) / 1000;
                      // totalGenerationCost 계산 시 wcCoFiringRateRaw (0-1 범위) 사용
                      const totalGenerationCost = pksGenerationCost * (1 - wcCoFiringRateRaw) + wcGenerationCost * wcCoFiringRateRaw;
                      const chemicalCost = output === 93 ? 7.6 : (93 / output) * 7.6 * 0.95;
                      const waterFee = 1158000 / (transmissionAmount * 24 * 316);
                      const salesPower = (smp * output * 1000 * (1 - rowInput.internalConsumptionRate / 100) * 24) / 1000000;
                      const salesREC = (63 * output * 1000 * (1 - rowInput.internalConsumptionRate / 100) * 24) / 1000000;
                      const salesTotal = salesPower + salesREC;
                      const wcFuelConsumption = 700;
                      const costFuel = (pksFuelConsumption * inputParams.pksUnitPrice + 700 * inputParams.wcUnitPrice) / 1000000;
                      const costChemical = (output * (1 - rowInput.internalConsumptionRate / 100) * 1000 * chemicalCost * 24) / 1000000;
                      const costWater = (output * 1000 * (1 - rowInput.internalConsumptionRate / 100) * waterFee * 24) / 1000000;
                      const contributionProfit = salesTotal - (costFuel + costChemical + costWater);
                      const hourlyExpectedProfit = (contributionProfit / 24) * 10;

                      const fullContext = {
                        ...baseContext,
                        transmissionAmount,
                        generationEfficiency,
                        pksFuelConsumption,
                        wcFuelConsumption,
                        wcCoFiringRate: wcCoFiringRateRaw, // 계산용: 0-1 범위
                        pksGenerationCost,
                        wcGenerationCost,
                        totalGenerationCost,
                        chemicalCost,
                        waterFee,
                        salesPower,
                        salesREC,
                        salesTotal,
                        costFuel,
                        costChemical,
                        costWater,
                        contributionProfit,
                        hourlyExpectedProfit,
                      };

                      return (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {uniqueVariables.map((variable) => {
                            const variableCode = variable.variableCode!;
                            const variableInfo = AVAILABLE_VARIABLES[variableCode];
                            const value = fullContext[variableCode as keyof typeof fullContext];
                            
                            if (value === undefined) return null;

                            return (
                              <span
                                key={variableCode}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-[16px] text-[14px] font-medium tracking-[-0.02em] shadow-sm"
                              >
                                <span className="text-[#191F28]">
                                  {variableInfo?.label || variableCode}
                                </span>
                                <span className="text-[#3182F6] font-bold">
                                  {typeof value === "number" 
                                    ? (variableCode === "wcCoFiringRate" 
                                        ? formatNumber(value * 100, 2) // 표시용: 백분율로 변환
                                        : formatNumber(value, variableInfo?.unit === "%" ? 2 : 2))
                                    : value}
                                </span>
                                {variableInfo?.unit && (
                                  <span className="text-[#8B95A1] text-[13px]">
                                    {variableInfo.unit}
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      );
              })()}

          {/* 사용 가능한 변수 가이드 */}
          <div className="space-y-4">
            <div className="bg-white rounded-[24px] p-6 shadow-sm max-h-[300px] overflow-y-auto">
              <div className="space-y-4">
                {Object.entries(variablesByCategory).map(([category, vars]) => {
                  const filteredVars = vars.filter((v) => v.code !== field);
                  if (filteredVars.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <p className="text-[14px] font-semibold text-[#8B95A1] mb-2 tracking-[-0.02em]">
                        {category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {filteredVars.map((variable) => (
                          <button
                            key={variable.code}
                            type="button"
                            onClick={() => insertVariable(variable.label)}
                            className="px-4 py-2 bg-[#F9FAFB] rounded-[16px] text-[14px] font-medium text-[#191F28] hover:bg-[#E8F3FF] active:scale-[0.96] transition-all tracking-[-0.02em]"
                            title={variable.description}
                          >
                            {variable.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 저장/취소 버튼 */}
      <div className="flex items-center gap-4 pt-6">
        <Button 
          onClick={handleSave} 
          className="flex-1 bg-[#3182F6] text-white font-bold text-[17px] py-4 rounded-[18px] active:scale-[0.96] transition-transform tracking-[-0.02em] hover:bg-[#2563EB]"
        >
          저장
        </Button>
        <Button 
          onClick={onCancel} 
          className="flex-1 bg-[#E8F3FF] text-[#3182F6] font-semibold py-4 px-5 rounded-[16px] active:scale-[0.96] transition-transform tracking-[-0.02em] hover:bg-[#D6E9FF]"
        >
          취소
        </Button>
      </div>
    </div>
  );
}

