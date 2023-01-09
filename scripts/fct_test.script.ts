import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";

import { BatchMultiSigCall, FCT_UNISWAP } from "../src";
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
        {
          name: "amount",
          type: "uint256",
        },
        {
          name: "method",
          type: "bytes32",
        },
        {
          name: "path",
          type: "address[]",
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
      verifyingContract: "0xa36457BCa36Ac0eED36f1b25bd9144B029600982",
      salt: "0x0100aaeed667ace37eb90000a36457bca36ac0eed36f1b25bd9144b029600982",
    },
    message: {
      meta: {
        name: "🔥Untitled",
        builder: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
        selector: "0x2409a934",
        version: "0x010101",
        random_id: "0x106923",
        eip712: true,
      },
      limits: {
        valid_from: "1673215200",
        expires_at: "1673906399",
        gas_price_limit: "80940377000",
        purgeable: false,
        blockable: true,
      },
      transaction_1: {
        call: {
          call_index: 1,
          payer_index: 1,
          call_type: "library",
          from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
          to: "0xf2B3a55051F49310635E962D54b9b1D961C81a55",
          to_ens: "@lib:uniswap_v2",
          eth_value: "0",
          gas_limit: "0",
          permissions: 0,
          flow_control: "stop on success, revert on fail",
          returned_false_means_fail: false,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "swap_noSlippageProtection(uint256,bytes32,address[])",
        },
        amount: "1000000000000000000",
        method: "0x87553fac71f49f68d60c206941e24a4072378db84d66aacd8c8b551375320e04",
        path: [
          "0xba232b47a7dDFCCc221916cf08Da03a4973D3A1D",
          "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
          "0xe4E81Fa6B16327D4B78CFEB83AAdE04bA7075165",
        ],
      },
    },
  },
  builder: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
  typeHash: "0x6f1ae9636c9d64eabd691678b87a436912c55da715d475f75b34b7982c549d79",
  sessionId: "0x106923000101010000000000000063c5c8df0063bb3ce000000012d86c23a80c",
  nameHash: "0xf41ad051fb56ed68686fda16fde3f9e4e51449a430e0b95f72636251d16683d7",
  mcall: [
    {
      typeHash: "0x51a6e9d969fe7bd2230563adfb81c57893c785525c995bbd2ae369000cd73645",
      ensHash: "0x7ca009b601db9e76f36541b80a69739c7ec25e0965b26d7682509a2fcb7dcccb",
      functionSignature: "0xba619610583d7cd8206b41ecd63f30575006cf2516356822d6f70c67bdf5f3cb",
      value: "0",
      callId: "0x0000000000000000000000000000000000000600000000000100010000000022",
      from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
      to: "0xf2B3a55051F49310635E962D54b9b1D961C81a55",
      data: "0x0000000000000000000000000000000000000000000000000de0b6b3a764000087553fac71f49f68d60c206941e24a4072378db84d66aacd8c8b551375320e0400000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000003000000000000000000000000ba232b47a7ddfccc221916cf08da03a4973d3a1d000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d6000000000000000000000000e4e81fa6b16327d4b78cfeb83aade04ba7075165",
      types: [1000, 1000, 4000, 1000],
      typedHashes: [],
    },
  ],
  variables: [],
  externalSigners: [],
  computed: [],
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

  const swapWithoutSlippage = new FCT_UNISWAP.actions.SwapNoSlippageProtection({
    chainId: "5",
    initParams: {
      methodParams: {
        amount: "1000000",
        method: keccak256(toUtf8Bytes("swap <amount> Tokens for <X> ETH")),
        path: [data[chainId].KIRO, data[chainId].USDC],
      },
    },
  });

  console.log(swapWithoutSlippage.methodInterface);

  batchMultiSigCall.importFCT(FCT);

  const getAllRequiredApprovals = await batchMultiSigCall.getAllRequiredApprovals();

  console.log(getAllRequiredApprovals);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
