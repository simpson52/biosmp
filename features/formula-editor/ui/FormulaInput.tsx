import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getTextFromEditable } from "../lib/dom-utils";
import { AutocompleteDropdown } from "./AutocompleteDropdown";
import type { AutocompleteOption } from "../types";
import { AUTOBLUR_DELAY_MS } from "../constants";

interface FormulaInputProps {
  editableRef: React.RefObject<HTMLDivElement>;
  autocompleteRef: React.RefObject<HTMLDivElement>;
  koreanFormula: string;
  showAutocomplete: boolean;
  autocompleteOptions: AutocompleteOption[];
  selectedAutocompleteIndex: number;
  onInput: (text: string) => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onVariableSelect: (option: AutocompleteOption) => void;
  onUpdatePosition: () => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
}

export function FormulaInput({
  editableRef,
  autocompleteRef,
  koreanFormula,
  showAutocomplete,
  autocompleteOptions,
  selectedAutocompleteIndex,
  onInput,
  onCompositionStart,
  onCompositionEnd,
  onKeyDown,
  onVariableSelect,
  onUpdatePosition,
  onBlur,
}: FormulaInputProps) {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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
  };

  const handleFocus = () => {
    if (autocompleteOptions.length > 0) {
      onUpdatePosition();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // 자동완성 클릭을 기다림
    setTimeout(() => {
      if (!autocompleteRef.current?.contains(e.relatedTarget as Node)) {
        // blur 처리 (부모 컴포넌트에서 처리)
      }
    }, AUTOBLUR_DELAY_MS);
  };

  return (
    <div className="flex flex-col">
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
              onInput(text);
              setTimeout(() => onUpdatePosition(), 0);
            }}
            onCompositionStart={onCompositionStart}
            onCompositionEnd={onCompositionEnd}
            onKeyDown={onKeyDown}
            onMouseDown={handleMouseDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
          <AutocompleteDropdown
            show={showAutocomplete}
            options={autocompleteOptions}
            selectedIndex={selectedAutocompleteIndex}
            onSelect={onVariableSelect}
            autocompleteRef={autocompleteRef}
          />
        </div>
      </div>
    </div>
  );
}

