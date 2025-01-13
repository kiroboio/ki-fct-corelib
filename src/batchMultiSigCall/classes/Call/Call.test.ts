import { expect } from "chai";
import { ethers } from "ethers";

import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { Call } from "./Call";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

describe("Call", () => {
  let FCT: BatchMultiSigCall;

  beforeEach(async () => {
    FCT = new BatchMultiSigCall({
      chainId: "1",
    });
  });

  it("Should add a call to FCT", async () => {
    const from = createRandomAddress();
    const to = createRandomAddress();
    await FCT.add({
      nodeId: "transfer",
      from,
      to,
      method: "transfer",
      params: [
        {
          name: "list",
          type: "uint256[]",
          // @ts-expect-error: valid primitive list
          value: [1, 2, 3],
        },
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

    expect(fct.mcall[0].typedHashes).length(4);
    expect(fct.mcall[0].typedHashes[0]).equal(`0x0000000000000000000000000000000000000000000000000000000000000000`);

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
        variable_arguments_end: "0",
        variable_arguments_start: "0",
        method_interface: "transfer(uint256[],(uint256,(bool,uint64)),(bool,uint256))",
      },
      data: {
        value: "10",
        deepData: {
          doDeposit: true,
          timestamp: "123456789",
        },
      },
      list: [1, 2, 3],
      object: {
        isTrue: true,
        int: "20",
      },
    });
  });

  it("Should add 2 calls", async () => {
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

    expect(fct.mcall.length).to.eql(2);
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

    Call.update({
      method: "swapFrom",
    });

    expect(Call.get().method).to.eql("swapFrom");
  });

  it("Should create a Call class, add it to FCT and add validation", async () => {
    const CallClass = await Call.create({
      FCT,
      call: {
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
      },
    });

    await FCT.add(CallClass);

    expect(FCT.calls.length).to.eql(1);
    expect(FCT.calls[0].get().method).to.eql("transfer");

    const validationVariable = CallClass.addValidation({
      id: "validation1",
      value1: "2000",
      operator: "equal",
      value2: CallClass.getOutputVariable(0),
    });

    expect(validationVariable).to.eql({ type: "validation", id: "validation1" });
  });

  describe("Param verifier", () => {
    it("Should verify that address[] is valid", async () => {
      await FCT.add({
        nodeId: "node1",
        to: createRandomAddress(),
        from: createRandomAddress(),
        method: "methodName",
        params: [{ name: "to", type: "address[]", value: [createRandomAddress(), createRandomAddress()] }],
      });
    });
    it("Should revert if address[] is invalid", async () => {
      try {
        await FCT.add({
          nodeId: "node1",
          to: createRandomAddress(),
          from: createRandomAddress(),
          method: "methodName",
          params: [{ name: "to", type: "address[]", value: [createRandomAddress(), "123"] }],
        });
      } catch (e) {
        if (e instanceof Error) expect(e.message).to.eql("Param to[1] is not a valid address");
      }
    });
  });
});
