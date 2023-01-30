import { ERC20, FCT_UNISWAP, Uniswap } from "@kirobo/ki-eth-fct-provider-ts";
import { signTypedData, SignTypedDataVersion, TypedMessage } from "@metamask/eth-sig-util";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import util from "util";

import { BatchMultiSigCall, TypedDataTypes, utils } from "../src";
import data from "./scriptData";
// import util from "util";

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

const chainId = "5";
const wallet = process.env.WALLET as string;

async function main() {
  const vault = process.env.VAULT as string;
  const key = process.env.PRIVATE_KEY as string;

  const batchMultiSigCall = new BatchMultiSigCall({
    chainId,
  });

  batchMultiSigCall.setOptions({
    maxGasPrice: "3000000000",
    expiresAt: getDate(1000000),
    builder: wallet,
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

  const swap = new Uniswap.actions.UniswapV2SwapExactTokensForETH({
    chainId: "1",
  });

  swap.input.set({
    methodParams: {
      amountIn: "1000",
      amountOutMin: "1",
      path: [data[chainId].KIRO, data[chainId].USDC],
      to: vault,
    },
  });

  swap.input.methodParams.amountIn.set({ value: "1000" });

  const transfer = new ERC20.actions.Transfer({
    chainId: "1",
    initParams: {
      to: data[chainId].KIRO,
      methodParams: {
        recipient: wallet,
        amount: ethers.utils.parseUnits("1", 18).toString(),
      },
    },
  });

  await batchMultiSigCall.createMultiple([
    {
      from: vault,
      method: "swap_noSlippageProtection",
      to: data[chainId].KIRO,
      params: [
        {
          name: "amount",
          type: "uint256",
          value: "1000000",
          customType: false,
          hashed: false,
        },
        {
          name: "method",
          type: "string",
          value: "swap <amount> ETH for <X> Tokens",
          customType: false,
          hashed: true,
        },
        {
          name: "path",
          type: "address[]",
          value: ["0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6", "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"],
          customType: false,
          hashed: false,
        },
      ],
      nodeId: "1",
    },
    { plugin: transfer, from: vault, nodeId: "3" },
    { plugin: transfer, from: vault, nodeId: "4" },
    { plugin: swapWithoutSlippage, from: vault, nodeId: "5" },
  ]);

  const FCT = batchMultiSigCall.exportFCT();
  console.log(util.inspect(FCT, false, null, true /* enable colors */));

  const signature = signTypedData({
    data: FCT.typedData as unknown as TypedMessage<TypedDataTypes>,
    privateKey: Buffer.from(key, "hex"),
    version: SignTypedDataVersion.V4,
  });

  const splitSignature = ethers.utils.splitSignature(signature);

  const signedFCT = {
    ...FCT,
    signatures: [splitSignature],
    variables: [],
    externalSigners: [],
  };

  // const version = "010101";

  // const callData = batchMultiSigCall.getCalldataForActuator({
  //   signedFCT,
  //   activator: process.env.ACTIVATOR as string,
  //   investor: ZERO_ADDRESS,
  //   purgedFCT: "0x".padEnd(66, "0"),
  //   version,
  // });

  // const gasEstimation = await utils.estimateFCTGasCost({
  //   fct: signedFCT,
  //   callData,
  //   rpcUrl: data[chainId].rpcUrl,
  //   batchMultiSigCallAddress: data[chainId].FCT_BatchMultiSig,
  // });

  // console.log("gasEstimation", gasEstimation);

  const kiroPayment = utils.getKIROPayment({
    fct: signedFCT,
    kiroPriceInETH: "38270821632831754769812",
    gasPrice: 1580000096,
    gas: 462109,
  });

  const pluginData = await batchMultiSigCall.getPluginData(3);
  console.log(pluginData);

  // const requireApprovals = await batchMultiSigCall.getAllRequiredApprovals();
  // console.log(requireApprovals);

  // const fees = utils.getPaymentPerPayer({
  //   fct: signedFCT,
  //   kiroPriceInETH: "34149170958632548614943",
  // });

  // console.log(fees);

  // fs.writeFileSync("FCT_TransferERC20.json", JSON.stringify(signedFCT, null, 2));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

// 0x
// 00000000000000000000000000000000000000000000000000000000000f4240
// 0000000000000000000000000000000000000000000000000000000000000060
// 00000000000000000000000000000000000000000000000000000000000000a0
// 0000000000000000000000000000000000000000000000000000000000000020
// 73776170203c616d6f756e743e2045544820666f72203c583e20546f6b656e73
// 0000000000000000000000000000000000000000000000000000000000000002
// 000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d6
// 0000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984

// 0x
// 00000000000000000000000000000000000000000000000000000000000f4240 amount
// 466cc669f6960e4421e91695071448f897ff8b24896d7be50c3dfd35763c11bc method bytes32
// 0000000000000000000000000000000000000000000000000000000000000060 path position
// 0000000000000000000000000000000000000000000000000000000000000002 path length
// 000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d6 path[0]
// 0000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984 path[1]
