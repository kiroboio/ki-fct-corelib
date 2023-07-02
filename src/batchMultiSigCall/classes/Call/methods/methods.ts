import { InstanceOf } from "../../../../helpers";
import { Param, ParamWithoutVariable } from "../../../../types";
import { NO_JUMP } from "../../../constants";
import { ICall } from "../types";

export function getJumps(this: ICall, index: number) {
  let jumpOnSuccess = 0;
  let jumpOnFail = 0;
  const call = this.data;
  const FCT = this.FCT;
  const options = call.options;

  if (options.jumpOnSuccess && options.jumpOnSuccess !== NO_JUMP) {
    const jumpOnSuccessIndex = FCT.callsAsObjects.findIndex((c) => c.nodeId === options.jumpOnSuccess);

    if (jumpOnSuccessIndex === -1) {
      throw new Error(`Jump on success node id ${options.jumpOnSuccess} not found`);
    }

    if (jumpOnSuccessIndex <= index) {
      throw new Error(
        `Jump on success node id ${options.jumpOnSuccess} is current or before current node (${call.nodeId})`
      );
    }

    jumpOnSuccess = jumpOnSuccessIndex - index - 1;
  }

  if (options.jumpOnFail && options.jumpOnFail !== NO_JUMP) {
    const jumpOnFailIndex = FCT.callsAsObjects.findIndex((c) => c.nodeId === options.jumpOnFail);

    if (jumpOnFailIndex === -1) {
      throw new Error(`Jump on fail node id ${options.jumpOnFail} not found`);
    }

    if (jumpOnFailIndex <= index) {
      throw new Error(`Jump on fail node id ${options.jumpOnFail} is current or before current node (${call.nodeId})`);
    }

    jumpOnFail = jumpOnFailIndex - index - 1;
  }

  return {
    jumpOnSuccess,
    jumpOnFail,
  };
}

export function getUsedStructTypes(
  this: ICall,
  typedData: Record<string, { name: string; type: string }[]>,
  mainType: { name: string; type: string }[]
): string[] {
  return mainType.reduce((acc, item) => {
    if (item.type.includes("Struct_")) {
      const type = item.type.replace("[]", "");
      return [...acc, type, ...getUsedStructTypes.call(this, typedData, typedData[type])];
    }
    return acc;
  }, [] as string[]);
}

export function decodeParams(this: ICall, params: Param[]): ParamWithoutVariable<Param>[] {
  return params.reduce((acc, param) => {
    if (param.type === "tuple" || param.customType) {
      if (param.type.lastIndexOf("[") > 0) {
        const value = param.value as Param[][];
        const decodedValue = value.map((tuple) => decodeParams.call(this, tuple));
        return [...acc, { ...param, value: decodedValue }];
      }

      const value = decodeParams.call(this, param.value as Param[]);
      return [...acc, { ...param, value }];
    }
    if (InstanceOf.Variable(param.value)) {
      const value = this.FCT.variables.getVariable(param.value, param.type);
      const updatedParam = { ...param, value };
      return [...acc, updatedParam];
    }
    return [...acc, param as ParamWithoutVariable<Param>];
  }, [] as ParamWithoutVariable<Param>[]);
}
