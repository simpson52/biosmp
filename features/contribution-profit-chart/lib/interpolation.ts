import type { PlantRowInput } from "@/types";

/**
 * 93MW와 80MW 사이의 값을 보간
 */
export function interpolateBetween93And80(
  output: number,
  input93: PlantRowInput,
  input80: PlantRowInput
): PlantRowInput {
  const ratio = (93 - output) / (93 - 80);
  return {
    transmissionEfficiency:
      input93.transmissionEfficiency * (1 - ratio) +
      input80.transmissionEfficiency * ratio,
    internalConsumptionRate:
      input93.internalConsumptionRate * (1 - ratio) +
      input80.internalConsumptionRate * ratio,
  };
}

/**
 * 80MW와 65MW 사이의 값을 보간
 */
export function interpolateBetween80And65(
  output: number,
  input80: PlantRowInput,
  input65: PlantRowInput
): PlantRowInput {
  const ratio = (80 - output) / (80 - 65);
  return {
    transmissionEfficiency:
      input80.transmissionEfficiency * (1 - ratio) +
      input65.transmissionEfficiency * ratio,
    internalConsumptionRate:
      input80.internalConsumptionRate * (1 - ratio) +
      input65.internalConsumptionRate * ratio,
  };
}

/**
 * 특정 출력 레벨에 대한 입력값 보간
 */
export function getInterpolatedInput(
  output: number,
  plantRowInputs: Record<93 | 80 | 65, PlantRowInput>
): PlantRowInput {
  if (output === 93) {
    return plantRowInputs[93];
  }
  if (output === 80) {
    return plantRowInputs[80];
  }
  if (output === 65) {
    return plantRowInputs[65];
  }
  if (output > 80 && output < 93) {
    return interpolateBetween93And80(output, plantRowInputs[93], plantRowInputs[80]);
  }
  if (output > 65 && output < 80) {
    return interpolateBetween80And65(output, plantRowInputs[80], plantRowInputs[65]);
  }
  if (output > 93) {
    return plantRowInputs[93];
  }
  return plantRowInputs[65];
}

