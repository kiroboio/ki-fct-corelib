import * as dotenv from "dotenv";
import { ethers } from "../src/index";
import data from "./scriptData";

dotenv.config();

const chainId = 1;
const wallet = process.env.WALLET as string;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl);

  const gas = await provider.estimateGas({
    to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    data: "0x70a08231000000000000000000000000cffad3200574698b78f32232aa9d63eabd290703",
  });

  console.log("Gas", gas.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
