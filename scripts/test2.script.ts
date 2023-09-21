import { AaveV2, SmartPlugins } from "@kiroboio/flow-plugins";
import { ethers } from "ethers";

import { BatchMultiSigCall } from "../src";
import { scriptData } from "./scriptData";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

// USDC 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
// UNI 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
// WETH 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 1inch 0x111111111117dC0aa78b770fA6A738034120C302

export interface Result extends Array<any> {
  [key: string]: any;
}

async function main() {
  console.log("Starting");
  console.time("init");
  const FCT = new BatchMultiSigCall({ chainId: "1" });

  const plugin = new SmartPlugins.UniswapV2.Swap({
    chainId: "1",
    provider: new ethers.providers.JsonRpcProvider(scriptData[1].rpcUrl),
    vaultAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  });

  plugin.set({
    from: {
      address: ethers.constants.AddressZero,
      decimals: "18",
    },
    to: {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      decimals: "18",
    },
    amount: "1" + "0".repeat(18),
    isExactIn: true, // isAmountIn
    recipient: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    slippage: "500",
  });

  await FCT.add({
    plugin,
    from: createRandomAddress(),
  });

  const FCTData = FCT.export();

  console.log(FCTData.typedData.message);
  console.timeEnd("init");

  // transaction_1: {
  //   call: {
  //     call_index: 1,
  //     payer_index: 1,
  //     call_type: 'action',
  //     from: '0x4cf8ecB8d25e7C4D2b9959572865bFdB92589C52',
  //     to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  //     to_ens: '',
  //     value: '1000000000000000000',
  //     gas_limit: '185000',
  //     permissions: 0,
  //     validation: 0,
  //     flow_control: 'continue on success, revert on fail',
  //     returned_false_means_fail: false,
  //     jump_on_success: 0,
  //     jump_on_fail: 0,
  //     method_interface: 'swapExactETHForTokens(uint256,address[],address,uint256)'
  //   },
  //   amountOutMin: '1628589823',
  //   path: [
  //     '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  //     '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  //   ],
  //   to: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  //   deadline: '1695025653'
  // }
  // init: 5.347s

  const AaveDeposit = new AaveV2.deposit({ chainId: "1" });

  AaveDeposit.set({
    amount: "10",
    asset: "0x...",
    onBehalfOf: "0x...",
    referralCode: "0",
  });

  const SmartPluginsAave = new SmartPlugins.AaveV2.Deposit();
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

// Tenderly simulation:
// USDC Whale 0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503

// const calls = [
//   {
//     from: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
//     to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
//     data: Interfaces.ERC20.encodeFunctionData("approve", [
//       "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
//       "2000" + "0".repeat(6),
//     ]),
//   },
//   {
//     from: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
//     to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
//     data: UniInterface.encodeFunctionData(
//       create.method,
//       create.params.map((param) => param.value)
//     ),
//   },
// ];

// const res = await fetch("https://mainnet.gateway.tenderly.co/19XD817c4zNXz6xBFYnyLb", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     id: 0,
//     jsonrpc: "2.0",
//     method: "tenderly_simulateBundle",
//     params: [calls, "latest"],
//   }),
// });
// const data = await res.json();

// const tuple: Result = [];
// tuple[0] = "something";
// tuple["something"] = "something";

// tuple[1] = "else";
// tuple["else"] = "else";
