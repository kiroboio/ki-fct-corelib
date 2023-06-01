import { ethers } from "ethers";

import scriptData from "./scriptData";
async function main() {
  const provider = new ethers.providers.JsonRpcProvider(scriptData[1].rpcUrl);

  // Get balance at block 17385582
  const balance = await provider.getBalance(
    "0x003E36550908907c2a2dA960FD19A419B9A774b7",
    "0x" + 17385582n.toString(16) // Block number as hexstring
  );

  console.log("Balance: ", balance.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
