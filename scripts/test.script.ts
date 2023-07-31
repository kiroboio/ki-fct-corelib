import { ethers } from "ethers";

import { getGasPrices } from "../src/utils";
import scriptData from "./scriptData";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

async function main() {
  // const FCT = new BatchMultiSigCall();
  // await FCT.create({
  //   nodeId: "node1",
  //   to: createRandomAddress(),
  //   toENS: "@token.kiro.eth",
  //   method: "transfer",
  //   params: [
  //     { name: "to", type: "address", value: createRandomAddress() },
  //     { name: "token_amount", type: "uint256", value: "20" },
  //   ],
  //   from: createRandomAddress(),
  //   value: "0",
  // });
  //
  // await FCT.create({
  //   nodeId: "node2",
  //   to: createRandomAddress(),
  //   method: "erc20Airdrop",
  //   params: [
  //     { name: "token", type: "address", value: createRandomAddress() },
  //     { name: "from", type: "address", value: createRandomAddress() },
  //     { name: "amount", type: "uint256", value: createRandomAddress() },
  //     { name: "recipients", type: "address[1]", value: [createRandomAddress()] },
  //   ],
  //   from: createRandomAddress(),
  // });
  //
  // const FCTData = FCT.exportFCT();
  //
  // console.log(JSON.stringify(FCTData, null, 2));

  const gasPrices = await getGasPrices({
    rpcUrl: scriptData[5].rpcUrl,
    chainId: 5,
  });

  console.log(gasPrices);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
