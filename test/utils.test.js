const { expect } = require("chai");
const { ethers } = require("ethers");
const { TypedDataUtils } = require("ethers-eip712");
const { utils } = require("../dist");

const FCT = {
  typedData: {
    types: {
      EIP712Domain: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "version",
          type: "string",
        },
        {
          name: "chainId",
          type: "uint256",
        },
        {
          name: "verifyingContract",
          type: "address",
        },
        {
          name: "salt",
          type: "bytes32",
        },
      ],
      BatchMultiSigCall: [
        {
          name: "fct",
          type: "FCT",
        },
        {
          name: "limits",
          type: "Limits",
        },
        {
          name: "transaction_1",
          type: "transaction1",
        },
      ],
      FCT: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "builder",
          type: "address",
        },
        {
          name: "selector",
          type: "bytes4",
        },
        {
          name: "version",
          type: "bytes3",
        },
        {
          name: "random_id",
          type: "bytes3",
        },
        {
          name: "eip712",
          type: "bool",
        },
      ],
      Limits: [
        {
          name: "valid_from",
          type: "uint40",
        },
        {
          name: "expires_at",
          type: "uint40",
        },
        {
          name: "gas_price_limit",
          type: "uint64",
        },
        {
          name: "purgeable",
          type: "bool",
        },
        {
          name: "blockable",
          type: "bool",
        },
      ],
      Recurrency: [
        {
          name: "max_repeats",
          type: "uint16",
        },
        {
          name: "chill_time",
          type: "uint32",
        },
        {
          name: "accumetable",
          type: "bool",
        },
      ],
      transaction1: [
        {
          name: "meta",
          type: "Transaction",
        },
      ],
      Transaction: [
        {
          name: "call_index",
          type: "uint16",
        },
        {
          name: "payer_index",
          type: "uint16",
        },
        {
          name: "from",
          type: "address",
        },
        {
          name: "to",
          type: "address",
        },
        {
          name: "to_ens",
          type: "string",
        },
        {
          name: "eth_value",
          type: "uint256",
        },
        {
          name: "gas_limit",
          type: "uint32",
        },
        {
          name: "view_only",
          type: "bool",
        },
        {
          name: "permissions",
          type: "uint16",
        },
        {
          name: "flow_control",
          type: "string",
        },
        {
          name: "jump_on_success",
          type: "uint16",
        },
        {
          name: "jump_on_fail",
          type: "uint16",
        },
        {
          name: "method_interface",
          type: "string",
        },
      ],
    },
    primaryType: "BatchMultiSigCall",
    domain: {
      name: "FCT Controller",
      version: "1",
      chainId: 4,
      verifyingContract: "0xD614c22fb35d1d978053d42C998d0493f06FB440",
      salt: "0x0100c25914cb0bb62af70000d614c22fb35d1d978053d42c998d0493f06fb440",
    },
    message: {
      fct: {
        name: "",
        builder: "0x0000000000000000000000000000000000000000",
        selector: "0xa7973c1f",
        version: "0x010101",
        random_id: "0x2e97af",
        eip712: true,
      },
      limits: {
        valid_from: "1663595976",
        expires_at: "1664459976",
        gas_price_limit: "100000000000",
        purgeable: false,
        blockable: true,
      },
      recurrency: {
        max_repeats: "1000",
        chill_time: "0",
        accumetable: false,
      },
      transaction_1: {
        meta: {
          call_index: 1,
          payer_index: 1,
          from: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
          to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          to_ens: "",
          eth_value: "10000000000000",
          gas_limit: 0,
          view_only: false,
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "",
        },
      },
    },
  },
  builder: "0x0000000000000000000000000000000000000000",
  typeHash: "0x433feb14617f4413d97a48213b0baa8a56dd8786d174bc4ad05f4c8991706f66",
  sessionId: "0x2e97af0001010103e800000000006335a4c800632875c8000000174876e8000c",
  nameHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
  mcall: [
    {
      typeHash: "0x27fd2787f8367e3c9f841dfe2e3b5dbde2bc66f6becf325ff777e0f54f405c23",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      value: "10000000000000",
      callId: "0x0000000000000000000000000000000000000000000000000100010000000000",
      from: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
      to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
      data: "0x",
      types: [],
      typedHashes: [],
    },
  ],
  signatures: [
    {
      r: "0x0ba8e339f8f2d17c924dcfafae9e634f44b61be83d4f1595c0c8d82f0eeaa3b0",
      s: "0x5ba51111da94bf821b8b49bd03bf956d0ac0d199928dd96127be9e17f92f1a11",
      _vs: "0x5ba51111da94bf821b8b49bd03bf956d0ac0d199928dd96127be9e17f92f1a11",
      recoveryParam: 0,
      v: 27,
      yParityAndS: "0x5ba51111da94bf821b8b49bd03bf956d0ac0d199928dd96127be9e17f92f1a11",
      compact:
        "0x0ba8e339f8f2d17c924dcfafae9e634f44b61be83d4f1595c0c8d82f0eeaa3b05ba51111da94bf821b8b49bd03bf956d0ac0d199928dd96127be9e17f92f1a11",
    },
  ],
  variables: [],
  externalSigners: [],
};

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
      { name: "blockable", type: "bool" },
    ],
    transaction1: [
      { name: "meta", type: "Transaction" },
      { name: "to", type: "address" },
      { name: "token_amount", type: "uint256" },
    ],
    transaction2: [
      { name: "meta", type: "Transaction" },
      { name: "input", type: "uint256" },
    ],
    transaction3: [
      { name: "meta", type: "Transaction" },
      { name: "input", type: "address" },
    ],
    transaction4: [{ name: "meta", type: "Transaction" }],
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
    salt: "0x0100d7145565d3f8a85a0000a47e3294143925db6321cf235af6180def446a1f",
  },
  message: {
    fct: {
      name: "ERC20 Transfer @BK",
      builder: "0x0000000000000000000000000000000000000000",
      selector: "0xa7973c1f",
      version: "0x010101",
      random_id: "0x329052",
      eip712: true,
    },
    limits: {
      valid_from: 1662444930,
      expires_at: 1663768580,
      gas_price_limit: "100000000000",
      purgeable: true,
      blockable: true,
    },
    transaction_1: {
      meta: {
        call_index: 1,
        payer_index: 1,
        from: "0x96E810D6c6D55e2FFbB5E72b86BeB4a1D9283B7a",
        to: "0x8fFE1690dc10FD43Bb8AEc3631f065A7F8197E8f",
        to_ens: "@token.kiro.eth",
        eth_value: "0",
        gas_limit: 0,
        view_only: false,
        permissions: 0,
        flow_control: "continue on success, stop on fail",
        jump_on_success: 0,
        jump_on_fail: 0,
        method_interface: "transfer(address,uint256)",
      },
      to: "0xC1B72812552554873dEd3eaC0B588cE78C3673E1",
      token_amount: "20",
    },
    transaction_2: {
      meta: {
        call_index: 2,
        payer_index: 2,
        from: "0x96E810D6c6D55e2FFbB5E72b86BeB4a1D9283B7a",
        to: "0x9F63d6588A67a481541cd8406d34D9eb9d3e41de",
        to_ens: "",
        eth_value: "0",
        gas_limit: 0,
        view_only: false,
        permissions: 0,
        flow_control: "continue on success, stop on fail",
        jump_on_success: 0,
        jump_on_fail: 0,
        method_interface: "getMultiCalc(uint256)",
      },
      input: 100,
    },
    transaction_3: {
      meta: {
        call_index: 3,
        payer_index: 3,
        from: "0x96E810D6c6D55e2FFbB5E72b86BeB4a1D9283B7a",
        to: "0x9F63d6588A67a481541cd8406d34D9eb9d3e41de",
        to_ens: "",
        eth_value: "0",
        gas_limit: 0,
        view_only: false,
        permissions: 0,
        flow_control: "continue on success, stop on fail",
        jump_on_success: 0,
        jump_on_fail: 0,
        method_interface: "getInputAddress(address)",
      },
      input: "0x5F9b9F46C19811Ecae7035159Bed966424A7Ab75",
    },
    transaction_4: {
      meta: {
        call_index: 4,
        payer_index: 4,
        from: "0x96E810D6c6D55e2FFbB5E72b86BeB4a1D9283B7a",
        to: "0xFD00000000000000000000000000000000000003",
        to_ens: "",
        eth_value: "0xFD00000000000000000000000000000000000002",
        gas_limit: 0,
        view_only: false,
        permissions: 0,
        flow_control: "stop on success, revert on fail",
        jump_on_success: 0,
        jump_on_fail: 0,
        method_interface: "",
      },
    },
  },
};

describe("Test utils", () => {
  it("Should get address from signature", async () => {
    const address = utils.recoverAddressFromEIP712(FCT.typedData, FCT.signatures[0]);

    console.log("address", address);
    console.log("address should be", "0x4f631612941F710db646B8290dB097bFB8657dC2");
  });

  it("Should get message hash", async () => {
    const message = ethers.utils.hexlify(TypedDataUtils.encodeDigest(typedData));
    console.log("encodeDigest", message);
    // const messageHash = utils.getFCTMessageHash(typedData);

    // console.log("messageHash", messageHash);
  });
});
