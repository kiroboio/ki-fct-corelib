import * as dotenv from "dotenv";

import { BatchMultiSigCall, utils } from "../src";
import scriptData from "./scriptData";
dotenv.config();

const chainId = "5";

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
      ],
      Meta: [
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
          name: "call",
          type: "Call",
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
          name: "amount",
          type: "uint256",
        },
      ],
      transaction2: [
        {
          name: "call",
          type: "Call",
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
          name: "amount",
          type: "uint256",
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
          name: "eth_value",
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
      verifyingContract: "0x087550a787B2720AAC06351065afC1F413D82572",
      salt: "0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572",
    },
    message: {
      meta: {
        name: "🔥Untitled",
        builder: "0x0000000000000000000000000000000000000000",
        selector: "0x2409a934",
        version: "0x010102",
        random_id: "0x722f5c",
        eip712: true,
      },
      limits: {
        valid_from: "1676412000",
        expires_at: "1677103199",
        gas_price_limit: "45454443886",
        purgeable: false,
        blockable: true,
      },
      transaction_1: {
        call: {
          call_index: 1,
          payer_index: 1,
          call_type: "action",
          from: "0xE1313519c74166CE416BfB9B8c4c1aE72fe7c0ee",
          to: "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60",
          to_ens: "",
          eth_value: "0",
          gas_limit: "130178",
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          returned_false_means_fail: true,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "transferFrom(address,address,uint256)",
        },
        from: "0x7b9CAC243a0A1f887f0DEa329392C4169a461E8e",
        to: "0xE1313519c74166CE416BfB9B8c4c1aE72fe7c0ee",
        amount: "100000000000000000",
      },
      transaction_2: {
        call: {
          call_index: 2,
          payer_index: 2,
          call_type: "action",
          from: "0xE1313519c74166CE416BfB9B8c4c1aE72fe7c0ee",
          to: "0x70cBa46d2e933030E2f274AE58c951C800548AeF",
          to_ens: "",
          eth_value: "0",
          gas_limit: "130178",
          permissions: 0,
          flow_control: "stop on success, revert on fail",
          returned_false_means_fail: true,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "transferFrom(address,address,uint256)",
        },
        from: "0x7b9CAC243a0A1f887f0DEa329392C4169a461E8e",
        to: "0xE1313519c74166CE416BfB9B8c4c1aE72fe7c0ee",
        amount: "100000000000000000",
      },
    },
  },
  builder: "0x0000000000000000000000000000000000000000",
  typeHash: "0xca004baf37da7a50acd370f8e88b06a08f253c5e5803509a7866b77e8f7fd0cf",
  sessionId: "0x722f5c000101020000000000000063f6905f0063ec04600000000a954bc56e0c",
  nameHash: "0xf41ad051fb56ed68686fda16fde3f9e4e51449a430e0b95f72636251d16683d7",
  mcall: [
    {
      typeHash: "0xf4dc87237688710b149e4133d7d3777db02a309dbe4b4f196619c5cd6a2394c0",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0x23b872dd7302113369cda2901243429419bec145408fa8b352b3dd92b66c680b",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000100010001fc8204",
      from: "0xE1313519c74166CE416BfB9B8c4c1aE72fe7c0ee",
      to: "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60",
      data: "0x0000000000000000000000007b9cac243a0a1f887f0dea329392c4169a461e8e000000000000000000000000e1313519c74166ce416bfb9b8c4c1ae72fe7c0ee000000000000000000000000000000000000000000000000016345785d8a0000",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0xa7ae2122719246a58d08a1eb7599fbce2f416c90fe9673e6ebd1f389279940d7",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0x23b872dd7302113369cda2901243429419bec145408fa8b352b3dd92b66c680b",
      value: "0",
      callId: "0x0000000000000000000000000000000000000600000000000200020001fc8204",
      from: "0xE1313519c74166CE416BfB9B8c4c1aE72fe7c0ee",
      to: "0x70cBa46d2e933030E2f274AE58c951C800548AeF",
      data: "0x0000000000000000000000007b9cac243a0a1f887f0dea329392c4169a461e8e000000000000000000000000e1313519c74166ce416bfb9b8c4c1ae72fe7c0ee000000000000000000000000000000000000000000000000016345785d8a0000",
      types: [],
      typedHashes: [],
    },
  ],
  variables: [],
  externalSigners: [],
  signatures: [],
  computed: [],
};

// Address
const randomAddress = "0x" + "0".repeat(40);
// USDC contract address
const USDC = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const USDT = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";

async function main() {
  const gasPrices = await utils.getGasPrices({
    rpcUrl: scriptData[chainId].rpcUrl,
  });
  console.log("Gas prices", gasPrices);

  const fct = new BatchMultiSigCall({
    chainId,
  });

  fct.importFCT(FCTData);

  // const transferFrom = new ERC20.actions.TransferFrom({
  //   chainId,
  //   initParams: {
  //     to: scriptData[chainId].KIRO,
  //     methodParams: {
  //       from: USDC,
  //       to: USDT,
  //       amount: "1",
  //     },
  //   },
  // });

  // await fct.create({
  //   from: USDT,
  //   plugin: transferFrom,
  //   nodeId: "1",
  // });

  // Get required approvals
  const requiredApprovals = fct.getAllRequiredApprovals();
  console.log("Required approvals", requiredApprovals);

  // const fct = new BatchMultiSigCall({
  //   chainId,
  // });
  // fct.importFCT(FCT);
  // const plugin = await fct.getPluginData(0);
  // console.log("Plugin data", plugin);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
