import {
  BackOutputVariableBaseAddress,
  BackOutputVariableBaseBytes32,
  ComputedBaseAddress,
  ComputedBaseBytes32,
  ExternalVariableBaseAddress,
  ExternalVariableBaseBytes32,
  OutputVariableBaseAddress,
  OutputVariableBaseBytes32,
} from "../constants";
import { InstanceOf } from "../helpers";
import { ParamValue } from "../types";
import { globalVariables, globalVariablesBytes } from "./globalVariables";

type IsComputedVariableInput =
  | {
      strict: true;
      value: ParamValue;
      id: string;
      index: number;
    }
  | {
      strict: boolean;
      value: ParamValue;
      id?: string;
      index?: number;
    };

export function isExternalVariable(value: ParamValue) {
  if (InstanceOf.Variable(value)) {
    return value.type === "external";
  }

  if (typeof value === "string" && (value.length === 42 || value.length === 66)) {
    const hexString = value.toLowerCase();
    const base =
      value.length === 42 ? ExternalVariableBaseAddress.toLowerCase() : ExternalVariableBaseBytes32.toLowerCase();

    return hexString.slice(0, -4) === base.slice(0, -4);
  }

  return false;
}

export function isComputedVariable({ value, id, index, strict = false }: IsComputedVariableInput) {
  if (InstanceOf.Variable(value)) {
    const idCheck = id ? value.id === id : true;
    return value.type === "computed" && idCheck;
  }

  if (typeof value === "string" && (value.length === 42 || value.length === 66)) {
    const hexString = value.toLowerCase();
    const base = value.length === 42 ? ComputedBaseAddress.toLowerCase() : ComputedBaseBytes32.toLowerCase();

    if (hexString.slice(0, -4) === base.slice(0, -4)) {
      if (!strict) return true;
      const parsedIndex = parseInt(hexString.slice(-4), 16).toString();
      return parsedIndex === ((index as number) + 1).toString();
    }
  }

  return false;
}

export function isOutputVariable({
  value,
  index,
  strict = false,
}: {
  value: ParamValue;
  index: number;
  strict?: boolean;
}) {
  if (InstanceOf.Variable(value)) {
    return value.type === "output";
  }

  if (typeof value === "string" && (value.length === 42 || value.length === 66)) {
    const hexString = value.toLowerCase();
    const base =
      value.length === 42 ? OutputVariableBaseAddress.toLowerCase() : OutputVariableBaseBytes32.toLowerCase();
    const backBase =
      value.length === 42 ? BackOutputVariableBaseAddress.toLowerCase() : BackOutputVariableBaseBytes32.toLowerCase();

    if (hexString.slice(0, -8) === base.slice(0, -8)) {
      if (!strict) return true;
      const parsedIndex = parseInt(hexString.slice(-4), 16).toString();
      return parsedIndex === (index + 1).toString();
    }

    if (hexString.slice(0, -8) === backBase.slice(0, -8)) {
      console.log("here", hexString, backBase);
      if (!strict) return true;
      const parsedIndex = parseInt(hexString.slice(-4), 16).toString();
      return parsedIndex === (index + 1).toString();
    }
  }

  return false;
}

export function isGlobalVariable(value: ParamValue) {
  if (InstanceOf.Variable(value)) {
    return value.type === "global";
  }

  if (typeof value === "string" && (value.length === 42 || value.length === 66)) {
    if (value.length === 42) {
      const setOfGlobalVars = Object.values(globalVariables);
      const valHexString = value.toLowerCase();

      return setOfGlobalVars.some((variable) => variable.toLowerCase().slice(0, -4) === valHexString.slice(0, -4));
    } else {
      const setOfGlobalVars = Object.values(globalVariablesBytes);
      const valHexString = value.toLowerCase();

      return setOfGlobalVars.some((variable) => variable.toLowerCase().slice(0, -4) === valHexString.slice(0, -4));
    }
  }

  return false;
}

export function isConstantVariable(value: ParamValue) {
  if (InstanceOf.Variable(value)) {
    return value.type === "constants";
  }
}
