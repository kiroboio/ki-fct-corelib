import * as dotenv from "dotenv";

import { BatchMultiSigCallTypedData, utils } from "../src/index";
import data from "./scriptData";
// 34149170958632548614943

dotenv.config();

const chainId = 5;
const wallet = process.env.WALLET as string;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main() {
  const gasPrices = await utils.getGasPrices({
    rpcUrl: data[chainId].rpcUrl,
  });

  console.log("Gas Prices", gasPrices);

  const message: BatchMultiSigCallTypedData["message"] = {
    meta: {
      name: "",
      builder: "0x0000000000000000000000000000000000000000",
      selector: "0x2409a934",
      version: "0x010101",
      random_id: "0x4996fe",
      eip712: true,
    },
    limits: {
      valid_from: "1672758649",
      expires_at: "1673363449",
      gas_price_limit: "100000000000",
      purgeable: false,
      blockable: true,
    },

    transaction_1: {
      call: {
        call_index: 1,
        payer_index: 1,
        call_type: "library",
        from: "0xcA84b48a4a96c50A7Ecbd22A17cf23Db0b8a23ec",
        to: "0xf2B3a55051F49310635E962D54b9b1D961C81a55",
        to_ens: "@lib:uniswap_v2",
        eth_value: "0",
        gas_limit: "0",
        permissions: 0,
        flow_control: "continue on success, revert on fail",
        returned_false_means_fail: false,
        jump_on_success: 0,
        jump_on_fail: 0,
        method_interface: "swap_noSlippageProtection(uint256,bytes32,address[])",
      },
      amount: "1000000",
      method: "swap <amount> ETH for <X> Tokens",
      path: ["0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6", "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"],
    },
  };

  console.log(message);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
