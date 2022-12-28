import { ERC20, FCT_UNISWAP, Uniswap } from "@kirobo/ki-eth-fct-provider-ts";
import { signTypedData, SignTypedDataVersion, TypedMessage } from "@metamask/eth-sig-util";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import fs from "fs";
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

  const swapWithoutSlippage = new FCT_UNISWAP.actions.SwapWithoutSlippageProtection({
    chainId: "1",
    initParams: {
      to: data[chainId].KIRO,
      methodParams: {
        amount: "1000",
        path: [data[chainId].KIRO, data[chainId].USDC],
        method: keccak256(toUtf8Bytes("swap <amount> Tokens for <X> ETH")),
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
      nodeId: "1",
      value: "100",
      params: [],
      to: data[chainId].KIRO,
      options: {
        callType: "LIBRARY",
        falseMeansFail: true,
        jumpOnFail: "3",
      },
    },
    { plugin: swap, from: wallet, nodeId: "2" },
    { plugin: transfer, from: vault, nodeId: "3" },
    { plugin: swapWithoutSlippage, from: vault, nodeId: "4" },
  ]);

  const FCT = await batchMultiSigCall.exportFCT();
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

  const version = "010101";

  const callData = batchMultiSigCall.getCalldataForActuator({
    signedFCT,
    activator: process.env.ACTIVATOR as string,
    investor: ZERO_ADDRESS,
    purgedFCT: "0x".padEnd(66, "0"),
    version,
  });

  // const gasEstimation = await utils.estimateFCTGasCost({
  //   fct: signedFCT,
  //   callData,
  //   rpcUrl: data[chainId].rpcUrl,
  //   batchMultiSigCallAddress: data[chainId].FCT_BatchMultiSig,
  // });

  // console.log("gasEstimation", gasEstimation);

  // const kiroPayment = await utils.getKIROPayment({
  //   fct: signedFCT,
  //   kiroPriceInETH: "38270821632831754769812",
  //   gasPrice: 1580000096,
  //   gas: 462109,
  // });

  // console.log("kiroPayment", kiroPayment);

  // Import decoded calldata
  // const newBatchMultiSigCall = new BatchMultiSigCall({
  //   provider: new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl),
  //   contractAddress: data[chainId].FCT_Controller,
  // });
  // const decoded = await newBatchMultiSigCall.importEncodedFCT(callData);
  // console.log(util.inspect(decoded, false, null, true /* enable colors */));

  const fees = utils.getMaxKIROCostPerPayer({
    fct: signedFCT,
    kiroPriceInETH: "38270821632831754769812",
  });

  console.log(fees);

  fs.writeFileSync("FCT_TransferERC20.json", JSON.stringify(signedFCT, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
