import { ethers } from "ethers";
import util from "util";

import { BatchMultiSigCall } from "../../batchMultiSigCall";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

describe("Call", () => {
  let FCT: BatchMultiSigCall;

  beforeEach(async () => {
    FCT = new BatchMultiSigCall({
      chainId: "1",
    });
  });

  it("Should do call", async () => {
    const Call = await FCT.add({
      nodeId: "transfer",
      from: createRandomAddress(),
      to: createRandomAddress(),
      method: "transfer",
      params: [
        {
          name: "data",
          type: "tuple",
          customType: true,
          value: [
            {
              name: "value",
              type: "uint256",
              value: "10",
            },
            {
              name: "deepData",
              type: "tuple",
              customType: true,
              value: [
                {
                  name: "doDeposit",
                  type: "bool",
                  value: true,
                },
                {
                  name: "timestamp",
                  type: "uint64",
                  value: "123456789",
                },
              ],
            },
          ],
        },
        {
          name: "object",
          type: "tuple",
          customType: true,
          value: [
            {
              name: "isTrue",
              type: "bool",
              value: true,
            },
            {
              name: "int",
              type: "uint256",
              value: "20",
            },
          ],
        },
      ],
    });

    // console.log(util.inspect(Call.generateEIP712Type(), false, null, true /* enable colors */));

    const fct = FCT.exportFCT();

    console.log(util.inspect(fct, false, null, true /* enable colors */));
  });
});
