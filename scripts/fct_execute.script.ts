import * as dotenv from "dotenv";
import { BatchMultiSigCall, ethers, utils } from "../src/index";
import FCT from "../FCT_TransferERC20.json";
import data from "./scriptData";

dotenv.config();

const chainId = 5;
const wallet = process.env.WALLET as string;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl);
  const batchMultiSigCall = new BatchMultiSigCall({
    provider: new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl),
    contractAddress: data[chainId].FCT_Controller,
  });

  // Zero bytes
  const bytes = "0x0000000000000000000000000000000000000000000000000000000000000000";

  const calldata = await batchMultiSigCall.getCalldataForActuator({
    actuatorAddress: data[chainId].Actuator,
    signedFCT: FCT,
    activator: process.env.ACTIVATOR as string,
    investor: ZERO_ADDRESS,
    purgedFCT: bytes,
  });

  const gas = await provider.estimateGas({
    to: "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60",
    from: "0x57668cab869c1c99ff5b1749aa9e80d645effa4e",
    data: "0xa9059cbb00000000000000000000000057668cab869c1c99ff5b1749aa9e80d645effa4e0000000000000000000000000000000000000000000000008ac7230489e80000",
  });

  console.log("Gas", gas.toString());

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
