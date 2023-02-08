import { IFCTOptions } from "@types";
import BigNumber from "bignumber.js";
import { isAddress } from "ethers/lib/utils";

const mustBeInteger = ["validFrom", "expiresAt", "maxGasPrice", "maxRepeats", "chillTime", "minimumApprovals"];
const mustBeAddress = ["builder"];

// Validate Integer values in options
const validateInteger = (value: string, keys: string[]) => {
  const currentKey = keys[keys.length - 1];
  if (value.includes(".")) {
    throw new Error(`Options: ${keys.join(".")} cannot be a decimal`);
  }
  if (value.includes("-")) {
    throw new Error(`Options: ${keys.join(".")} cannot be negative`);
  }
  if (currentKey === "maxRepeats" && Number(value) < 2) {
    throw new Error(`Options: ${keys.join(".")} should be at least 2`);
  }
};

// Validate address values in options
const validateAddress = (value: string, keys: string[]) => {
  if (!isAddress(value)) {
    throw new Error(`Options: ${keys.join(".")} is not a valid address`);
  }
};

const validateOptionsValues = (
  value: Partial<IFCTOptions> | IFCTOptions["recurrency"] | IFCTOptions["multisig"],
  parentKeys: string[] = []
) => {
  if (!value) {
    return;
  }
  Object.keys(value).forEach((key) => {
    const objKey = key as keyof typeof value;
    if (typeof value[objKey] === "object") {
      validateOptionsValues(value[objKey], [...parentKeys, objKey]);
    }
    // Integer validator
    if (mustBeInteger.includes(objKey)) {
      validateInteger(value[objKey] as string, [...parentKeys, objKey]);
    }
    // Address validator
    if (mustBeAddress.includes(objKey)) {
      validateAddress(value[objKey] as string, [...parentKeys, objKey]);
    }
    if (objKey === "expiresAt") {
      const expiresAt = Number(value[objKey]);
      const now = Number(new Date().getTime() / 1000).toFixed();
      const validFrom = (value as IFCTOptions).validFrom;
      if (BigNumber(expiresAt).isLessThanOrEqualTo(now)) {
        throw new Error(`Options: expiresAt must be in the future`);
      }
      if (validFrom && BigNumber(expiresAt).isLessThanOrEqualTo(validFrom)) {
        throw new Error(`Options: expiresAt must be greater than validFrom`);
      }
    }
  });
};

export const verifyOptions = (options: Partial<IFCTOptions>) => {
  validateOptionsValues(options);
};
