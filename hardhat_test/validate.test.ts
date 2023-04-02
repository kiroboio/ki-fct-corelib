import { ethers } from "hardhat";

import { addresses, BatchMultiSigCall } from "../src/batchMultiSigCall";
import { Interface } from "../src/helpers/Interfaces";
import FCTData from "./Failing_FCT.json";

// ChainId 5
const ActivatorAccount = "0xC434b739d2DaC17279f8fA1B66C0C7381df4909b";

describe("Validate FCT", function () {
  // Take provider from hardhat
  const provider = ethers.provider;

  const FCT = BatchMultiSigCall.from(FCTData);
  const chainId = Number(FCT.chainId);

  const actuatorInterface = Interface.FCT_Actuator;
  const actuatorAddress = addresses[chainId as keyof typeof addresses].Actuator;

  const Actuator = new ethers.Contract(actuatorAddress, actuatorInterface, provider);
  it("Should succeed", async function () {
    const Activator = await ethers.getImpersonatedSigner(ActivatorAccount);

    // Run tx
    const calldata = FCT.utils.getCalldataForActuator({
      signatures: FCTData.signatures,
      activator: Activator.address,
      investor: ethers.constants.AddressZero,
      purgedFCT: ethers.constants.HashZero,
    });

    try {
      const tx = await Actuator.connect(Activator).activate(calldata, Activator.address);

      // Wait for tx to be mined
      const txReceipt = await tx.wait();
      console.log(txReceipt);
    } catch (err: any) {
      console.log(err);
    }
  });
});
