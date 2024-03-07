// // Init dotenv
import { FlashbotsBundleProvider, FlashbotsTransactionResolution } from "@flashbots/ethers-provider-bundle";
import * as dotenv from "dotenv";
import { ethers, Wallet } from "ethers";

import { scriptData } from "./scriptData";

dotenv.config();

const CHAIN_ID = 11155111;
// const FLASHBOTS_EP = "https://relay-sepolia.flashbots.net";
const FLASHBOTS_EP = scriptData[CHAIN_ID].flashbotsRelay;
// const FLASHBOTS_EP = "https://boost-relay-sepolia.flashbots.net";
const FLASHBOTS_PROTECT = scriptData[CHAIN_ID].flashbotsRpc;

const provider = new ethers.providers.JsonRpcProvider(scriptData[CHAIN_ID].rpcUrl);

async function main() {
  const wallet = new Wallet(process.env.TEST_PRIVATE_KEY as string, provider);
  const flashbotsProvider = await FlashbotsBundleProvider.create(provider, wallet, FLASHBOTS_EP);
  const protectProvider = new ethers.providers.JsonRpcProvider(FLASHBOTS_PROTECT, CHAIN_ID);

  const tx = {
    to: "0x9297e49dEac4F4AFeEF452D90F21576C3B8A973B",
    // gasPrice: await provider.getGasPrice(),
    gasPrice: ethers.utils.parseUnits("2", "gwei"),
    gasLimit: 21000,
    data: "0x",
    value: ethers.utils.parseEther("0.00001231234"),
    nonce: await provider.getTransactionCount(wallet.address),
    chainId: CHAIN_ID,
  };

  const signedTransactions = await flashbotsProvider.signBundle([
    {
      signer: wallet,
      transaction: tx,
    },
  ]);

  const targetBlock = (await provider.getBlockNumber()) + 2;
  const simRes = await flashbotsProvider.simulate(signedTransactions, targetBlock);

  if ("error" in simRes) {
    console.warn(`Simulation Error: ${simRes.error.message}`);
    process.exit(1);
  } else {
    console.log(`Simulation Success: ${JSON.stringify(simRes, null, 2)}`);
  }

  const rawTx = await flashbotsProvider.sendPrivateTransaction(
    {
      signer: wallet,
      transaction: tx,
    },
    {
      maxBlockNumber: targetBlock,
    },
  );

  console.log("bundle submitted, waiting");
  if ("error" in rawTx) {
    throw new Error(rawTx.error.message);
  }

  // const receipt = await rawTx.receipts();
  console.log("Waiting...");
  const waitResponse = await rawTx.wait();
  console.log(`Waited: ${waitResponse}`);

  if (waitResponse === FlashbotsTransactionResolution.TransactionDropped) {
    console.error("TX dropped");
    process.exit(0);
  } else {
    console.log("TX included");
    console.log("Receipt", await rawTx.receipts());
    // console.log({
    //   bundleStats: await flashbotsProvider.getBundleStats(simulation.bundleHash, targetBlock),
    //   bundleStatsV2:
    //     process.env.TEST_V2 && (await flashbotsProvider.getBundleStatsV2(simulation.bundleHash, targetBlock)),
    //   userStats: await userStats,
    // });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
