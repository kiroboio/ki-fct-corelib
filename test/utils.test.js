const { expect } = require("chai");
const { ethers } = require("ethers");
const { TypedDataUtils } = require("ethers-eip712");
const { utils, BatchMultiSigCall } = require("../dist");

const FCT_Controller_Rinkeby = "0xD614c22fb35d1d978053d42C998d0493f06FB440";

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
        {
          name: "transaction_2",
          type: "transaction2",
        },
        {
          name: "transaction_3",
          type: "transaction3",
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
      transaction1: [
        {
          name: "meta",
          type: "Transaction",
        },
      ],
      transaction2: [
        {
          name: "meta",
          type: "Transaction",
        },
        {
          name: "recipient",
          type: "address",
        },
        {
          name: "amount",
          type: "uint256",
        },
      ],
      transaction3: [
        {
          name: "meta",
          type: "Transaction",
        },
        {
          name: "owner",
          type: "address",
        },
        {
          name: "operator",
          type: "address",
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
        random_id: "0xce0876",
        eip712: true,
      },
      limits: {
        valid_from: "1664726097",
        expires_at: "1664895297",
        gas_price_limit: "100000000000",
        purgeable: false,
        blockable: true,
      },
      transaction_1: {
        meta: {
          call_index: 1,
          payer_index: 1,
          from: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
          to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          to_ens: "",
          eth_value: "5000000000000",
          gas_limit: 0,
          view_only: false,
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "",
        },
      },
      transaction_2: {
        meta: {
          call_index: 2,
          payer_index: 2,
          from: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
          to: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
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
        recipient: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        amount: "1000000000000000000",
      },
      transaction_3: {
        meta: {
          call_index: 3,
          payer_index: 3,
          from: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
          to: "0x4119c1268Ae527d068907B3D23c6a97b71a19084",
          to_ens: "",
          eth_value: "0",
          gas_limit: 0,
          view_only: false,
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "isApprovedForAll(address,address)",
        },
        owner: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        operator: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
      },
    },
  },
  builder: "0x0000000000000000000000000000000000000000",
  typeHash: "0x666b9487d7badc83c1964898da164fd48c7d30e01137685d11e21d7649e61084",
  sessionId: "0xce08760001010100000000000000633c4941006339b451000000174876e8000c",
  nameHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
  mcall: [
    {
      typeHash: "0x27fd2787f8367e3c9f841dfe2e3b5dbde2bc66f6becf325ff777e0f54f405c23",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      value: "5000000000000",
      callId: "0x0000000000000000000000000000000000000000000000000100010000000000",
      from: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
      to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
      data: "0x",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0xf5bc19c3416bdb7929f1bd7f0b42dacc210755fde821820349d3d6734e5f5471",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000200020000000000",
      from: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
      to: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      data: "0x0000000000000000000000004f631612941f710db646b8290db097bfb8657dc20000000000000000000000000000000000000000000000000de0b6b3a7640000",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0xce6102b15178e8817947e3c4e5c9686e5f85df9e1715833407cc21ebb57078bf",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xe985e9c5c6636c6879256001057b28ccac7718ef0ac56553ff9b926452cab8a3",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000300030000000000",
      from: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
      to: "0x4119c1268Ae527d068907B3D23c6a97b71a19084",
      data: "0x0000000000000000000000004f631612941f710db646b8290db097bfb8657dc200000000000000000000000027422b75008cb79cf0d094f81de854608eea36b7",
      types: [],
      typedHashes: [],
    },
  ],
  signatures: [
    {
      r: "0x1f9f8a919da030d9fd178bdb79267e6f4a6e9d7da45898ad667f555eac81f9ec",
      s: "0x663a7ffc38f1ae44fc7dcff37ae16459db1180f78d6bff7004b6a2bd705d188c",
      _vs: "0x663a7ffc38f1ae44fc7dcff37ae16459db1180f78d6bff7004b6a2bd705d188c",
      recoveryParam: 0,
      v: 27,
      yParityAndS: "0x663a7ffc38f1ae44fc7dcff37ae16459db1180f78d6bff7004b6a2bd705d188c",
      compact:
        "0x1f9f8a919da030d9fd178bdb79267e6f4a6e9d7da45898ad667f555eac81f9ec663a7ffc38f1ae44fc7dcff37ae16459db1180f78d6bff7004b6a2bd705d188c",
    },
  ],
  variables: [],
  externalSigners: [],
};

