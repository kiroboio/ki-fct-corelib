import { ERC20 } from "@kiroboio/fct-plugins";
import util from "util";

import { BatchMultiSigCall } from "../src";
async function main() {
  const FCT = new BatchMultiSigCall({
    chainId: "1",
  });

  const data = FCT.createPlugin({
    plugin: ERC20.getters.BalanceOf,
    initParams: {
      methodParams: {},
    },
  });

  await FCT.create({
    from: "0xF3458fc57645112de6f7993A91F6676EFE2C7D26",
    to: "0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7",
    method: "action",
    params: [
      {
        type: "uint256[3]",
        name: "data",
        value: ["10", "20", "30"],
      },
    ],
  });

  console.log("Created");

  console.log(util.inspect(FCT.exportFCT(), false, null, true /* enable colors */));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
