import { ERC20 } from "@kiroboio/fct-plugins";
import { ethers } from "ethers";

import { BatchMultiSigCall } from "../src";

async function main() {
  const FCT = new BatchMultiSigCall();

  await FCT.add({
    from: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
    plugin: new ERC20.actions.Transfer({
      chainId: "5",
      initParams: {
        to: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
        methodParams: {
          amount: "200",
          recipient: ethers.constants.AddressZero,
        },
      },
    }),
  });

  const maxGas = FCT.utils.getMaxGas();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
