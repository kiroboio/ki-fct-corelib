import { expect } from "chai";
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
    const from = createRandomAddress();
    const to = createRandomAddress();
    const Call = await FCT.add({
      nodeId: "transfer",
      from,
      to,
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

    const fct = FCT.exportFCT();

    const txMessage = fct.typedData.message.transaction_1;

    expect(txMessage).to.eql({
      call: {
        call_index: 1,
        payer_index: 1,
        call_type: "action",
        from,
        to,
        to_ens: "",
        value: "0",
        gas_limit: "0",
        permissions: 0,
        validation: 0,
        flow_control: "continue on success, revert on fail",
        returned_false_means_fail: false,
        jump_on_success: 0,
        jump_on_fail: 0,
        method_interface: "transfer((uint256,(bool,uint64)),(bool,uint256))",
      },
      data: {
        value: "10",
        deepData: {
          doDeposit: true,
          timestamp: "123456789",
        },
      },
      object: {
        isTrue: true,
        int: "20",
      },
    });
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

  it("Should update the call after it is made", async () => {
    const Call = await FCT.add({
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

    Call.updateCall({
      method: "swapFrom",
    });

    expect(Call.get().method).to.eql("swapFrom");
  });
});
