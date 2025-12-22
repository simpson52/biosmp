"use client";

import { useState } from "react";
import { ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CalculationMode } from "@/types";
import { useIntuitiveEditor } from "../model/useIntuitiveEditor";
import { MethodStep } from "./MethodStep";
import { ReferenceStep } from "./ReferenceStep";
import { OperationStep } from "./OperationStep";
import { CoefficientStep } from "./CoefficientStep";
import { FixedStep } from "./FixedStep";
import { ReviewStep } from "./ReviewStep";
import { StepIndicator } from "./StepIndicator";
import type { IntuitiveFormulaEditorProps } from "../types";

export function IntuitiveFormulaEditor({
  field,
  fieldLabel,
  fieldUnit,
  currentMode,
  currentFormula,
  currentFixedValue,
  onSave,
  onCancel,
}: IntuitiveFormulaEditorProps) {
  const {
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
  } = useIntuitiveEditor({
    currentMode,
    currentFormula,
    currentFixedValue,
    field,
  });

  const handleSave = () => {
    if (method === "fixed") {
      const numValue = Number.parseFloat(fixedValue);
      if (!Number.isNaN(numValue)) {
        onSave("fixed", "", numValue);
      }
    } else if (method === "reference" && referenceVariable) {
      let formula = referenceVariable;
      if (operation === "multiply") {
        formula = `${referenceVariable} * ${coefficient}`;
      } else if (operation === "divide") {
        formula = `${referenceVariable} / ${coefficient}`;
      } else if (operation === "add") {
        formula = `${referenceVariable} + ${coefficient}`;
      } else if (operation === "subtract") {
        formula = `${referenceVariable} - ${coefficient}`;
      }
      onSave("formula", formula, 0);
    }
  };

  const handleMethodSelect = (selectedMethod: "fixed" | "reference" | "formula") => {
    setMethod(selectedMethod);
    if (selectedMethod === "fixed") {
      setTimeout(() => setStep("fixed"), 100);
    } else if (selectedMethod === "reference") {
      setTimeout(() => setStep("reference"), 100);
    } else {
      setTimeout(() => setStep("review"), 100);
    }
  };

  const handleVariableSelect = (code: string) => {
    setReferenceVariable(code);
    setTimeout(() => setStep("operation"), 200);
  };

  const handleOperationSelect = (selectedOperation: typeof operation) => {
    setOperation(selectedOperation);
    if (selectedOperation === "same") {
      setTimeout(() => setStep("review"), 200);
    } else {
      setTimeout(() => setStep("coefficient"), 200);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <StepIndicator step={step} method={method} operation={operation} />

      <div className="min-h-[300px]">
        {step === "method" && (
          <MethodStep
            fieldLabel={fieldLabel}
            method={method}
            onMethodSelect={handleMethodSelect}
          />
        )}

        {step === "reference" && (
          <ReferenceStep
            field={field}
            fieldLabel={fieldLabel}
            referenceVariable={referenceVariable}
            onVariableSelect={handleVariableSelect}
          />
        )}

        {step === "operation" && referenceVariable && (
          <OperationStep
            referenceVariable={referenceVariable}
            operation={operation}
            onOperationSelect={handleOperationSelect}
          />
        )}

        {step === "coefficient" && (
          <CoefficientStep
            referenceVariable={referenceVariable}
            operation={operation}
            coefficient={coefficient}
            onCoefficientChange={setCoefficient}
          />
        )}

        {step === "fixed" && (
          <FixedStep
            fieldLabel={fieldLabel}
            fieldUnit={fieldUnit}
            fixedValue={fixedValue}
            onFixedValueChange={setFixedValue}
          />
        )}

        {step === "review" && (
          <ReviewStep
            fieldLabel={fieldLabel}
            fieldUnit={fieldUnit}
            method={method}
            fixedValue={fixedValue}
            referenceVariable={referenceVariable}
            operation={operation}
            coefficient={coefficient}
          />
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={step === "method" ? onCancel : handleBack}
          className="flex items-center gap-2"
        >
          {step === "method" ? (
            <>
              <X className="h-4 w-4" />
              취소
            </>
          ) : (
            <>← 이전</>
          )}
        </Button>
        {step !== "review" && (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        {step === "review" && (
          <Button
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            저장
          </Button>
        )}
      </div>
    </div>
  );
}

