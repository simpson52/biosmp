import { useState, useCallback, useEffect, useRef } from "react";
import type { CalculationMode } from "@/types";
import { formatFormulaForDisplay } from "../lib/formula-formatter";
import { parseFormulaWithVariables } from "../lib/formula-parser";
import { getTextFromEditable, setCursorInEditable, escapeHtml } from "../lib/dom-utils";
import { DOM_UPDATE_DELAY_MS, PREVIEW_HEIGHT_UPDATE_DELAY_MS } from "../constants";

interface UseFormulaEditorProps {
  currentMode?: CalculationMode;
  currentFormula?: string;
  currentFixedValue?: number;
  defaultFormula?: string;
  editableRef: React.RefObject<HTMLDivElement>;
  koreanFormula: string;
  setKoreanFormula: (value: string) => void;
  mode: "fixed" | "formula";
}

export function useFormulaEditor({
  currentMode,
  currentFormula,
  currentFixedValue,
  defaultFormula,
  editableRef,
  koreanFormula,
  setKoreanFormula,
  mode,
}: UseFormulaEditorProps) {
  const [fixedValue, setFixedValue] = useState<string>(
    currentFixedValue?.toString() || "0"
  );

  // 초기 koreanFormula 설정 (기본 공식 포함)
  const getInitialFormula = useCallback(() => {
    if (currentMode === "formula") {
      const formulaToUse = currentFormula || defaultFormula || "";
      if (formulaToUse) {
        return formatFormulaForDisplay(formulaToUse);
      }
    }
    return "";
  }, [currentMode, currentFormula, defaultFormula]);

  // 현재 수식을 한글로 변환하여 표시 (기본 공식 포함)
  useEffect(() => {
    if (currentMode === "formula" || mode === "formula") {
      const formulaToUse = currentFormula || defaultFormula || "";
      
      if (formulaToUse) {
        const displayFormula = formatFormulaForDisplay(formulaToUse);
        setKoreanFormula(displayFormula);
        
        // 초기 로드 시 contentEditable에 변수 블록 형태로 표시
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
        }, DOM_UPDATE_DELAY_MS);
      } else {
        setKoreanFormula("");
        if (editableRef.current) {
          editableRef.current.innerHTML = "";
        }
      }
    }
  }, [currentFormula, currentMode, defaultFormula, mode, editableRef, setKoreanFormula]);

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
      const timer = setTimeout(updatePreviewHeight, PREVIEW_HEIGHT_UPDATE_DELAY_MS);
      
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
  }, [koreanFormula, editableRef]);

  // 변수 삽입
  const insertVariable = useCallback((variableLabel: string, getCursorOffset: (element: HTMLElement, range: Range) => number) => {
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
      const blockText = variableBlock.textContent || "";
      const allText = getTextFromEditable(editableRef.current);
      const blockIndex = allText.indexOf(blockText);
      if (blockIndex !== -1) {
        textOffset = blockIndex + blockText.length;
      } else {
        textOffset = getCursorOffset(editableRef.current, range);
      }
    } else {
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
      const wordStart = textOffset - lastWordMatch[0].length;
      newValue = currentValue.substring(0, wordStart) + variableLabel + afterCursor;
      newCursorPos = wordStart + variableLabel.length;
    } else {
      newValue = beforeCursor + variableLabel + afterCursor;
      newCursorPos = textOffset + variableLabel.length;
    }
    
    setKoreanFormula(newValue);
    
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
        const insertedVariableBlock = editableRef.current.querySelector(
          `[data-variable-label="${escapeHtml(variableLabel)}"]`
        ) as HTMLElement;
        
        if (insertedVariableBlock) {
          const range = document.createRange();
          const selection = globalThis.getSelection();
          
          let nextNode = insertedVariableBlock.nextSibling;
          if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
            range.setStart(nextNode, 0);
            range.setEnd(nextNode, 0);
          } else {
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
          setCursorInEditable(editableRef.current, newCursorPos);
        }
        
        editableRef.current.focus();
      }
    }, DOM_UPDATE_DELAY_MS);
  }, [editableRef, setKoreanFormula]);

  return {
    fixedValue,
    setFixedValue,
    insertVariable,
  };
}

