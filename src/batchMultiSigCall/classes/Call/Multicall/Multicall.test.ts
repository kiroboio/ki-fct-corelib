import { ethers } from "ethers";

import { BatchMultiSigCall } from "../../../batchMultiSigCall";
import { Multicall } from "./Multicall";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

describe("FCT Multicall", () => {
  let FCT: BatchMultiSigCall;
  let MCall: Multicall;

  beforeEach(async () => {
    FCT = new BatchMultiSigCall({
      chainId: "1",
    });
    MCall = new Multicall({
      FCT,
      from: createRandomAddress(),
    });
  });

  it("Should add call to multicall", async () => {
    MCall.add({
      method: "transfer",
      params: [
        {
          name: "to",
          type: "address",
          value: createRandomAddress(),
        },
        {
          name: "amount",
          type: "uint256",
          value: "100",
        },
      ],
      target: createRandomAddress(),
      callType: "action",
    });

    await FCT.add(MCall);

    const fct = FCT.exportFCT();
  });
});
