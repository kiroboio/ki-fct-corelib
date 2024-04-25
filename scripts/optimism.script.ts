import { signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util";
import console from "console";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

import { BatchMultiSigCall, ERC20 } from "../src";
import { scriptData } from "./scriptData";

// https://optimistic.etherscan.io/tx/0x539a3e0c467db892ff365f4fa8f2bc02fe0586995cb85970bdd07f16087a324e
// Payer fee 0.00019302448 ETH -> 0.61 USD
// Fee of the TX -> 0.56 USD

dotenv.config();

const Actuator_ABI = [
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "address",
        name: "activator",
        type: "address",
      },
    ],
    name: "activate",
    outputs: [
      {
        internalType: "uint256",
        name: "activatorPaymentOrFees",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "builder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "call",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalTokenFees",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenPayed",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nativePayed",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "builderPayment",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "activatorPayment",
        type: "uint256",
      },
    ],
    name: "FCTE_CallPayment",
    type: "event",
  },
];

// const chainId = 11155111;
// const chainId = 5;
// const chainId = 1;
const chainId = 10;

const provider = new ethers.providers.JsonRpcProvider(scriptData[chainId].rpcUrl);
const USDC = scriptData[chainId].USDC;
// 0.001 USDC
const amount = ethers.utils.parseUnits("0.0001", 6).toString();

async function main() {
  const privateKey = process.env.OP_PK as string;
  const activatorKey = process.env.ACTIVATOR_PRIVATE_KEY as string;
  const vault = "0xf579ace66051d87570d99394e647cce7983ad128";

  const Wallet = new ethers.Wallet(privateKey, provider);
  const Activator = new ethers.Wallet(activatorKey, provider);
  const Actuator = new ethers.Contract(scriptData[chainId].Actuator, Actuator_ABI, Activator);

  const FCT = new BatchMultiSigCall({
    chainId: 10,
    options: {
      validFrom: String(Math.floor(Date.now() / 1000) - 10),
      authEnabled: false,
      maxGasPrice: ethers.utils.parseUnits("0.2", "gwei").toString(),
    },
  });

  FCT.version = "0x020103";

  const Transfer = new ERC20.actions.Transfer({
    chainId: "10",
    initParams: {
      to: USDC,
      methodParams: {
        recipient: "0xe02c9f5d6b3bdec3c1ee28a5a5f01ee5755ef36b",
        amount,
      },
    },
  });

  const BalanceOf = new ERC20.getters.BalanceOf({
    chainId: "10",
    initParams: {
      to: USDC,
      methodParams: {
        owner: "0xe02c9f5d6b3bdec3c1ee28a5a5f01ee5755ef36b",
      },
    },
  });

  // Do the add 8 times
  for (let i = 0; i < 8; i++) {
    await FCT.add({
      plugin: Transfer,
      from: vault,
    });

    await FCT.add({
      plugin: BalanceOf,
      from: vault,
    });
  }

  // await FCT.add({
  //   plugin: Transfer,
  //   from: vault,
  // });

  const exported = FCT.export();

  console.log(JSON.stringify(exported, null, 2));

  const sigString = signTypedData({
    data: exported.typedData as any,
    privateKey: Buffer.from(privateKey.slice(2), "hex"),
    version: SignTypedDataVersion.V4,
  });

  const signature = ethers.utils.splitSignature(sigString);

  const calldata = FCT.utils.getCalldataForActuator({
    activator: Activator.address,
    signatures: [exported.signatures[0], signature],
  });

  // Estimate gas
  const gasEstimate = await Actuator.estimateGas.activate(calldata, Activator.address);
  console.log(`Gas estimate: ${gasEstimate.toString()}`);

  // Execute
  const tx = await Actuator.activate(calldata, Activator.address, {
    gasPrice: ethers.utils.parseUnits("0.2", "gwei"),
  });
  console.log(`Transaction hash: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  console.log(JSON.stringify(receipt, null, 2));

  // From the receipt get the event
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
