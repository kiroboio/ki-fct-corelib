import { assert } from "chai";
import _ from "lodash";

import { BatchMultiSigCall } from "../batchMultiSigCall";
import { IMSCallInput } from "../types";

const FCT = new BatchMultiSigCall({
  chainId: "5",
});

const defaultCall: IMSCallInput = {
  from: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  method: "swap",
  to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  params: [
    {
      name: "amount",
      type: "uint256",
      value: "12",
      customType: false,
      hashed: false,
    },
  ],
};

const getCall = (call: Partial<IMSCallInput>) => _.merge({}, defaultCall, call);

const catchError = async ({ call, message }: { call: IMSCallInput; message: string }) => {
  try {
    await FCT.create(call);
  } catch (err) {
    if (err instanceof Error) {
      assert.equal(err.message, message);
    }
    return;
  }
};

describe("FCT Create Call Errors", () => {
  it(`Should get error from "to" address`, async () => {
    await catchError({
      call: getCall({ to: "" }),
      message: "To address is required",
    });

    await catchError({
      call: getCall({ to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F24yay" }), // Faulty address
      message: "To address is not a valid address",
    });
  });
  it(`Should get error from "from" address`, async () => {
    await catchError({
      call: getCall({ from: "" }),
      message: "From address is required",
    });

    await catchError({
      call: getCall({ from: "0x7a250d5630B4cF539739dF2C5dAcb4c659F24yay" }), // Faulty address
      message: "From address is not a valid address",
    });
  });
  it(`Should get error from "value"`, async () => {
    await catchError({
      call: getCall({ value: "-1" }),
      message: "Value cannot be negative",
    });

    await catchError({
      call: getCall({ value: "0.2" }),
      message: "Value cannot be a decimal",
    });
  });
  it(`Should get error from "options.gasLimit"`, async () => {
    await catchError({
      call: getCall({ options: { gasLimit: "-1" } }),
      message: "Gas limit cannot be negative",
    });

    await catchError({
      call: getCall({ options: { gasLimit: "0.2" } }),
      message: "Gas limit cannot be a decimal",
    });
  });
  it(`Should get error from "method"`, async () => {
    await catchError({
      call: getCall({ method: "" }),
      message: "Method is required when params are present",
    });
  });
  it(`Should get error from "params"`, async () => {
    await catchError({
      call: getCall({
        params: [
          {
            name: "amount",
            type: "uint256",
            value: "",
          },
        ],
      }),
      message: "Param amount is missing a value",
    });

    await catchError({
      call: getCall({
        params: [
          {
            name: "amount",
            type: "uint256",
            value: "-2",
          },
        ],
      }),
      message: "Param amount cannot be negative",
    });

    await catchError({
      call: getCall({
        params: [
          {
            name: "amount",
            type: "uint256",
            value: "0.2",
          },
        ],
      }),
      message: "Param amount cannot be a decimal",
    });

    await catchError({
      call: getCall({
        params: [
          {
            name: "intAmount",
            type: "int128",
            value: "0.2",
          },
        ],
      }),
      message: "Param intAmount cannot be a decimal",
    });

    await catchError({
      call: getCall({
        params: [
          {
            name: "addressValue",
            type: "address",
            value: "0x12",
          },
        ],
      }),
      message: "Param addressValue is not a valid address",
    });

    await catchError({
      call: getCall({
        params: [
          {
            name: "bytesValue",
            type: "bytes32",
            value: "d0x12",
          },
        ],
      }),
      message: "Param bytesValue is not a valid bytes value",
    });
  });
});
