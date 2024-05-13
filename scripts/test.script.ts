// // Init dotenv
import * as dotenv from "dotenv";

import { FetchUtility } from "../src/utils";
import scriptData from "./scriptData";

dotenv.config();

const ChainID = "1";

async function main() {
  const fetchUtility = new FetchUtility({
    rpcUrl: scriptData[ChainID].rpcUrl,
    chainId: ChainID,
  });

  const requiredApprovals = [
    {
      protocol: "ERC20",
      from: "0xe02c9f5d6b3bdec3c1ee28a5a5f01ee5755ef36b",
      method: "approve",
      token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      params: {
        spender: "0xf579ace66051d87570d99394e647cce7983ad128",
        amount: "5000",
      },
    },
  ] as any;

  const totalSupplies = await fetchUtility.getTokensTotalSupply(requiredApprovals);

  console.log("totalsupplies", totalSupplies);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
