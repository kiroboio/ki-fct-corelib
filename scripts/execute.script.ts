// // Init dotenv
import { signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util";
import * as dotenv from "dotenv";
import { ethers, Wallet } from "ethers";

import { BatchMultiSigCall, ERC20 } from "../src";
import { Interfaces } from "../src/helpers/Interfaces";
import scriptData from "./scriptData";

dotenv.config();

const ChainID = "8453";

const provider = new ethers.providers.JsonRpcProvider(scriptData[ChainID].rpcUrl);

const FCT = new BatchMultiSigCall({
  chainId: ChainID,
  options: {
    validFrom: "0",
    maxGasPrice: ethers.utils.parseUnits("0.3", "gwei").toString(),
  },
});

FCT.version = "0x020103";

const pk = process.env.OP_PK as string;
const activator_pk = process.env.ACTIVATOR_PRIVATE_KEY as string;
const vault = "0x13165808Ed2cd59060E9Fa0a9DFB946cA36b1DCB";

const User = new Wallet(pk, provider);
console.log(User.address);
const Activator = new Wallet(activator_pk, provider);
const Actuator = new ethers.Contract(scriptData[ChainID].Actuator, Interfaces.FCT_Actuator, Activator);

async function main() {
  const Transfer = new ERC20.actions.Transfer({
    chainId: ChainID,
    initParams: {
      to: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
      methodParams: {
        recipient: "0xE02c9F5D6b3bDEc3C1EE28A5a5F01ee5755EF36b",
        amount: "1" + "0".repeat(6),
      },
    },
  });

  await FCT.add({
    from: vault,
    plugin: Transfer,
  });

  const fct = FCT.export();

  console.log(JSON.stringify(fct, null, 2));

  const signature = signTypedData({
    data: fct.typedData as any,
    privateKey: Buffer.from(pk.slice(2), "hex"),
    version: SignTypedDataVersion.V4,
  });

  const splitSig = ethers.utils.splitSignature(signature);

  const signatures = [fct.signatures[0], splitSig];
  console.log(signatures);

  const calldata = FCT.utils.getCalldataForActuator({
    signatures: [fct.signatures[0], splitSig],
    activator: Activator.address,
  });

  // Estimate gas Activator.activate
  const gas = await Actuator.estimateGas.activate(calldata, Activator.address, {
    gasPrice: ethers.utils.parseUnits("0.13", "gwei").toString(),
  });

  const gasPrice = await provider.getGasPrice();

  // Execute
  const tx = await Actuator.activate(calldata, Activator.address, {
    gasPrice,
    gasLimit: gas.mul(10).div(9),
  });
  console.log(tx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // console.error(error);
    console.log(error);
    process.exitCode = 1;
  });
