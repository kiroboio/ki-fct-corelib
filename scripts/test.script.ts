import { ethers } from "ethers";

import { getGasPrices } from "../src/utils";
import scriptData from "./scriptData";

const createRandomAddress = () => ethers.Wallet.createRandom().address;
const chainId = 5;

async function main() {
  const gasPrices = await getGasPrices({
    rpcUrl: scriptData[chainId].rpcUrl,
    chainId: chainId,
  });

  console.log(gasPrices);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