const FCT2 = {
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
        {
          name: "transaction_2",
          type: "transaction2",
        },
        {
          name: "transaction_3",
          type: "transaction3",
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
      transaction1: [
        {
          name: "meta",
          type: "Transaction",
        },
      ],
      transaction2: [
        {
          name: "meta",
          type: "Transaction",
        },
        {
          name: "recipient",
          type: "address",
        },
        {
          name: "amount",
          type: "uint256",
        },
      ],
      transaction3: [
        {
          name: "meta",
          type: "Transaction",
        },
        {
          name: "owner",
          type: "address",
        },
        {
          name: "operator",
          type: "address",
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
        random_id: "0x0d823a",
        eip712: true,
      },
      limits: {
        valid_from: "1664726118",
        expires_at: "1664895318",
        gas_price_limit: "100000000000",
        purgeable: false,
        blockable: true,
      },
      transaction_1: {
        meta: {
          call_index: 1,
          payer_index: 1,
          from: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
          to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          to_ens: "",
          eth_value: "5000000000000",
          gas_limit: 0,
          view_only: false,
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "",
        },
      },
      transaction_2: {
        meta: {
          call_index: 2,
          payer_index: 2,
          from: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
          to: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
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
        recipient: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        amount: "1000000000000000000",
      },
      transaction_3: {
        meta: {
          call_index: 3,
          payer_index: 3,
          from: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
          to: "0x4119c1268Ae527d068907B3D23c6a97b71a19084",
          to_ens: "",
          eth_value: "0",
          gas_limit: 0,
          view_only: false,
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "isApprovedForAll(address,address)",
        },
        owner: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        operator: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
      },
    },
  },
  builder: "0x0000000000000000000000000000000000000000",
  typeHash: "0x666b9487d7badc83c1964898da164fd48c7d30e01137685d11e21d7649e61084",
  sessionId: "0x0d823a0001010100000000000000633c4956006339b466000000174876e8000c",
  nameHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
  mcall: [
    {
      typeHash: "0x27fd2787f8367e3c9f841dfe2e3b5dbde2bc66f6becf325ff777e0f54f405c23",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      value: "5000000000000",
      callId: "0x0000000000000000000000000000000000000000000000000100010000000000",
      from: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
      to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
      data: "0x",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0xf5bc19c3416bdb7929f1bd7f0b42dacc210755fde821820349d3d6734e5f5471",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000200020000000000",
      from: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
      to: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      data: "0x0000000000000000000000004f631612941f710db646b8290db097bfb8657dc20000000000000000000000000000000000000000000000000de0b6b3a7640000",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0xce6102b15178e8817947e3c4e5c9686e5f85df9e1715833407cc21ebb57078bf",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xe985e9c5c6636c6879256001057b28ccac7718ef0ac56553ff9b926452cab8a3",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000300030000000000",
      from: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
      to: "0x4119c1268Ae527d068907B3D23c6a97b71a19084",
      data: "0x0000000000000000000000004f631612941f710db646b8290db097bfb8657dc200000000000000000000000027422b75008cb79cf0d094f81de854608eea36b7",
      types: [],
      typedHashes: [],
    },
  ],
  signatures: [
    {
      r: "0xd7fc915ccb94764433c8d3550b589b3640c8746d125719950a7d4c8603026781",
      s: "0x559ad3b2557bf9fae75551ac7b28484349d14bf5d924df013f086de0da984567",
      _vs: "0xd59ad3b2557bf9fae75551ac7b28484349d14bf5d924df013f086de0da984567",
      recoveryParam: 1,
      v: 28,
      yParityAndS: "0xd59ad3b2557bf9fae75551ac7b28484349d14bf5d924df013f086de0da984567",
      compact:
        "0xd7fc915ccb94764433c8d3550b589b3640c8746d125719950a7d4c8603026781d59ad3b2557bf9fae75551ac7b28484349d14bf5d924df013f086de0da984567",
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
  });

  it("Should get plugin", async () => {
    const batchMultiSigCall = new BatchMultiSigCall({
      provider: new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"),
      contractAddress: FCT_Controller_Rinkeby,
    });

    await batchMultiSigCall.importFCT(FCT2);

    const plugin0 = await batchMultiSigCall.getPlugin(0);
    const plugin1 = await batchMultiSigCall.getPlugin(1);
    const plugin2 = await batchMultiSigCall.getPlugin(2);

    console.log(plugin0);
    console.log(plugin1);
    console.log(plugin2);
  });
});
