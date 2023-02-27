import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { BigNumber, ethers } from "ethers";

import { MethodParamsInterface, Param } from "../../types";
import { TypedDataDomain } from "../types";

// const getSaltBuffer = (salt: string) => new Uint8Array(Buffer.from(salt.slice(2), "hex"));

// TODO: Change salt to be a buffer
export const TYPED_DATA_DOMAIN: Record<ChainId, TypedDataDomain> = {
  "1": {
    name: "FCT Controller",
    version: "1",
    chainId: 5,
    verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
    salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
  },
  "5": {
    name: "FCT Controller",
    version: "1",
    chainId: 5,
    verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
    salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
  },
};

export const getTypedDataDomain = (chainId: ChainId) => {
  return TYPED_DATA_DOMAIN[chainId];
};

export const generateTxType = (item: Partial<MethodParamsInterface>): { name: string; type: string }[] => {
  const defaults = [{ name: "details", type: "Transaction_" }];

  if (item.params) {
    const types = item.params.reduce((acc, param) => {
      return [...acc, { name: param.name, type: param.type }];
    }, [] as { name: string; type: string }[]);

    return [...defaults, ...types];
  }

  return [{ name: "details", type: "Transaction_" }];
};

export const getParamsFromInputs = (inputs: ethers.utils.ParamType[], values: ethers.utils.Result): Param[] => {
  return inputs.map((input, i) => {
    if (input.type === "tuple") {
      return {
        name: input.name,
        type: input.type,
        customType: true,
        value: getParamsFromInputs(input.components, values[i]),
      };
    }
    if (input.type === "tuple[]") {
      return {
        name: input.name,
        type: input.type,
        customType: true,
        value: values[i].map((tuple: ethers.utils.Result) => getParamsFromInputs(input.components, tuple)),
      };
    }
    let value = values[i];
    // Check if value isn't a variable
    const variables = ["0xfb0", "0xfa0", "0xfc00000", "0xfd00000", "0xfdb000"];

    if (BigNumber.isBigNumber(value)) {
      const hexString = value.toHexString().toLowerCase();
      if (variables.some((v) => hexString.startsWith(v))) {
        value = hexString;
      }
      value = value.toString();
    }

    return {
      name: input.name,
      type: input.type,
      value,
    };
  });
};
