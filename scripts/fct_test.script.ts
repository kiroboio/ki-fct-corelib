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
          name: "owner",
          type: "address",
        },
      ],
      transaction2: [
        {
          name: "call",
          type: "Call",
        },
        {
          name: "tokenA",
          type: "address",
        },
        {
          name: "tokenB",
          type: "address",
        },
        {
          name: "liquidity",
          type: "uint256",
        },
        {
          name: "amountAMin",
          type: "uint256",
        },
        {
          name: "amountBMin",
          type: "uint256",
        },
        {
          name: "to",
          type: "address",
        },
        {
          name: "deadline",
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
      verifyingContract: "0xc86A8f32feDB6D05b9153049aA596cF5C1621d45",
      salt: "0x0100e421e2e61b1b9a580000c86a8f32fedb6d05b9153049aa596cf5c1621d45",
    },
    message: {
      meta: {
        name: "[FCT] 🔥Untitled (1)",
        builder: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
        selector: "0x2409a934",
        version: "0x010101",
        random_id: "0x1e396a",
        eip712: true,
      },
      limits: {
        valid_from: "1673474400",
        expires_at: "1674165599",
        gas_price_limit: "132953874568",
        purgeable: false,
        blockable: true,
      },
      transaction_1: {
        call: {
          call_index: 1,
          payer_index: 1,
          call_type: "view only",
          from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
          to: "0x0d415c2496099dfbe817fc5a0285be3d86b9fd8d",
          to_ens: "",
          eth_value: "0",
          gas_limit: "47884",
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          returned_false_means_fail: false,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "balanceOf(address)",
        },
        owner: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
      },
      transaction_2: {
        call: {
          call_index: 2,
          payer_index: 2,
          call_type: "action",
          from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
          to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
          to_ens: "",
          eth_value: "0",
          gas_limit: "305822",
          permissions: 0,
          flow_control: "stop on success, revert on fail",
          returned_false_means_fail: false,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)",
        },
        tokenA: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
        tokenB: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
        liquidity: "0xFD00000000000000000000000000000000000001",
        amountAMin: "0",
        amountBMin: "0",
        to: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
        deadline: "0xFB0B000000000000000000000000000000000000",
      },
    },
  },
  builder: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
  typeHash: "0x47e203fb3f187fd9ae22f0945df0a4ea7bd18608f8384d61348c6eb5492829e3",
  sessionId: "0x1e396a000101010000000000000063c9bd5f0063bf31600000001ef4ab20880c",
  nameHash: "0x5467a7a58d2cb3d84b1a57384a2fc247202946bb6fd3e1a1f6ca7a8026d0d6a2",
  mcall: [
    {
      typeHash: "0x276d3800ab976c19d67a16b7054fee3b1c64560474a19cf900904a0b4291a1c8",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0x70a08231b98ef4ca268c9cc3f6b4590e4bfec28280db06bb5d45e689f2a360be",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000100010000bb0c11",
      from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
      to: "0x0d415c2496099dfbe817fc5a0285be3d86b9fd8d",
      data: "0x00000000000000000000000003357338ea477ff139170cf85c9a4063dfc03fc9",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0xb92fa315edcb590dfeea2bd3b2a0ed76f0471444844e7344b54621bb0bae9596",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xbaa2abdea0af8b36706fa0a9a34a6e89e53bd90c580cbf95a99472e3a5ecda88",
      value: "0",
      callId: "0x0000000000000000000000000000000000000600000000000200020004aa9e00",
      from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
      to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      data: "0x000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d6000000000000000000000000ba232b47a7ddfccc221916cf08da03a4973d3a1d000000000000000000000000fd000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003357338ea477ff139170cf85c9a4063dfc03fc9000000000000000000000000fb0b000000000000000000000000000000000000",
      types: [],
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
