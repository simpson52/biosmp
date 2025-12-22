import { useState, useEffect, useMemo } from "react";
import type { CalculationMode } from "@/types";
import { parseSimpleFormula } from "../lib/formula-parser";
import type { CalculationStep, CalculationMethod, OperationType } from "../types";

interface UseIntuitiveEditorProps {
  currentMode?: CalculationMode;
  currentFormula?: string;
  currentFixedValue?: number;
  field: string;
}

export function useIntuitiveEditor({
  currentMode,
  currentFormula,
  currentFixedValue,
  field,
}: UseIntuitiveEditorProps) {
  const [step, setStep] = useState<CalculationStep>("method");
  
  const getInitialMethod = (): CalculationMethod => {
    if (currentMode === "fixed") return "fixed";
    if (currentFormula) return "reference";
    return "reference";
  };
  
  const [method, setMethod] = useState<CalculationMethod>(getInitialMethod());
  const [referenceVariable, setReferenceVariable] = useState<string>("");
  const [operation, setOperation] = useState<OperationType>("same");
  const [coefficient, setCoefficient] = useState<string>("1");
  const [fixedValue, setFixedValue] = useState<string>(
    currentFixedValue?.toString() || "0"
  );

  // 현재 설정을 파싱하여 초기값 설정
  useEffect(() => {
    if (currentFormula && currentMode === "formula") {
      const parsed = parseSimpleFormula(currentFormula);
      if (parsed) {
        setReferenceVariable(parsed.referenceVariable);
        setOperation(parsed.operation);
        setCoefficient(parsed.coefficient);
      }
    }
  }, [currentFormula, currentMode]);

  const handleNext = () => {
    if (step === "method") {
      if (method === "fixed") {
        setStep("fixed");
      } else if (method === "reference") {
        setStep("reference");
      } else {
        setStep("review");
      }
    } else if (step === "reference") {
      if (referenceVariable) {
        setStep("operation");
      }
    } else if (step === "operation") {
      if (operation === "same") {
        setStep("review");
      } else {
        setStep("coefficient");
      }
    } else if (step === "coefficient" || step === "fixed") {
      setStep("review");
    }
  };

  const handleBack = () => {
    if (step === "reference") {
      setStep("method");
    } else if (step === "operation") {
      setStep("reference");
    } else if (step === "coefficient") {
      setStep("operation");
    } else if (step === "fixed") {
      setStep("method");
    } else if (step === "review") {
      if (method === "fixed") {
        setStep("fixed");
      } else if (operation === "same") {
        setStep("operation");
      } else {
        setStep("coefficient");
      }
    }
  };

  const canProceed = (): boolean => {
    if (step === "method") return method !== undefined;
    if (step === "reference") return referenceVariable !== "";
    if (step === "operation") return operation !== undefined;
    if (step === "coefficient") {
      const num = Number.parseFloat(coefficient);
      return !Number.isNaN(num) && num !== 0;
    }
    if (step === "fixed") {
      const num = Number.parseFloat(fixedValue);
      return !Number.isNaN(num);
    }
    return true;
  };

  return {
    step,
    setStep,
    method,
    setMethod,
    referenceVariable,
    setReferenceVariable,
    operation,
    setOperation,
    coefficient,
    setCoefficient,
    fixedValue,
    setFixedValue,
    handleNext,
    handleBack,
    canProceed,
  };
}

