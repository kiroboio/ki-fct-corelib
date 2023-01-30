import { ChainId } from "../batchMultiSigCall/batchMultiSigCall";
import { MethodParamsInterface } from "../types";
import { getValidatorFunctionData } from "./validator";

const TYPED_DATA_DOMAIN = {
  "1": {
    name: "FCT Controller",
    version: "1",
    chainId: 1,
    verifyingContract: "0x087550a787B2720AAC06351065afC1F413D82572",
    salt: "0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572",
  },
  "5": {
    name: "FCT Controller",
    version: "1",
    chainId: 5,
    verifyingContract: "0x087550a787B2720AAC06351065afC1F413D82572",
    salt: "0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572",
  },
};

export const getTypedDataDomain = (chainId: ChainId) => {
  return TYPED_DATA_DOMAIN[chainId];
};

export const generateTxType = (item: Partial<MethodParamsInterface>): { name: string; type: string }[] => {
  const defaults = [{ name: "details", type: "Transaction_" }];

  if (item.params) {
    if (item.validator) {
      return [{ name: "details", type: "Transaction_" }, ...getValidatorFunctionData(item.validator, item.params)];
    }
    const types = item.params.reduce((acc, param) => {
      return [...acc, { name: param.name, type: param.type }];
    }, [] as { name: string; type: string }[]);

    return [...defaults, ...types];
  }

  return [{ name: "details", type: "Transaction_" }];
};
