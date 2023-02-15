import * as dotenv from "dotenv";

import { BatchMultiSigCall, ERC20, utils } from "../src";
import scriptData from "./scriptData";
dotenv.config();

const chainId = "5";

// Address
const randomAddress = "0x" + "0".repeat(40);
// USDC contract address
const USDC = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const USDT = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";

async function main() {
  const gasPrices = await utils.getGasPrices({
    rpcUrl: scriptData[chainId].rpcUrl,
  });
  console.log("Gas prices", gasPrices);

  const fct = new BatchMultiSigCall({
    chainId,
  });

  const transferFrom = new ERC20.actions.TransferFrom({
    chainId,
    initParams: {
      to: scriptData[chainId].KIRO,
      methodParams: {
        from: USDC,
        to: USDT,
        amount: "1",
      },
    },
  });

  await fct.create({
    from: USDT,
    plugin: transferFrom,
    nodeId: "1",
  });

  // Get required approvals
  const requiredApprovals = fct.getAllRequiredApprovals();
  console.log("Required approvals", requiredApprovals);

  // const fct = new BatchMultiSigCall({
  //   chainId,
  // });
  // fct.importFCT(FCT);
  // const plugin = await fct.getPluginData(0);
  // console.log("Plugin data", plugin);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
