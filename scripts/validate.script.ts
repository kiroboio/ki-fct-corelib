import console from "console";
import * as dotenv from "dotenv";
import { ethers, utils } from "ethers";

import { scriptData } from "./scriptData";

dotenv.config();

const chainId = 11155111;
// const chainId = 5;
// const chainId = 1;

const provider = new ethers.providers.JsonRpcProvider(scriptData[chainId].rpcUrl);
// const flashbotsProvider = new ethers.providers.JsonRpcProvider(scriptData[chainId].flashbots);

async function main() {
  // defining the wallet private key
  // MM Test1
  const privateKey = process.env.TEST_PRIVATE_KEY as string;
  // MM Test2
  const receiver = "0x9297e49dEac4F4AFeEF452D90F21576C3B8A973B";
  const wallet = new ethers.Wallet(privateKey, provider);
  const nonce = await wallet.getTransactionCount();
  const blockNumber = await provider.getBlockNumber();

  // print the wallet address
  console.log("Using wallet address " + wallet.address, blockNumber);

  // Get gas
  const gas = await provider.getFeeData();

  console.log("Gas: ", gas);

  const transaction = {
    to: receiver,
    value: ethers.utils.parseEther("0.0001").toString(),
    gasLimit: "21000",
    maxPriorityFeePerGas: gas.maxPriorityFeePerGas?.toString() || "0",
    maxFeePerGas: gas.maxFeePerGas?.toString() || "0",
    nonce,
    type: 2,
    chainId,
  };

  console.log("Transaction: ", transaction, "\n");

  // sign and serialize the transaction
  const signedTransaction = await wallet.signTransaction(transaction);

  // {
  //   "jsonrpc": "2.0",
  //   "id": 1,
  //   "method": "eth_callBundle",
  //   "params": [
  //     {
  //       txs,               // Array[String], A list of signed transactions to execute in an atomic bundle
  //       blockNumber,       // String, a hex encoded block number for which this bundle is valid on
  //       stateBlockNumber,  // String, either a hex encoded number or a block tag for which state to base this simulation on. Can use "latest"
  //       timestamp,         // (Optional) Number, the timestamp to use for this bundle simulation, in seconds since the unix epoch
  //     }
  //   ]
  // }

  const data = {
    txs: [signedTransaction],
    // blockNumber: "0x" + ((await provider.getBlockNumber()) + 1).toString(16),
    blockNumber: "0x" + blockNumber.toString(16),
    stateBlockNumber: "latest",
  };

  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_callBundle",
    params: [data],
  };

  const signature = wallet.address + ":" + (await wallet.signMessage(utils.id(JSON.stringify(body))));

  console.log("Body: ", JSON.stringify(body, null, 2));

  // Make POST request
  const res = await fetch(scriptData[chainId].flashbots, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Flashbots-Signature": signature,
    },
    body: JSON.stringify(body),
  });

  console.log("Res: ", JSON.stringify(await res.json(), null, 2));

  // print the raw transaction hash
  // console.log("Raw txhash string " + rawTransaction);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
