import { IFCTOptions } from "@types";
import { assert } from "chai";

import { BatchMultiSigCall } from "../batchMultiSigCall";

const FCT = new BatchMultiSigCall({
  chainId: "5",
});

const catchError = ({ param, message }: { param: Partial<IFCTOptions>; message: string }) => {
  assert.throws(() => FCT.setOptions(param), message);
};

describe("FCT Options", () => {
  it("Should get error when setting builder", async () => {
    catchError({
      param: { builder: "0x-" },
      message: "Options: builder is not a valid address",
    });
  });
  it("Should get error setting validFrom", () => {
    catchError({
      param: { validFrom: "0.2" },
      message: "Options: validFrom cannot be a decimal",
    });
    catchError({
      param: { validFrom: "-2" },
      message: "Options: validFrom cannot be negative",
    });
  });
  it("Should get error setting expiresAt", () => {
    catchError({
      param: { expiresAt: "0.2" },
      message: "Options: expiresAt cannot be a decimal",
    });
    catchError({
      param: { expiresAt: "-2" },
      message: "Options: expiresAt cannot be negative",
    });
    catchError({
      param: { expiresAt: "0" },
      message: "Options: expiresAt must be in the future",
    });
    catchError({
      param: { expiresAt: "999999999999", validFrom: "9999999999999" },
      message: "Options: expiresAt must be greater than validFrom",
    });
  });
  it("Should get error setting maxGasPrice", () => {
    catchError({
      param: { maxGasPrice: "0.2" },
      message: "Options: maxGasPrice cannot be a decimal",
    });
    catchError({
      param: { maxGasPrice: "-2" },
      message: "Options: maxGasPrice cannot be negative",
    });
  });
  it("Should get error setting recurrency", () => {
    catchError({
      param: { recurrency: { chillTime: "0.2" } },
      message: "Options: recurrency.chillTime cannot be a decimal",
    });
    catchError({
      param: { recurrency: { chillTime: "-2" } },
      message: "Options: recurrency.chillTime cannot be negative",
    });
    catchError({
      param: { recurrency: { maxRepeats: "0.2" } },
      message: "Options: recurrency.maxRepeats cannot be a decimal",
    });
    catchError({
      param: { recurrency: { maxRepeats: "-2" } },
      message: "Options: recurrency.maxRepeats cannot be negative",
    });
    catchError({
      param: { recurrency: { maxRepeats: "1" } },
      message: "Options: recurrency.maxRepeats should be at least 2",
    });
  });
});
