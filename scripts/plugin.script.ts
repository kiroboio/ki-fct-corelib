import { ethers } from "ethers";

import { BatchMultiSigCall, UniswapHelper } from "../src";
import scriptData from "./scriptData";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

// USDC 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
// UNI 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
// WETH 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// 1inch 0x111111111117dC0aa78b770fA6A738034120C302

// 0x111111111117dC0aa78b770fA6A738034120C302
// 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
//   0001f4
//   dac17f958d2ee523a2206206994597c13d831ec7

export interface Result extends Array<any> {
  [key: string]: any;
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/<key>");
  console.log(provider.connection.url);
  console.time("init");
  const account = createRandomAddress();
  const FCT = new BatchMultiSigCall({ chainId: "1" });

  const Uniswap = new UniswapHelper({
    chainId: "1",
    account,
    provider: new ethers.providers.JsonRpcProvider(scriptData[1].rpcUrl),
  });

  const data = await Uniswap.getSwapParams({
    input: {
      currency: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        decimals: 6,
      },
      amount: "100" + "0".repeat(6),
    },
    output: {
      currency: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
      },
    },
  });

  if (!data || !data.plugin) throw new Error("No plugin found");

  const Plugin = data.plugin;

  const UniPlugin = new Plugin({
    chainId: "1",
    initParams: data.params,
  });

  await FCT.add({
    plugin: UniPlugin,
    from: account,
  });

  const FCTData = FCT.export();
  console.log(FCTData.typedData.message);
  console.timeEnd("init");

  // transaction_1: {
  //   call: {
  //     call_index: 1,
  //     payer_index: 1,
  //     call_type: 'action',
  //     from: '0x5C19d18BAf2C4D2B9e8762eFa7595842Ea008D96',
  //     to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  //     to_ens: '',
  //     value: '0',
  //     gas_limit: '414324',
  //     permissions: 0,
  //     validation: 0,
  //     flow_control: 'continue on success, revert on fail',
  //     returned_false_means_fail: false,
  //     jump_on_success: 0,
  //     jump_on_fail: 0,
  //     method_interface: 'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)'
  //   },
  //   amountIn: '100000000',
  //   amountOutMin: '60749382303240117',
  //   path: [
  //     '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  //     '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  //   ],
  //   to: '0x5C19d18BAf2C4D2B9e8762eFa7595842Ea008D96',
  //   deadline: '0xFB0B000000000000000000000000000000000000'
  // }
  // init: 8.754s
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
