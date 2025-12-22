import { useCallback, useRef, useState } from "react";
import { getTextFromEditable, getCursorOffset, setCursorInEditable } from "../lib/dom-utils";
import { parseFormulaWithVariables } from "../lib/formula-parser";
import { escapeHtml } from "../lib/dom-utils";
import { AUTOCOMPLETE_DEBOUNCE_MS, TYPING_TIMEOUT_MS, DOM_UPDATE_DELAY_MS } from "../constants";

interface UseContentEditableProps {
  editableRef: React.RefObject<HTMLDivElement>;
  koreanFormula: string;
  setKoreanFormula: (value: string) => void;
  isComposing: boolean;
  setIsComposing: (value: boolean) => void;
}

export function useContentEditable({
  editableRef,
  koreanFormula,
  setKoreanFormula,
  isComposing,
  setIsComposing,
}: UseContentEditableProps) {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInput = useCallback((text: string) => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, TYPING_TIMEOUT_MS);
    
    setKoreanFormula(text);
  }, [setKoreanFormula]);

  // contentEditable 내용 업데이트 (debounce) - 사용자 입력이 끝났을 때만 변수 하이라이트
  const updateContentEditable = useCallback(() => {
    if (!editableRef.current || isComposing || isTyping) return;
    
    const timer = setTimeout(() => {
      if (!editableRef.current || isTyping) return;
      
      const currentText = getTextFromEditable(editableRef.current);
      // 저장된 텍스트와 현재 텍스트가 다를 때만 업데이트
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
          }, DOM_UPDATE_DELAY_MS);
        }
      } else if (!koreanFormula && plainText === "") {
        // 빈 값일 때는 내용 초기화
        editableRef.current.innerHTML = "";
      }
    }, AUTOCOMPLETE_DEBOUNCE_MS);
    
    return () => clearTimeout(timer);
  }, [koreanFormula, isComposing, isTyping, editableRef]);

  // 변수 블록 삭제 처리
  const handleVariableBlockDeletion = useCallback((e: React.KeyboardEvent<HTMLDivElement>): boolean => {
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
        const currentText = getTextFromEditable(editableRef.current);
        const beforeBlock = currentText.split(variableText)[0] || "";
        const afterBlock = currentText.split(variableText)[1] || "";
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
        }, DOM_UPDATE_DELAY_MS);
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
  }, [editableRef, setKoreanFormula]);

  return {
    isTyping,
    handleInput,
    updateContentEditable,
    handleVariableBlockDeletion,
    setIsComposing,
  };
}

