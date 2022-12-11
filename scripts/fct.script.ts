import { BatchMultiSigCall } from "../src/batchMultiSigCall";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "fs";
import { ERC20, Uniswap } from "@kirobo/ki-eth-fct-provider-ts";
import { signTypedData, SignTypedDataVersion, TypedMessage } from "@metamask/eth-sig-util";
import { TypedDataTypes } from "../src/batchMultiSigCall/interfaces";
import data from "./scriptData";
import { utils } from "../src/index";
import util from "util";
// import util from "util";

dotenv.config();
// eslint-disable-next-line
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function getDate(days: number = 0) {
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

  const batchMultiSigCall = new BatchMultiSigCall({
    provider: new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl),
    contractAddress: data[chainId].FCT_Controller,
  });

  batchMultiSigCall.setOptions({
    maxGasPrice: "3000000000",
    expiresAt: getDate(10),
    recurrency: {
      accumetable: true,
      maxRepeats: "1000",
      chillTime: "1",
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
    },

    { plugin: swap, from: vault, nodeId: "2" },
    { plugin: transfer, from: vault, nodeId: "3" },
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

  // Decode calldata
  const decoded = batchMultiSigCall.decodeFCT(callData);
  console.log(util.inspect(decoded, false, null, true /* enable colors */));

  const gasEstimation = await utils.getFCTGasEstimation({
    fct: signedFCT,
    callData,
    rpcUrl: data[chainId].rpcUrl,
    batchMultiSigCallAddress: data[chainId].FCT_BatchMultiSig,
  });

  console.log("gasEstimation", gasEstimation);

  const hadshashda = await utils.getKIROPayment({
    fct: signedFCT,
    kiroPriceInETH: "38270821632831754769812",
    gasPrice: 1580000096,
    gasLimit: 462109,
  });

  console.log("hadshashda", hadshashda);

  fs.writeFileSync("FCT_TransferERC20.json", JSON.stringify(signedFCT, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
