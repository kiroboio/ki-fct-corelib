import { ethers } from "ethers";

const isAddress = ethers.utils.isAddress;

export const mustBeInteger = [
  "validFrom",
  "expiresAt",
  "maxGasPrice",
  "recurrency.maxRepeats",
  "recurrency.chillTime",
  "multisig.minimumApprovals",
];
export const mustBeAddress = ["builder.address"];
export const mustBeBoolean = ["purgeable", "blockable", "authEnabled", "dryRun", "recurrency.accumetable"];

export const mustBeObject = ["app", "builder", "recurrency", "multisig"];

// Validate Integer values in options
export const validateInteger = (value: string, id: string) => {
  if (value.includes(".")) {
    throw new Error(`Options: ${id} cannot be a decimal`);
  }
  if (value.startsWith("-")) {
    throw new Error(`Options: ${id} cannot be negative`);
  }
  if (id === "recurrency.maxRepeats" && +value < 0) {
    throw new Error(
      `Options: ${id} should be at least 0. If value is 0 or 1, recurrency will not be enabled in order to save gas`
    );
  }
};

// Validate address values in options
export const validateAddress = (value: string, id: string) => {
  if (!isAddress(value)) {
    throw new Error(`Options: ${id} is not a valid address`);
  }
};
