"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseKoreanFormula } from "../lib/formula-parser";
import { getCursorOffset } from "../lib/dom-utils";
import { useFormulaEditor } from "../model/useFormulaEditor";
import { useAutocomplete } from "../model/useAutocomplete";
import { useFormulaPreview } from "../model/useFormulaPreview";
import { useContentEditable } from "../model/useContentEditable";
import { ModeSelector } from "./ModeSelector";
import { FormulaInput } from "./FormulaInput";
import { PreviewCard } from "./PreviewCard";
import { VariableTags } from "./VariableTags";
import { VariableList } from "./VariableList";
import { AUTOBLUR_DELAY_MS } from "../constants";
import type { TextFormulaEditorProps } from "../types";

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
  const [mode, setMode] = useState<"fixed" | "formula">(
    currentMode === "fixed" ? "fixed" : "formula"
  );
  const [koreanFormula, setKoreanFormula] = useState<string>("");
  
  const editableRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  const {
    fixedValue,
    setFixedValue,
    insertVariable: baseInsertVariable,
  } = useFormulaEditor({
    currentMode,
    currentFormula,
    currentFixedValue,
    defaultFormula,
    editableRef,
    koreanFormula,
    setKoreanFormula,
    mode,
  });

  const {
    showAutocomplete,
    setShowAutocomplete,
    autocompleteQuery,
    selectedAutocompleteIndex,
    setSelectedAutocompleteIndex,
    autocompleteOptions,
    handleInputChange,
    updateAutocompletePosition,
    handleKeyDown: baseHandleKeyDown,
  } = useAutocomplete({
    field,
    koreanFormula,
    insertVariable: (label: string) => {
      baseInsertVariable(label, getCursorOffset);
    },
  });

  const { calculatePreviewResult } = useFormulaPreview({
    mode,
    koreanFormula,
  });

  const {
    isTyping,
    handleInput,
    updateContentEditable,
    handleVariableBlockDeletion,
  } = useContentEditable({
    editableRef,
    koreanFormula,
    setKoreanFormula,
    isComposing,
    setIsComposing,
  });

  // contentEditable 업데이트
  useEffect(() => {
    return updateContentEditable();
  }, [updateContentEditable]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    baseHandleKeyDown(e, handleVariableBlockDeletion);
  }, [baseHandleKeyDown, handleVariableBlockDeletion]);

  // 입력 핸들러
  const handleInputWithAutocomplete = useCallback((text: string) => {
    handleInput(text);
    handleInputChange(text);
  }, [handleInput, handleInputChange]);

  // 변수 삽입
  const insertVariable = useCallback((label: string) => {
    baseInsertVariable(label, getCursorOffset);
    setShowAutocomplete(false);
  }, [baseInsertVariable, setShowAutocomplete]);

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

  const inputHeight = editableRef.current?.getBoundingClientRect().height || 48;

  return (
    <div className="space-y-8 w-full">
      <ModeSelector mode={mode} onModeChange={setMode} />

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

      {mode === "formula" && (
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_auto_minmax(0,150px)] gap-3 items-center">
            <FormulaInput
              editableRef={editableRef}
              autocompleteRef={autocompleteRef}
              koreanFormula={koreanFormula}
              showAutocomplete={showAutocomplete}
              autocompleteOptions={autocompleteOptions}
              selectedAutocompleteIndex={selectedAutocompleteIndex}
              onInput={handleInputWithAutocomplete}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={handleKeyDown}
              onVariableSelect={(option) => insertVariable(option.label)}
              onUpdatePosition={updateAutocompletePosition}
              onBlur={(e) => {
                setTimeout(() => {
                  if (!autocompleteRef.current?.contains(e.relatedTarget as Node)) {
                    setShowAutocomplete(false);
                  }
                }, AUTOBLUR_DELAY_MS);
              }}
            />

            {koreanFormula && (
              <div className="flex items-center justify-center">
                <span className="text-[32px] font-bold text-[#191F28] tracking-[-0.02em]">
                  =
                </span>
              </div>
            )}

            {koreanFormula && (
              <PreviewCard
                result={calculatePreviewResult}
                fieldUnit={fieldUnit}
                inputHeight={inputHeight}
              />
            )}
          </div>

          <VariableTags koreanFormula={koreanFormula} field={field} />

          <VariableList
            field={field}
            onVariableClick={insertVariable}
          />
        </div>
      )}

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

