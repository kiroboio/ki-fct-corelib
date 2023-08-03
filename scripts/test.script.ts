import { ethers } from "ethers";

import { BatchMultiSigCall } from "../src";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

const FCTData = {
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
      Meta: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "app",
          type: "string",
        },
        {
          name: "by",
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
        {
          name: "verifier",
          type: "string",
        },
        {
          name: "auth_enabled",
          type: "bool",
        },
        {
          name: "dry_run",
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
          name: "call",
          type: "Call",
        },
        {
          name: "erc20Approvals",
          type: "Struct_0_0[]",
        },
      ],
      transaction2: [
        {
          name: "call",
          type: "Call",
        },
        {
          name: "asset",
          type: "address",
        },
        {
          name: "amount",
          type: "uint256",
        },
        {
          name: "onBehalfOf",
          type: "address",
        },
        {
          name: "referralCode",
          type: "uint16",
        },
      ],
      transaction3: [
        {
          name: "call",
          type: "Call",
        },
        {
          name: "erc20Approvals",
          type: "Struct_2_0[]",
        },
      ],
      Struct_0_0: [
        {
          name: "token",
          type: "address",
        },
        {
          name: "spender",
          type: "address",
        },
        {
          name: "amount",
          type: "uint256",
        },
      ],
      Struct_2_0: [
        {
          name: "token",
          type: "address",
        },
        {
          name: "spender",
          type: "address",
        },
        {
          name: "amount",
          type: "uint256",
        },
      ],
      BatchMultiSigCall: [
        {
          name: "meta",
          type: "Meta",
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
      Call: [
        {
          name: "call_index",
          type: "uint16",
        },
        {
          name: "payer_index",
          type: "uint16",
        },
        {
          name: "call_type",
          type: "string",
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
          name: "value",
          type: "uint256",
        },
        {
          name: "gas_limit",
          type: "uint32",
        },
        {
          name: "permissions",
          type: "uint16",
        },
        {
          name: "validation",
          type: "uint16",
        },
        {
          name: "flow_control",
          type: "string",
        },
        {
          name: "returned_false_means_fail",
          type: "bool",
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
      chainId: 5,
      verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
      salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
    },
    message: {
      meta: {
        name: "",
        app: "",
        by: "",
        builder: "0x0000000000000000000000000000000000000000",
        selector: "0x9b2542b3",
        version: "0x010201",
        random_id: "0x37f6a7",
        eip712: true,
        verifier: "",
        auth_enabled: true,
        dry_run: false,
      },
      limits: {
        valid_from: "1691060859",
        expires_at: "1691665659",
        gas_price_limit: "30000000000",
        purgeable: false,
        blockable: true,
      },
      transaction_1: {
        call: {
          call_index: 1,
          payer_index: 1,
          call_type: "library: action",
          from: "0x0481355938860769bEcA9349292b6e9054766Ff2",
          to: "0x23D560eF20B57A87489D3Ec72D3789E73DF90424",
          to_ens: "@lib:multicall",
          value: "0",
          gas_limit: "148352",
          permissions: 0,
          validation: 0,
          flow_control: "continue on success, revert on fail",
          returned_false_means_fail: false,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "erc20Approvals((address,address,uint256)[])",
        },
        erc20Approvals: [
          {
            token: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            spender: "0x4bd5643ac6f66a5237E18bfA7d47cF22f1c9F210",
            amount: "1000000000000000000",
          },
        ],
      },
      transaction_2: {
        call: {
          call_index: 2,
          payer_index: 2,
          call_type: "action",
          from: "0x0481355938860769bEcA9349292b6e9054766Ff2",
          to: "0x4bd5643ac6f66a5237E18bfA7d47cF22f1c9F210",
          to_ens: "",
          value: "0",
          gas_limit: "587642",
          permissions: 0,
          validation: 0,
          flow_control: "continue on success, revert on fail",
          returned_false_means_fail: false,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "deposit(address,uint256,address,uint16)",
        },
        asset: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        amount: "1000000000000000000",
        onBehalfOf: "0x0481355938860769bEcA9349292b6e9054766Ff2",
        referralCode: "0",
      },
      transaction_3: {
        call: {
          call_index: 3,
          payer_index: 3,
          call_type: "library: action",
          from: "0x0481355938860769bEcA9349292b6e9054766Ff2",
          to: "0x23D560eF20B57A87489D3Ec72D3789E73DF90424",
          to_ens: "@lib:multicall",
          value: "0",
          gas_limit: "148352",
          permissions: 0,
          validation: 0,
          flow_control: "continue on success, revert on fail",
          returned_false_means_fail: false,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "erc20Approvals((address,address,uint256)[])",
        },
        erc20Approvals: [
          {
            token: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            spender: "0x4bd5643ac6f66a5237E18bfA7d47cF22f1c9F210",
            amount: "0",
          },
        ],
      },
    },
  },
  builder: "0x0000000000000000000000000000000000000000",
  typeHash: "0x71b368faa71e0d36aa15e70a8ff137be8f712d756f8fbec4eaaf770b788eb2b2",
  sessionId: "0x37f6a7000102010000000000000064d4c4fb0064cb8a7b00000006fc23ac001c",
  nameHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
  mcall: [
    {
      typeHash: "0x42dfd41850650f5122961f149ba81236dc07688d839d4f46d13e90ef2a8d3b6c",
      ensHash: "0x5fb4ff84064faf3ded8f4647d611abf1778558dc930c60165c56c40d0f3da7b2",
      functionSignature: "0xaf4c0a5a4d8f85cde434f587a577bb43048d6d12618bfbf54c299b10d5de8f14",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000100010002438022",
      from: "0x0481355938860769bEcA9349292b6e9054766Ff2",
      to: "0x23D560eF20B57A87489D3Ec72D3789E73DF90424",
      data: "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000004bd5643ac6f66a5237e18bfa7d47cf22f1c9f2100000000000000000000000000000000000000000000000000de0b6b3a7640000",
      types: [4000, 3, 1000, 1000, 1000],
      typedHashes: ["0xd39f2767b7858131d2a9e45b457ec44c45bd7c6095f751744cac61f400cd067a"],
    },
    {
      typeHash: "0x380d323dc2d06102ab01d1e6000908812707677bd57d4ebdf17104f9e3b060d7",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xe8eda9df0b01eb22d994bafd527c9d2f8a22e59a6e596139cc3ae72ae47debec",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000200020008f77a00",
      from: "0x0481355938860769bEcA9349292b6e9054766Ff2",
      to: "0x4bd5643ac6f66a5237E18bfA7d47cF22f1c9F210",
      data: "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000481355938860769beca9349292b6e9054766ff20000000000000000000000000000000000000000000000000000000000000000",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0xdf8c274bfcb626e0be9b624a97f50d22f9c91064253ddc7cabf54d60e6849bf5",
      ensHash: "0x5fb4ff84064faf3ded8f4647d611abf1778558dc930c60165c56c40d0f3da7b2",
      functionSignature: "0xaf4c0a5a4d8f85cde434f587a577bb43048d6d12618bfbf54c299b10d5de8f14",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000300030002438022",
      from: "0x0481355938860769bEcA9349292b6e9054766Ff2",
      to: "0x23D560eF20B57A87489D3Ec72D3789E73DF90424",
      data: "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000004bd5643ac6f66a5237e18bfa7d47cf22f1c9f2100000000000000000000000000000000000000000000000000000000000000000",
      types: [4000, 3, 1000, 1000, 1000],
      typedHashes: ["0x605909b0b410d0e8fd4f00b747c20a46cca1393df07f649703d63bf689ca8859"],
    },
  ],
  variables: [],
  externalSigners: [],
  signatures: [
    {
      r: "0xfbfc5d6a236236b0ba023106223ad961b0fec101a5495a968bc5454eaa2c0d63",
      s: "0x11ff734016a78bec5219e6227b519ce26174750b9d2be425a7085ddbbd1c285f",
      _vs: "0x11ff734016a78bec5219e6227b519ce26174750b9d2be425a7085ddbbd1c285f",
      recoveryParam: 0,
      v: 27,
      yParityAndS: "0x11ff734016a78bec5219e6227b519ce26174750b9d2be425a7085ddbbd1c285f",
      compact:
        "0xfbfc5d6a236236b0ba023106223ad961b0fec101a5495a968bc5454eaa2c0d6311ff734016a78bec5219e6227b519ce26174750b9d2be425a7085ddbbd1c285f",
    },
  ],
  computed: [],
  validations: [],
  appHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
  byHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
  verifierHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
};
async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const pluginData = await FCT.getPluginData(0);

  console.log(JSON.stringify(pluginData, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
