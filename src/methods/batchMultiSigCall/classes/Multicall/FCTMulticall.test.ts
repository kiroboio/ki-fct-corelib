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
      callType: "ACTION",
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
