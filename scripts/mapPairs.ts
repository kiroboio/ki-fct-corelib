import { ethers } from "ethers";
import fs from "fs";

import logs from "../logs.json";
import data from "./scriptData";

const ABI = ["event PairCreated(address indexed token0, address indexed token1, address pair, uint)"];

const chainId = "5";

const FACTORY_CONTRACT = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const provider = new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl);
const Factory = new ethers.Contract(FACTORY_CONTRACT, ABI, provider);

async function main() {
  const data = [
    {
      blockNumber: 4969426,
      blockHash: "0x4ccca06c510e3e23ecbe1a2a4c6fee837ec7adf45e84ff5085b524de95c2cc28",
      transactionIndex: 3,
      removed: false,
      address: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
      data: "0x000000000000000000000000c00cdf34783435752c447d657639e81cb1f126ae0000000000000000000000000000000000000000000000000000000000001349",
      topics: [
        "0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9",
        "0x000000000000000000000000433cff91e5b905a7d52131c9c24f041181d3edb7",
        "0x000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d6",
      ],
      transactionHash: "0x55606eff87ea6c4e365da68cada4d6d77f17ee13dd551d2edec95157f55d2315",
      logIndex: 1,
    },
  ];

  const decodedData = (logs as any[]).map((log) => {
    const decoded = Factory.interface.decodeEventLog("PairCreated", log.data, log.topics);
    return {
      chainId: 5,
      address: decoded.pair,
      name: "Uniswap V2",
      symbol: "UNI-V2",
      decimals: 18,
      assets: [decoded.token0, decoded.token1],
    };
  });

  console.log(decodedData.length);

  fs.writeFileSync("UniV2_Pairs_Goerli.json", JSON.stringify(decodedData, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
