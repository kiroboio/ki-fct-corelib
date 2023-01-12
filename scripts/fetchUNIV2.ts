import { ethers } from "ethers";
import fs from "fs";

import data from "./scriptData";

const ABI = ["event PairCreated(address indexed token0, address indexed token1, address pair, uint)"];

const chainId = "5";

const FACTORY_CONTRACT = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const provider = new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl);
const Factory = new ethers.Contract(FACTORY_CONTRACT, ABI, provider);

async function main() {
  const blockNumber = await provider.getBlockNumber();
  const contractCreationBlock = 2638438;
  const jump = 2500;

  const filter = Factory.filters.PairCreated();

  // Create a loop where we fetch logs in batches of 3000 blocks
  for (let i = contractCreationBlock; i < blockNumber; i += jump) {
    const getData = async () => {
      try {
        const toBlock = Math.min(i + jump, blockNumber);
        const logs = await provider.getLogs({ ...filter, fromBlock: i, toBlock });
        if (logs.length > 0) {
          console.log(`Fetched logs from block ${i} to ${toBlock}`);
          const logsFile = fs.readFileSync("logs.json", "utf8");
          const logsJSON = JSON.parse(logsFile);
          fs.writeFileSync("logs.json", JSON.stringify([...logsJSON, ...logs], null, 2));
        }
      } catch (error) {
        console.log(`Error fetching logs from block ${i} to ${i + jump}`, error);
        getData();
      }
    };
    await getData();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//   const logs = await provider.getLogs({ ...filter, fromBlock: blockNumber - 3000, toBlock: "latest" });
//   console.log(logs.length);
