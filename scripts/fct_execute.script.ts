import * as dotenv from "dotenv";
import { BatchMultiSigCall, ethers, utils } from "../src/index";
import FCT from "../FCT_TransferERC20.json";

import data from "./scriptData";

dotenv.config();

const chainId = 5;
const wallet = process.env.WALLET as string;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// Zero bytes
const bytes = "0x0000000000000000000000000000000000000000000000000000000000000000";

async function main() {
  const batchMultiSigCall = new BatchMultiSigCall({
    provider: new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl),
    contractAddress: data[chainId].FCT_Controller,
  });

  const version = "010101";
  const activateId = `0x${version}`.padEnd(66, "0");

  const calldata = await batchMultiSigCall.getCalldataForActuator({
    signedFCT: FCT,
    activator: process.env.ACTIVATOR as string,
    investor: ZERO_ADDRESS,
    purgedFCT: "0x".padEnd(66, "0"),
    activateId,
  });

  const txData = await utils.transactionValidator({
    rpcUrl: data[chainId].rpcUrl,
    callData: calldata,
    actuatorPrivateKey: process.env.ACTIVATOR_PRIVATE_KEY as string,
    actuatorContractAddress: data[chainId].Actuator,
    activateForFree: false,
  });

  // const provider = new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl);
  // const signer = new ethers.Wallet(process.env.ACTIVATOR_PRIVATE_KEY as string, provider);

  // const actuatorContract = new ethers.Contract(data[chainId].Actuator, FCTActuatorABI, signer);

  // console.log(txData);

  // const tx = await actuatorContract.activate(calldata, signer.address);

  // console.log(tx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
