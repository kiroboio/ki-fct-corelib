const { expect } = require("chai");
const { utils } = require("../dist");

const FCT = {
  typedData: {
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
      salt: "0x01008ef894fb516fc74e0000a47e3294143925db6321cf235af6180def446a1f",
    },
    message: {
      fct: {
        name: "",
        builder: "0x0000000000000000000000000000000000000000",
        selector: "0xa7973c1f",
        version: "0x010101",
        random_id: "0xc989e2",
        eip712: true,
      },
      limits: {
        valid_from: "1662980301",
        expires_at: "1663585101",
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
  },
  typeHash: "0x6121afc43a83df76cce4848e9f143e7043133944d162bdab314b984114eeecf9",
  sessionId: "0xc989e2000101010000000000000063284b4d00631f10cd00000006fc23ac0008",
  nameHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
  mcall: [
    {
      typeHash: "0x0440861c5277f7a0a3fbbea74d2a14ced48d558ac1a3b00c00f89904462d1f9d",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b",
      value: "0",
      callId: "0x0000000000000000000000000000000000000200000001000100010000000000",
      from: "0xadaCfDAF5ae4Bfd4A65fFa7244360C4AB08b05fD",
      to: "0x8fFE1690dc10FD43Bb8AEc3631f065A7F8197E8f",
      data: "0x0000000000000000000000005b8c872719f71067922e444f1f2840e01b086da70000000000000000000000000000000000000000000000000000000000007530",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0x7b79dc59108a768782518552a8171d6b2111caf90df1b0a9088eaa05c4a4cc63",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0x5374c04977e53c180f2ffb35af7eae5d63f6da66f38b6942fffb36f469909c2c",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000200020000000000",
      from: "0x4Ba2f215FB308BC3896C61DE3426E711a6f3d8FA",
      to: "0x801f5Cc54CdD4370a0AeD38f5E45E0340501609C",
      data: "0x000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000008ffe1690dc10fd43bb8aec3631f065a7f8197e8f3d64125b1e54021ab00084a8c8a937bd1f6a50d46c1d12dcd71b6ba237916603000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000200000000000000000000000004ba2f215fb308bc3896c61de3426e711a6f3d8fa",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0xdda879b53f24864bcf4c9e2ebbac43aefb9f537ead80c5a4d322cc49ad656fc0",
      ensHash: "0x592852d8a8f43c34f3180e2fc94e70e5b75937406f408b4f933e459cd103eb28",
      functionSignature: "0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000300030000000000",
      from: "0x4Ba2f215FB308BC3896C61DE3426E711a6f3d8FA",
      to: "0x8fFE1690dc10FD43Bb8AEc3631f065A7F8197E8f",
      data: "0x000000000000000000000000c1b72812552554873ded3eac0b588ce78c3673e10000000000000000000000000000000000000000000000000000000000000014",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0x3e356d2a023f9b4f2277e10f25ab1aef50612072bdb588e304017d03c164b9ca",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0x70a08231b98ef4ca268c9cc3f6b4590e4bfec28280db06bb5d45e689f2a360be",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000400040000000001",
      from: "0x4Ba2f215FB308BC3896C61DE3426E711a6f3d8FA",
      to: "0x8fFE1690dc10FD43Bb8AEc3631f065A7F8197E8f",
      data: "0x0000000000000000000000004ba2f215fb308bc3896c61de3426e711a6f3d8fa",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0x6c935ffae8e29240b76bc375f695db5d0fabbdf4aae4943777aefa8f8ecbd732",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000500050000000000",
      from: "0x4Ba2f215FB308BC3896C61DE3426E711a6f3d8FA",
      to: "0x8fFE1690dc10FD43Bb8AEc3631f065A7F8197E8f",
      data: "0x000000000000000000000000fc000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000014",
      types: [],
      typedHashes: [],
    },
  ],
  signatures: [
    {
      r: "0x0b1a72489e0c6ac234672963549703d24be321cf368538bce5aa523a570c02aa",
      s: "0x6e78fa827764d8ad90ef35d5a037abdb9c77db9e9a488068f57e30adb431c129",
      _vs: "0xee78fa827764d8ad90ef35d5a037abdb9c77db9e9a488068f57e30adb431c129",
      recoveryParam: 1,
      v: "0x1c",
      yParityAndS: "0xee78fa827764d8ad90ef35d5a037abdb9c77db9e9a488068f57e30adb431c129",
      compact:
        "0x0b1a72489e0c6ac234672963549703d24be321cf368538bce5aa523a570c02aaee78fa827764d8ad90ef35d5a037abdb9c77db9e9a488068f57e30adb431c129",
    },
    {
      r: "0x946e6985712605963e2ac13c8a54d4120764fdf977e74e2ef23ad1ac1eb1c8d3",
      s: "0x1c572e9bee72f10676b22614dcb55c1a9b8b323dc8bd4c70609784e37c3608ef",
      _vs: "0x1c572e9bee72f10676b22614dcb55c1a9b8b323dc8bd4c70609784e37c3608ef",
      recoveryParam: 0,
      v: "0x1b",
      yParityAndS: "0x1c572e9bee72f10676b22614dcb55c1a9b8b323dc8bd4c70609784e37c3608ef",
      compact:
        "0x946e6985712605963e2ac13c8a54d4120764fdf977e74e2ef23ad1ac1eb1c8d31c572e9bee72f10676b22614dcb55c1a9b8b323dc8bd4c70609784e37c3608ef",
    },
  ],
  variables: ["0x000000000000000000000000C1B72812552554873dEd3eaC0B588cE78C3673E1"],
  builder: "0x0000000000000000000000000000000000000000",
  externalSigners: [],
};

describe("Test utils", () => {
  it("Should get message hash from typedData", async () => {
    const typedDataHash = utils.getFCTMessageHash(FCT.typedData);

    expect(typedDataHash).to.eq("0xd0a8fff65fc53cbe37a16544f3eab8dcce4c29a8924128731b5e79524cf6b8a3");
  });
  it("Should validate FCT", async () => {
    const fct = utils.validateFCT(FCT);

    const options = fct.getOptions();

    expect(options.valid_from).to.eq("1662980301");

    const signatures = fct.getSignatures();

    // 0x08B7d04533DfAe2d72e693771b339FA6DF08635d 0x3d0aA8fc3CBfb7CA765C23cAD3C4A917959d6A65

    expect(signatures[0]).to.eq("0x08B7d04533DfAe2d72e693771b339FA6DF08635d");
    expect(signatures[1]).to.eq("0x3d0aA8fc3CBfb7CA765C23cAD3C4A917959d6A65");
  });
});
