import { AaveV2 } from "@kirobo/ki-eth-fct-provider-ts";
import { signTypedData, SignTypedDataVersion, TypedMessage } from "@metamask/eth-sig-util";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";
import util from "util";

import { BatchMultiSigCall, TypedDataTypes, utils } from "../src";
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
    maxGasPrice: "20000000000",
    expiresAt: getDate(1000000),
    builder: wallet,
    recurrency: {
      accumetable: true,
      maxRepeats: "500",
      chillTime: "0",
    },
  });

  const deposit = new AaveV2.actions.Deposit({
    chainId,
  });

  deposit.input.set({
    methodParams: {
      amount: "1000000000000000000",
      asset: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      onBehalfOf: vault,
    },
  });

  await batchMultiSigCall.createMultiple([{ plugin: deposit, from: vault, nodeId: "3" }]);

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

  // const requireApprovals = await batchMultiSigCall.getAllRequiredApprovals();
  // console.log(requireApprovals);

  // const fees = utils.getPaymentPerPayer({
  //   fct: signedFCT,
  //   kiroPriceInETH: "34149170958632548614943",
  // });

  // console.log(fees);

  fs.writeFileSync("FCT.json", JSON.stringify(signedFCT, null, 2));
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
