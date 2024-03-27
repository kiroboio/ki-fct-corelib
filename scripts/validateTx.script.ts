import console from "console";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

import { BatchMultiSigCall } from "../src";
import FCTActuatorABI from "../src/abi/FCT_Actuator.abi.json";
import FCTFail from "./ff.json";
import { scriptData } from "./scriptData";

dotenv.config();

const FCTData = FCTFail.data;

// const chainId = 11155111;
// const chainId = 5;
const chainId = 1;

const provider = new ethers.providers.JsonRpcProvider(scriptData[chainId].rpcUrl);
const activator = "0xC434b739d2DaC17279f8fA1B66C0C7381df4909b";
const actuatorContractAddress = "0x1332e1A702DaC73523708F95827E6b706DAE5fD9";

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const calldata = FCT.utils.getCalldataForActuator({
    signatures: [FCTData.signatures[0], ...FCTFail.signers.map((i) => i.signature)],
    activator,
    investor: ethers.constants.AddressZero,
    purgedFCT: ethers.constants.HashZero,
  });

  const actuatorContract = new ethers.Contract(actuatorContractAddress, FCTActuatorABI, provider);
  const actualCalldata = actuatorContract.interface.encodeFunctionData("activate", [calldata, activator]);

  console.log("data", {
    from: activator,
    to: actuatorContractAddress,
    data: actualCalldata,
    gasPrice: FCT.options.maxGasPrice,
    timestamp: +FCT.options.expiresAt - 1,
  });

  // const tx = await transactionValidator({
  //   callData: calldata,
  //   actuatorContractAddress: "0x1332e1A702DaC73523708F95827E6b706DAE5fD9",
  //   activator,
  //   rpcUrl: scriptData[chainId].rpcUrl,
  //   activateForFree: false,
  //   gasPrice: { maxFeePerGas: FCT.options.maxGasPrice, maxPriorityFeePerGas: "0" },
  // });

  // console.log("res", tx);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
