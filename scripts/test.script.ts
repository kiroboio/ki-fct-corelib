import { ethers } from "ethers";

import { BatchMultiSigCall } from "../src";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = new BatchMultiSigCall();
  await FCT.create({
    nodeId: "node1",
    to: createRandomAddress(),
    toENS: "@token.kiro.eth",
    method: "transfer",
    params: [
      { name: "to", type: "address", value: createRandomAddress() },
      { name: "token_amount", type: "uint256", value: "20" },
    ],
    from: createRandomAddress(),
    value: "0",
  });

  await FCT.create({
    nodeId: "node2",
    to: createRandomAddress(),
    method: "erc20Airdrop",
    params: [
      { name: "token", type: "address", value: createRandomAddress() },
      { name: "from", type: "address", value: createRandomAddress() },
      { name: "amount", type: "uint256", value: createRandomAddress() },
      { name: "recipients", type: "address[]", value: [] },
    ],
    from: createRandomAddress(),
  });

  const FCTData = FCT.exportFCT();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
