import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import util from "util";

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
          type: "string",
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
      verifyingContract: "0xc86A8f32feDB6D05b9153049aA596cF5C1621d45",
      salt: "0x0100e421e2e61b1b9a580000c86a8f32fedb6d05b9153049aa596cf5c1621d45",
    },
    message: {
      meta: {
        name: "🔥Untitled",
        builder: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
        selector: "0x2409a934",
        version: "0x010101",
        random_id: "0x405bba",
        eip712: true,
      },
      limits: {
        valid_from: "1673474400",
        expires_at: "1674165599",
        gas_price_limit: "199312020452",
        purgeable: false,
        blockable: true,
      },
      transaction_1: {
        call: {
          call_index: 1,
          payer_index: 1,
          call_type: "library",
          from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
          to: "0x4186dA7567697B155BC9281eF409ff3eCc6bB0dC",
          to_ens: "@lib:uniswap_v2",
          eth_value: "0",
          gas_limit: "400000",
          permissions: 0,
          flow_control: "stop on success, revert on fail",
          returned_false_means_fail: false,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "swap_noSlippageProtection(uint256,bytes32,address[])",
        },
        amount: "12000000000000000000",
        method: "swap <amount> Tokens for <X> Tokens",
        path: [
          "0xe4E81Fa6B16327D4B78CFEB83AAdE04bA7075165",
          "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
          "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        ],
      },
    },
  },
  builder: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
  typeHash: "0x1cc3df3f04cd4b8a3a335275ab56f77edd6f062c08b8e5dbc47426da0936efa4",
  sessionId: "0x405bba000101010000000000000063c9bd5f0063bf31600000002e67ec13e40c",
  nameHash: "0xf41ad051fb56ed68686fda16fde3f9e4e51449a430e0b95f72636251d16683d7",
  mcall: [
    {
      typeHash: "0xc0f2bc18d08aca5ca4de62820a15c580d94519cd311e4f78e8110f0165b3da8f",
      ensHash: "0x7ca009b601db9e76f36541b80a69739c7ec25e0965b26d7682509a2fcb7dcccb",
      functionSignature: "0xba619610583d7cd8206b41ecd63f30575006cf2516356822d6f70c67bdf5f3cb",
      value: "0",
      callId: "0x00000000000000000000000000000000000006000000000001000100061a8022",
      from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
      to: "0x4186dA7567697B155BC9281eF409ff3eCc6bB0dC",
      data: "0x000000000000000000000000000000000000000000000000a688906bd8b0000087553fac71f49f68d60c206941e24a4072378db84d66aacd8c8b551375320e0400000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000003000000000000000000000000e4e81fa6b16327d4b78cfeb83aade04ba7075165000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d60000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984",
      types: [1000, 1000, 4000, 1000],
      typedHashes: [],
    },
  ],
  variables: [],
  externalSigners: [],
  computed: [],
  signatures: [],
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
  console.log(util.inspect(batchMultiSigCall.calls, false, null, true));
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
