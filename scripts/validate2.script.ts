import { impersonateAccount, setNextBlockBaseFeePerGas } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "ethers";
import * as hre from "hardhat";
import util from "util";

import { addresses, BatchMultiSigCall } from "../src/batchMultiSigCall";
import { Interface } from "../src/helpers/Interfaces";
import FCTData from "./Failing_FCT.json";

//  ChainId 5
const actuatorAddress = "0xC434b739d2DaC17279f8fA1B66C0C7381df4909b";
const chainIdImport = 5;

const txValidator = async ({
  rpcUrl,
  chainId,
  actuatorAddress,
  calldata,
}: {
  rpcUrl: string;
  chainId: number;
  actuatorAddress: string;
  calldata: string;
}) => {
  console.time("txValidator");

  hre.config.networks.hardhat.chainId = chainId;
  if (hre.config.networks.hardhat.forking) {
    hre.config.networks.hardhat.forking.url = rpcUrl;
  } else {
    throw new Error("Something weird");
  }

  const ethers = hre.ethers;
  // Imperonate actuator
  await impersonateAccount(actuatorAddress);

  // Get ActivatorSigner
  const Actuator = await ethers.getSigner(actuatorAddress);

  const actuatorContractInterface = Interface.FCT_Actuator;
  const actuatorContractAddress = addresses[chainIdImport as keyof typeof addresses].Actuator;

  const ActuatorContract = new ethers.Contract(actuatorContractAddress, actuatorContractInterface, ethers.provider);

  try {
    await setNextBlockBaseFeePerGas(ethers.utils.parseUnits("1", "gwei"));
    console.time("tx");
    const tx = await ActuatorContract.connect(Actuator).activate(calldata, Actuator.address);
    console.timeEnd("tx");

    // Wait for tx to be mined
    const txReceipt = await tx.wait();
    // console.log(txReceipt);
    console.log(util.inspect(txReceipt, false, null, true /* enable colors */));
  } catch (err: any) {
    console.log(err);
  }
  console.timeEnd("txValidator");
};

const FCT = BatchMultiSigCall.from(FCTData);
const calldata = FCT.utils.getCalldataForActuator({
  signatures: FCTData.signatures,
  activator: actuatorAddress,
  investor: ethers.constants.AddressZero,
  purgedFCT: ethers.constants.HashZero,
});

txValidator({
  rpcUrl: "https://goerli.infura.io/v3/99229ae47ba74d21abc557bdc503a5d9",
  chainId: 5,
  calldata,
  actuatorAddress,
})
  .then(() => {
    console.log("Done, successfull");
  })
  .catch((err) => {
    console.log("Done, failed", err);
  });