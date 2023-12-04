// // Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ethers, Utility } from "../src";

dotenv.config();

const activator = "0x4c508dc4a3aacbecbf13c1d543b4936274033110";

async function main() {
  const FCT = new BatchMultiSigCall({
    chainId: "1",
  });

  const ETHTransfer = new Utility.actions.SendETH({
    chainId: "5",
    initParams: {
      to: ethers.Wallet.createRandom().address,
      value: "1" + "0".repeat(18),
    },
  });

  await FCT.add({
    plugin: ETHTransfer,
    from: "0x4c508dc4a3aacbecbf13c1d543b4936274033110",
  });

  const data = FCT.export();

  console.log(JSON.stringify(data, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
