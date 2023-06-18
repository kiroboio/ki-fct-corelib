import util from "util";

import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { FCTMulticall } from "./FCTMulticall";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

describe("BatchMultiSigCall FCTMulticall", () => {
  let FCT: BatchMultiSigCall;
  before(async () => {
    FCT = new BatchMultiSigCall({
      chainId: "5",
    });
  });

  it("Should create a FCTMulticall", async () => {
    const Multicall = new FCTMulticall({
      from: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
    });

    Multicall.add({
      method: "transfer",
      callType: "action",
      target: USDC,
      params: [
        {
          name: "recipient",
          type: "address",
          value: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
        },
        {
          name: "amount",
          type: "uint256",
          value: "1000000000000000000",
        },
      ],
    });

    await FCT.create(Multicall);

    const fct = FCT.exportFCT();

    console.log(util.inspect(fct, false, null, true /* enable colors */));
  });
});

// 0x0000000000000000000000000000000000000000000000000000000000000020
//   0000000000000000000000000000000000000000000000000000000000000001
//   0000000000000000000000000000000000000000000000000000000000000020
//   000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
//   f66b632ae3b479ef109dee46eb319414289a8426a08b64d81aad232941f9d22a
//   b483afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e
//   0000000000000000000000000000000000000000000000000000000000000080
//   0000000000000000000000000000000000000000000000000000000000000040
//   0000000000000000000000003f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be
//   0000000000000000000000000000000000000000000000000de0b6b3a7640000
