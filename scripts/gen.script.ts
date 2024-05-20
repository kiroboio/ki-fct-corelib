import * as dotenv from "dotenv";
import { writeFileSync } from "fs";

import tokenList from "../tokensList.json";

dotenv.config();

const chainId = "1";
async function main() {
  const mappedData = tokenList
    .filter((token) => token.chainId === 8453)
    .map((token) => {
      return {
        chainId: 8453,
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        logoURI: token.logoURI,
      };
    });

  // Save it as JSON
  writeFileSync("baseTokens.json", JSON.stringify(mappedData, null, 2));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
