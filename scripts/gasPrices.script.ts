import * as dotenv from "dotenv";

import { getGasPrices } from "../src/utils";
import { scriptData } from "./scriptData";

dotenv.config();

// const FCTData = FCTFail.data;

// const chainId = 11155111;
// const chainId = 5;
const chainId = 1;
// const chainId = 42161;

// const provider = new ethers.providers.JsonRpcProvider(scriptData[chainId].rpcUrl);
// const activator = "0xC434b739d2DaC17279f8fA1B66C0C7381df4909b";
// const actuatorContractAddress = "0x1332e1A702DaC73523708F95827E6b706DAE5fD9";

async function main() {
  const gasPrices = await getGasPrices({
    rpcUrl: scriptData[chainId].rpcUrl,
    chainId,
  });

  console.log("Gas prices", gasPrices);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
