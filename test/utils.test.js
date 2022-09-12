const { expect } = require("chai");
const { utils } = require("../dist");

const typedData = {
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
      { name: "salt", type: "bytes32" },
    ],
    BatchMultiSigCall: [
      { name: "fct", type: "FCT" },
      { name: "limits", type: "Limits" },
      { name: "transaction_1", type: "transaction1" },
      { name: "transaction_2", type: "transaction2" },
      { name: "transaction_3", type: "transaction3" },
      { name: "transaction_4", type: "transaction4" },
      { name: "transaction_5", type: "transaction5" },
    ],
    FCT: [
      { name: "name", type: "string" },
      { name: "builder", type: "address" },
      { name: "selector", type: "bytes4" },
      { name: "version", type: "bytes3" },
      { name: "random_id", type: "bytes3" },
      { name: "eip712", type: "bool" },
    ],
    Limits: [
      { name: "valid_from", type: "uint40" },
      { name: "expires_at", type: "uint40" },
      { name: "gas_price_limit", type: "uint64" },
      { name: "purgeable", type: "bool" },
      { name: "cancelable", type: "bool" },
    ],
    transaction1: [
      { name: "meta", type: "Transaction" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    transaction2: [
      { name: "meta", type: "Transaction" },
      { name: "valueToCompare", type: "uint256" },
      { name: "contractAddress", type: "address" },
      { name: "functionSignature", type: "string" },
      { name: "method_data_offset", type: "uint256" },
      { name: "method_data_length", type: "uint256" },
      { name: "owner", type: "address" },
    ],
    transaction3: [
      { name: "meta", type: "Transaction" },
      { name: "to", type: "address" },
      { name: "token_amount", type: "uint256" },
    ],
    transaction4: [
      { name: "meta", type: "Transaction" },
      { name: "owner", type: "address" },
    ],
    transaction5: [
      { name: "meta", type: "Transaction" },
      { name: "to", type: "address" },
      { name: "token_amount", type: "uint256" },
    ],
    Transaction: [
      { name: "call_index", type: "uint16" },
      { name: "payer_index", type: "uint16" },
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "to_ens", type: "string" },
      { name: "eth_value", type: "uint256" },
      { name: "gas_limit", type: "uint32" },
      { name: "view_only", type: "bool" },
      { name: "permissions", type: "uint16" },
      { name: "flow_control", type: "string" },
      { name: "jump_on_success", type: "uint16" },
      { name: "jump_on_fail", type: "uint16" },
      { name: "method_interface", type: "string" },
    ],
  },
  primaryType: "BatchMultiSigCall",
  domain: {
    name: "FCT Controller",
    version: "1",
    chainId: 4,
    verifyingContract: "0xa47e3294143925DB6321cF235Af6180DeF446A1F",
    salt: "0x0100686d9129e0dc3a8d0000a47e3294143925db6321cf235af6180def446a1f",
  },
  message: {
    fct: {
      name: "ERC20 Transfer @BK",
      builder: "0x0000000000000000000000000000000000000000",
      selector: "0xa7973c1f",
      version: "0x010101",
      random_id: "0xc5ff60",
      eip712: true,
    },
    limits: {
      valid_from: 1662444930,
      expires_at: "1665478470",
      gas_price_limit: "30000000000",
      purgeable: false,
      cancelable: false,
    },
    transaction_1: {
      meta: {
        call_index: 1,
        payer_index: 1,
        from: "0xadaCfDAF5ae4Bfd4A65fFa7244360C4AB08b05fD",
        to: "0x8fFE1690dc10FD43Bb8AEc3631f065A7F8197E8f",
        to_ens: "",
        eth_value: "0",
        gas_limit: 0,
        view_only: false,
        permissions: 0,
        flow_control: "continue on success, continue on fail",
        jump_on_success: 1,
        jump_on_fail: 0,
        method_interface: "transfer(address,uint256)",
      },
      recipient: "0x5B8C872719f71067922E444F1f2840e01b086dA7",
      amount: "30000",
    },
    transaction_2: {
      meta: {
        call_index: 2,
        payer_index: 2,
        from: "0x4Ba2f215FB308BC3896C61DE3426E711a6f3d8FA",
        to: "0x801f5Cc54CdD4370a0AeD38f5E45E0340501609C",
        to_ens: "",
        eth_value: "0",
        gas_limit: 0,
        view_only: false,
        permissions: 0,
        flow_control: "continue on success, revert on fail",
        jump_on_success: 0,
        jump_on_fail: 0,
        method_interface: "greaterThan(uint256,address,bytes32,bytes)",
      },
      valueToCompare: "10",
      contractAddress: "0x8fFE1690dc10FD43Bb8AEc3631f065A7F8197E8f",
      functionSignature: "balanceof(address)",
      method_data_offset: "0x0000000000000000000000000000000000000000000000000000000000000080",
      method_data_length: "0x0000000000000000000000000000000000000000000000000000000000000020",
      owner: "0x4Ba2f215FB308BC3896C61DE3426E711a6f3d8FA",
    },
    transaction_3: {
      meta: {
        call_index: 3,
        payer_index: 3,
        from: "0x4Ba2f215FB308BC3896C61DE3426E711a6f3d8FA",
        to: "0x8fFE1690dc10FD43Bb8AEc3631f065A7F8197E8f",
        to_ens: "@token.kiro.eth",
        eth_value: "0",
        gas_limit: 0,
        view_only: false,
        permissions: 0,
        flow_control: "continue on success, revert on fail",
        jump_on_success: 0,
        jump_on_fail: 0,
        method_interface: "transfer(address,uint256)",
      },
      to: "0xC1B72812552554873dEd3eaC0B588cE78C3673E1",
      token_amount: "20",
    },
    transaction_4: {
      meta: {
        call_index: 4,
        payer_index: 4,
        from: "0x4Ba2f215FB308BC3896C61DE3426E711a6f3d8FA",
        to: "0x8fFE1690dc10FD43Bb8AEc3631f065A7F8197E8f",
        to_ens: "",
        eth_value: "0",
        gas_limit: 0,
        view_only: true,
        permissions: 0,
        flow_control: "continue on success, revert on fail",
        jump_on_success: 0,
        jump_on_fail: 0,
        method_interface: "balanceOf(address)",
      },
      owner: "0x4Ba2f215FB308BC3896C61DE3426E711a6f3d8FA",
    },
    transaction_5: {
      meta: {
        call_index: 5,
        payer_index: 5,
        from: "0x4Ba2f215FB308BC3896C61DE3426E711a6f3d8FA",
        to: "0x8fFE1690dc10FD43Bb8AEc3631f065A7F8197E8f",
        to_ens: "",
        eth_value: "0",
        gas_limit: 0,
        view_only: false,
        permissions: 0,
        flow_control: "continue on success, revert on fail",
        jump_on_success: 0,
        jump_on_fail: 0,
        method_interface: "transfer(address,uint256)",
      },
      to: "0xFC00000000000000000000000000000000000001",
      token_amount: "20",
    },
  },
};

describe("Test utils", () => {
  it("Should get message hash from typedData", async () => {
    const typedDataHash = utils.getFCTMessageHash(typedData);

    expect(typedDataHash).to.eq("0xa79207e1e758b546f16062155fb372130dfb659629d2e9fe784cd7a5eff47426");
  });
  it("Should validate FCT", async () => {
    const isValid = utils.validateFCT(typedData);

    expect(isValid).to.eq(true);
  });
});
