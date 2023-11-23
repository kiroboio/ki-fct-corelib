// Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall } from "../src";

dotenv.config();

const activator = "0x4c508dc4a3aacbecbf13c1d543b4936274033110";

async function main() {
  const FCT = new BatchMultiSigCall({
    chainId: "1",
  });

  FCT.addComputed({
    id: "32",
    type: "computed",
    value1: "1",
    operator1: "+",
    value2: "12",
    operator2: "+",
    value3: "0",
    operator3: "/",
    value4: "1000",
    overflowProtection: true,
  });

  await FCT.add({
    nodeId: "966b50af-b432-43af-aae3-f9f1014c7900",
    to: "0x4c508dc4a3aacbecbf13c1d543b4936274033110",
    from: "0x4c508dc4a3aacbecbf13c1d543b4936274033110",
    method: "activate",
    params: [
      {
        value: { type: "computed", id: "32" },
        type: "uint256",
        name: "amount",
      },
    ],
  });

  // FCT.addComputed({
  //   id: "0d286110-3ea4-4f65-a69e-a1afb3b71585",
  //   type: "computed",
  //   value1: "1047390746235513469810",
  //   operator1: "/(10**X)",
  //   value2: "12",
  //   operator2: "+",
  //   value3: {
  //     type: "output",
  //     id: {
  //       innerIndex: 1,
  //       nodeId: "966b50af-b432-43af-aae3-f9f1014c7900",
  //     },
  //   },
  //   operator3: "/",
  //   value4: "1000",
  //   overflowProtection: true,
  // });

  const data = FCT.export();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
