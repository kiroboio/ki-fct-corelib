import * as dotenv from "dotenv";
import { ethers, utils } from "../src/index";
import data from "./scriptData";

dotenv.config();

const chainId = 1;
const wallet = process.env.WALLET as string;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl);

  const gas = await utils.getGasPriceEstimations({
    rpcUrl: data[chainId].rpcUrl,
    historicalBlocks: 20,
  });

  console.log("Gas", gas);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
