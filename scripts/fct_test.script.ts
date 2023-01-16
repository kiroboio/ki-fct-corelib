import * as dotenv from "dotenv";
import { ethers } from "ethers";

import { BatchMultiSigCall } from "../src";
import data from "./scriptData";
// import util from "util";

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
        version: "0x010101",
        random_id: "0xc9986c",
        eip712: true,
      },
      limits: {
        valid_from: "1673820000",
        expires_at: "1674511199",
        gas_price_limit: "80000000000",
        purgeable: false,
        blockable: true,
      },
      transaction_1: {
        call: {
          call_index: 1,
          payer_index: 1,
          call_type: "action",
          from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
          to: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
          to_ens: "",
          eth_value: "100000000000000",
          gas_limit: "42002",
          permissions: 0,
          flow_control: "stop on success, revert on fail",
          returned_false_means_fail: false,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "",
        },
      },
    },
  },
  builder: "0x0000000000000000000000000000000000000000",
  typeHash: "0x68737ac15a997c004c435ba5a5a43b26b545785523e99b8eb9fd86e50eb9d87d",
  sessionId: "0xc9986c000101010000000000000063cf035f0063c4776000000012a05f20000c",
  nameHash: "0xf41ad051fb56ed68686fda16fde3f9e4e51449a430e0b95f72636251d16683d7",
  mcall: [
    {
      typeHash: "0x059f3ab25880eb521ca0ee77909d61ec600ee2057b1588455cb8a9a469122816",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      value: "100000000000000",
      callId: "0x0000000000000000000000000000000000000600000000000100010000a41200",
      from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
      to: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
      data: "0x",
      types: [],
      typedHashes: [],
    },
  ],
  variables: [],
  externalSigners: [],
  computed: [],
  signatures: [
    {
      r: "0x4efc61eaa16b6524d191a00f40ee2552b0c7062953afbdc243434ad254060e74",
      s: "0x7c1e60eeefc515d80d9d270b64c67d12adadaa4db3f039ad9bd1f29683ec380f",
      v: 27,
    },
  ],
};

dotenv.config();
// eslint-disable-next-line
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function getDate(days = 0) {
  const result = new Date();
  result.setDate(result.getDate() + days);
  return Number(result.getTime() / 1000).toFixed();
}
// eslint-disable-next-line
function addHours(numOfHours: number, date = new Date()) {
  date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);

  return Number(date.getTime() / 1000).toFixed();
}

const chainId = 5;
const wallet = process.env.WALLET as string;

// TypeError: Cannot read properties of undefined (reading 'to')
//     at BatchMultiSigCall.getPlugin (/Users/lior/kirobo/back/ki-safe-transfer-service/node_modules/ki-fct-corelib/dist/batchMultiSigCall/methods/plugins.js:17:48)
//     at getPluginData (/Users/lior/kirobo/back/ki-safe-transfer-service/src/services/eth/infura/infura.class.ts:521:44)
//     at errors (/Users/lior/kirobo/back/ki-safe-transfer-service/src/services/eth/infura/infura.class.ts:267:23)
//     at processTicksAndRejections (node:internal/process/task_queues:95:5)

async function main() {
  const vault = process.env.VAULT as string;
  const key = process.env.PRIVATE_KEY as string;
  const provider = new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl);

  const batchMultiSigCall = new BatchMultiSigCall({
    provider,
    contractAddress: data[chainId].FCT_Controller,
  });

  batchMultiSigCall.setOptions({
    maxGasPrice: "3000000000",
    expiresAt: getDate(1000000),
    recurrency: {
      accumetable: true,
      maxRepeats: "1000",
      chillTime: "1",
    },
  });

  // const swapWithoutSlippage = new FCT_UNISWAP.actions.SwapNoSlippageProtection({
  //   chainId: "5",
  //   initParams: {
  //     methodParams: {
  //       amount: "1000000",
  //       method: keccak256(toUtf8Bytes("swap <amount> Tokens for <X> ETH")),
  //       path: [data[chainId].KIRO, data[chainId].USDC],
  //     },
  //   },
  // });

  // console.log(swapWithoutSlippage.methodInterface);

  batchMultiSigCall.importFCT(FCT);
  const plugin = await batchMultiSigCall.getPlugin(0);

  console.log("Plugin", plugin);

  const pluginData = await batchMultiSigCall.getPluginData(0);
  console.log("PluginData", pluginData);

  // const { to, value, methodParams } = plugin.input.get();
  // console.log("Params", to, value, methodParams);

  // const getAllRequiredApprovals = await batchMultiSigCall.getAllRequiredApprovals();

  // console.log(getAllRequiredApprovals);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
