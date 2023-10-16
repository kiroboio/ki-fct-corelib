import { AaveV2 } from "@kiroboio/fct-plugins";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

// import util from "util";
import { BatchMultiSigCall } from "../src";

dotenv.config();

const chainId = "5";
const wallet = process.env.WALLET as string;
async function main() {
  const vault = process.env.VAULT as string;
  const key = process.env.PRIVATE_KEY as string;

  // Get address from private key
  const address = ethers.utils.computeAddress("0x" + key);
  console.log("address", address);

  const batchMultiSigCall = new BatchMultiSigCall({
    chainId,
  });

  const Plugin = new AaveV2.actions.Deposit({
    chainId: "1",
    initParams: {
      methodParams: {
        amount: "1",
        onBehalfOf: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
        asset: "0x6b175474e89094c44da98b954eedeac495271d0f",
      },
    },
  });

  await batchMultiSigCall.create({
    from: ethers.Wallet.createRandom().address,
    plugin: Plugin,
  });

  const approvals = await batchMultiSigCall.utils.getAllRequiredApprovals();

  console.log(approvals);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
