import { Contract } from "ethers";

import { MethodParamsInterface } from "../types";
import { getValidatorFunctionData } from "./validator";

// Get Typed Data domain for EIP712
export const getTypedDataDomain = async (
  factoryProxy: Contract
): Promise<{
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
  salt: string;
}> => {
  try {
    const chainId = await factoryProxy.CHAIN_ID();
    return {
      name: await factoryProxy.NAME(),
      version: await factoryProxy.VERSION(),
      chainId: chainId.toNumber(),
      verifyingContract: factoryProxy.address,
      salt: await factoryProxy.UID(),
    };
  } catch (e) {
    throw new Error(`Error getting typed data domain: ${e.message}`);
  }
};

export const generateTxType = (item: Partial<MethodParamsInterface>): { name: string; type: string }[] => {
  const defaults = [{ name: "details", type: "Transaction_" }];

  if (item.params) {
    if (item.validator) {
      return [{ name: "details", type: "Transaction_" }, ...getValidatorFunctionData(item.validator, item.params)];
    }
    const types = item.params.reduce((acc, param) => {
      return [...acc, { name: param.name, type: param.type }];
    }, []);

    return [...defaults, ...types];
  }

  return [{ name: "details", type: "Transaction_" }];
};
