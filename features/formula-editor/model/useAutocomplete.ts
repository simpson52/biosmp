import { useState, useMemo, useCallback } from "react";
import { AVAILABLE_VARIABLES } from "@/lib/variable-mapper";
import type { AutocompleteOption } from "../types";
import { MAX_AUTOCOMPLETE_OPTIONS } from "../constants";

interface UseAutocompleteProps {
  field: string;
  koreanFormula: string;
  insertVariable: (label: string) => void;
}

export function useAutocomplete({ field, koreanFormula, insertVariable }: UseAutocompleteProps) {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState("");
  const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(0);

  // 자동완성 필터링
  const autocompleteOptions = useMemo(() => {
    if (!autocompleteQuery) return [];
    
    const query = autocompleteQuery.toLowerCase();
    const options: AutocompleteOption[] = [];
    
    for (const [code, info] of Object.entries(AVAILABLE_VARIABLES)) {
      if (code === field) continue; // 자기 자신 제외
      
      const labelLower = info.label.toLowerCase();
      const descLower = info.description.toLowerCase();
      
      if (labelLower.includes(query) || descLower.includes(query) || code.toLowerCase().includes(query)) {
        options.push({ code, label: info.label, description: info.description });
      }
    }
    
    return options.slice(0, MAX_AUTOCOMPLETE_OPTIONS);
  }, [autocompleteQuery, field]);

  // 입력 필드에서 자동완성 처리
  const handleInputChange = useCallback((value: string) => {
    // 마지막 한글 단어 추출 (공백, 연산자 기준)
    const lastWordRegex = /[\uAC00-\uD7A3]+$/;
    const lastWordMatch = lastWordRegex.exec(value);
    if (lastWordMatch) {
      const lastWord = lastWordMatch[0];
      // 최소 1글자 이상일 때만 자동완성 표시
      if (lastWord.length >= 1) {
        setAutocompleteQuery(lastWord);
        
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

  // 자동완성 드롭다운 위치 업데이트
  const updateAutocompletePosition = useCallback(() => {
    // 드롭다운이 입력 필드 바로 아래에 상대적으로 배치되므로 별도 위치 계산 불필요
    // 필요시 여기에 추가 로직 구현 가능
  }, []);

  // 키보드 이벤트 처리
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, handleVariableBlockDeletion: (e: React.KeyboardEvent<HTMLDivElement>) => boolean) => {
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
  }, [showAutocomplete, autocompleteOptions, selectedAutocompleteIndex, insertVariable]);

  return {
    showAutocomplete,
    setShowAutocomplete,
    autocompleteQuery,
    selectedAutocompleteIndex,
    setSelectedAutocompleteIndex,
    autocompleteOptions,
    handleInputChange,
    updateAutocompletePosition,
    handleKeyDown,
  };
}

