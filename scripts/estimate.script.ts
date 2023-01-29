import * as dotenv from "dotenv";

import { ERC20, utils } from "../src/index";
import data from "./scriptData";
// 34149170958632548614943

dotenv.config();

const chainId = 5;
const wallet = process.env.WALLET as string;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main() {
  const gasPrices = await utils.getGasPrices({
    rpcUrl: data[chainId].rpcUrl,
  });

  console.log("Gas Prices", gasPrices);

  const createNodeData = (plugin: any) => {
    return JSON.parse(new plugin({ chainId: "5" }).toJSON());
  };

  const transfer = new ERC20.actions.Transfer({
    chainId: "5",
  });

  console.log(createNodeData(transfer));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
