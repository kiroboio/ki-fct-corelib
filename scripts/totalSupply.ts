import { FetchUtility } from "../src/utils";
import scriptData from "./scriptData";

const data: any = {
  token: "0x20572e4c090f15667cF7378e16FaD2eA0e2f3EfF",
  method: "approve",
  from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
  protocol: "ERC20",
  params: {
    spender: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    amount: "100000000",
    // TotalSup: undefined,
  },
};

async function main() {
  const utils = new FetchUtility({
    chainId: "5",
    rpcUrl: scriptData[5].rpcUrl,
  });

  const totalSupplies = await utils.getTokensTotalSupply([data]);

  console.log("Total supplies: ", totalSupplies);
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
