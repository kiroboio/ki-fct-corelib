import { ethers } from "ethers";

const isAddress = ethers.utils.isAddress;

export const mustBeInteger = ["validFrom", "expiresAt", "maxGasPrice", "maxRepeats", "chillTime", "minimumApprovals"];
export const mustBeAddress = ["builder"];

// Validate Integer values in options
export const validateInteger = (value: string, keys: string[]) => {
  const currentKey = keys[keys.length - 1];

  if (value.includes(".")) {
    throw new Error(`Options: ${keys.join(".")} cannot be a decimal`);
  }
  if (value.startsWith("-")) {
    throw new Error(`Options: ${keys.join(".")} cannot be negative`);
  }
  if (currentKey === "maxRepeats" && Number(value) < 0) {
    throw new Error(
      `Options: ${keys.join(
        "."
      )} should be at least 0. If value is 0 or 1, recurrency will not be enabled in order to save gas`
    );
  }
};

// Validate address values in options
export const validateAddress = (value: string, keys: string[]) => {
  if (!isAddress(value)) {
    throw new Error(`Options: ${keys.join(".")} is not a valid address`);
  }
};
