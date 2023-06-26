import { expect } from "chai";

import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { EIP712 } from ".";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

describe("BatchMultiSigCall EIP712", () => {
  let FCT: BatchMultiSigCall;
  let eip712: EIP712;
  before(async () => {
    FCT = new BatchMultiSigCall({
      chainId: "5",
    });

    const Call = await FCT.create({
      to: USDC,
      // Random address
      from: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
      method: "balanceOf",
      params: [
        {
          name: "account",
          type: "address",
          value: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
        },
      ],
      options: {
        callType: "VIEW_ONLY",
      },
    });

    const computedVariable = FCT.addComputed({
      value1: { type: "output", id: { nodeId: Call.get.nodeId, innerIndex: 0 } },
      operator1: "+",
      value2: "2",
      operator2: "*",
      value3: "3",
      operator3: "/",
      value4: "4",
    });

    await FCT.create({
      to: USDC,
      // Random address
      from: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
      method: "transfer",
      params: [
        {
          name: "recipient",
          type: "address",
          value: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
        },
        {
          name: "amount",
          type: "uint256",
          value: computedVariable,
        },
      ],
    });
    eip712 = new EIP712(FCT);
  });

  it("should generate the correct EIP712 domain", () => {
    const domain = eip712.getTypedDataDomain();
    expect(domain).to.deep.equal(EIP712.getTypedDataDomain("5"));
  });

  it("should generate the correct EIP712 primary type", () => {
    const primaryType = eip712.getPrimaryType();
    expect(primaryType).to.deep.equal("BatchMultiSigCall");
  });

  it("should generate the correct EIP712 typed data types", () => {
    const { EIP712Domain, Meta, Limits, BatchMultiSigCall, Call, Computed } = eip712.getTypedDataTypes();
    expect(EIP712Domain).to.deep.equal(EIP712.types.domain);
    expect(Meta).to.deep.equal(EIP712.types.meta);
    expect(Limits).to.deep.equal(EIP712.types.limits);
    expect(BatchMultiSigCall).to.deep.equal([
      { name: "meta", type: "Meta" },
      { name: "limits", type: "Limits" },
      { name: "computed_1", type: "Computed" },
      { name: "transaction_1", type: "transaction1" },
      { name: "transaction_2", type: "transaction2" },
    ]);
    expect(Call).to.deep.equal(EIP712.types.call);
    expect(Computed).to.deep.equal(EIP712.types.computed);
  });

  it("should generate the correct EIP712 typed data message", () => {
    const { meta, limits, transaction_1, transaction_2, computed_1 } = eip712.getTypedDataMessage();
    expect(meta).to.deep.equal({
      name: "",
      builder: FCT.options.builder,
      selector: FCT.batchMultiSigSelector,
      version: FCT.version,
      random_id: "0x" + FCT.randomId,
      eip712: true,
      auth_enabled: true,
    });
    expect(limits).to.deep.equal({
      valid_from: FCT.options.validFrom,
      expires_at: FCT.options.expiresAt,
      gas_price_limit: FCT.options.maxGasPrice,
      purgeable: FCT.options.purgeable,
      blockable: FCT.options.blockable,
    });
    expect(transaction_1).to.deep.equal({
      call: {
        call_index: 1,
        payer_index: 1,
        call_type: "view only",
        from: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
        to: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        to_ens: "",
        value: "0",
        gas_limit: "0",
        permissions: 0,
        validation: 0,
        flow_control: "continue on success, revert on fail",
        returned_false_means_fail: false,
        jump_on_success: 0,
        jump_on_fail: 0,
        method_interface: "balanceOf(address)",
      },
      account: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
    });
    expect(transaction_2).to.deep.equal({
      call: {
        call_index: 2,
        payer_index: 2,
        call_type: "action",
        from: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
        to: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        to_ens: "",
        value: "0",
        gas_limit: "0",
        permissions: 0,
        validation: 0,
        flow_control: "continue on success, revert on fail",
        returned_false_means_fail: false,
        jump_on_success: 0,
        jump_on_fail: 0,
        method_interface: "transfer(address,uint256)",
      },
      amount: "0xFE00000000000000000000000000000000000001", // Computed Variable
      recipient: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
    });
    expect(computed_1).to.deep.equal({
      index: "1",
      value_1: "0xFD00000000000000000000000000000000000001",
      op_1: "+",
      value_2: "2",
      op_2: "*",
      value_3: "3",
      op_3: "*",
      value_4: "4",
      overflow_protection: true,
    });
  });
});
