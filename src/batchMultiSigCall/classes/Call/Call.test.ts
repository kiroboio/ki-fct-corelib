import { ethers } from "ethers";

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

    console.log(Call.get);

    const fct = FCT.exportFCT();
  });

  it("Should add a call", async () => {
    await FCT.create({
      nodeId: "node1",
      to: createRandomAddress(),
      toENS: "@token.kiro.eth",
      method: "transfer",
      params: [
        { name: "to", type: "address", value: createRandomAddress() },
        { name: "token_amount", type: "uint256", value: "20" },
      ],
      from: createRandomAddress(),
      value: "0",
    });

    await FCT.create({
      nodeId: "node2",
      to: createRandomAddress(),
      method: "erc20Airdrop",
      params: [
        { name: "token", type: "address", value: createRandomAddress() },
        { name: "from", type: "address", value: createRandomAddress() },
        { name: "amount", type: "uint256", value: "100" },
        { name: "recipients", type: "address[]", value: [createRandomAddress(), createRandomAddress()] },
      ],
      from: createRandomAddress(),
    });

    const fct = FCT.exportFCT();
  });
});
