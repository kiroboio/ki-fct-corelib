// // Init dotenv
import * as dotenv from "dotenv";

import { ethers } from "../src";

dotenv.config();

const randAddr = () => ethers.Wallet.createRandom().address;

// {
//   fromBlock: 19212714,
//   toBlock: 19222821,
//   address: [
//     '0x4fF4C72506f7E3630b81c619435250bD8aB6c03c',
//     '0x0A0ea58E6504aA7bfFf6F3d069Bd175AbAb638ee',
//     '0x74fe4729c31002c817a2c57cbe67fa37e62cf2f0',
//     '0x1332e1A702DaC73523708F95827E6b706DAE5fD9'
//   ],
//   topics: [
//     [
//       '0xc1c96a431209ed429ded4044b796af4798c0ad77c83d47768f5cc6885762ea8b',
//       '0x88c6460cd7091ad3c8bd1623f14728cacc7a57cb16ee4b7887126b1db3435a0c',
//       '0x3a48c1ec2337406c590a8fa1aefe827430d6c1623e3715936e47fc8fa5299412',
//       '0x4270bc8453a68d7cab756e480b343ddc1330eed51f2b0de785f5957efc1e4b2f',
//       '0x57a285d11c52114e1c932af91ce610073cb95f99c6126bf75c6a59b3846e0d6a',
//       '0xdd236dbbae4d9b3e1c5bb780751a96188a7a4b7fce23dabc0c752dd73543b07d',
//       '0xff671bd7aa9ee34f1d57da96fa35321d178d13a69617869f58ca118532e568f1'
//     ]
//   ]
// }

// {
//   fromBlock: 19212714,
//   toBlock: 19222821,
//   address: [ '0x1332e1A702DaC73523708F95827E6b706DAE5fD9' ],
//   topics: [
//     [
//       '0x12f4534f5c9225ea7de6a6416beb819da55b06cd426cbf4132df498cfc034531',
//       '0x38d0f07c5c38cdf4b7a7a5d1b186e767af7e30a7aacc0870f139665c208d802b',
//       '0x472e840cc2d0c0bb1e95c6114c71e0f20c0ae5e5342352984fe23c1512242939',
//       '0xb241ad3b49f38214d7fb28935594f0f8a8fd10728e4bb40023e6139ac4c2d4a1',
//       '0x77585c5726b0667b7368038e89f6f6846b7c17ef41323cd6a26fd67fb46744d8',
//       '0xba9f470c299fb2ca18622854c98d3d36f7690464ce4a598bfe4d29e6a2aa4e93',
//       '0x0c03a440d49606e16097e4df935a30db3dfd14374a0b7b68abb00ee19cc09185'
//     ]
//   ]
// }
// 181

// {
//   fromBlock: '0x12529aa',
//   toBlock: '0x1255141',
//   topics: [
//     [
//       '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//       '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
//       '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
//       '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
//       '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c'
//     ]
//   ]
// }

async function main() {
  const rpcUrl = "https://virtual.mainnet.rpc.tenderly.co/bcd2e42f-c092-461a-be5a-c55fffbf8907";
  const startBlock = 19212713;
  const endBlock = 19222821;

  // Fetch logs from rpcUrl
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  console.log("Fetching logs from block ", startBlock, " to block ", endBlock);
  const allLogs = await provider.getLogs({
    fromBlock: startBlock,
    toBlock: endBlock,
    topics: [
      [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
        "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62",
        "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65",
        "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c",
      ],
    ],
  });

  // Go through the logs and check if the next log has higher block number
  for (let i = 0; i < allLogs.length; i++) {
    const log = allLogs[i];
    const nextLog = allLogs[i + 1];
    if (nextLog && log.blockNumber > nextLog.blockNumber) {
      console.log("Log ", i, " has higher block number than log ", i + 1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
