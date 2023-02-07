import { IFCTOptions } from "@types";

const mustBeInteger = ["validFrom", "expiresAt", "maxGasPrice", "maxRepeats", "chillTime"];
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

const validateValues = (value: object, parentKeys: string[] = []) => {
  Object.keys(value).forEach((key) => {
    const objKey = key as keyof typeof value;
    if (typeof value[objKey] === "object") {
      validateValues(value[objKey], [...parentKeys, objKey]);
    } else if (mustBeInteger.includes(objKey)) {
      validateInteger(value[objKey] as string, [...parentKeys, objKey]);
    }
  });
};

export const verifyOptions = (options: IFCTOptions) => {
  validateValues(options);
};
