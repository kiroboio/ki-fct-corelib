// Init dotenv
import console from "console";
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ERC20 } from "../src";

dotenv.config();

async function main() {
  const FCT = new BatchMultiSigCall({
    chainId: "1",
  });

  const Transfer = new ERC20.actions.Transfer({
    chainId: "1",
    initParams: {
      to: "0x4c508dc4a3aacbecbf13c1d543b4936274033110",
      methodParams: {
        amount: "1000000000000000000",
        recipient: "0x4c508dc4a3aacbecbf13c1d543b4936274033110",
      },
    },
  });

  await FCT.add({
    nodeId: "randomNodeIdHere",
    plugin: Transfer,
    from: "0x4c508dc4a3aacbecbf13c1d543b4936274033110",
  });

  const map = FCT.exportMap();
  const FCTData = FCT.export();

  // const FCT2 = BatchMultiSigCall.fromWithMap(FCTData, map);
  const FCT2 = BatchMultiSigCall.from(FCTData);

  console.log(FCT2.calls);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
