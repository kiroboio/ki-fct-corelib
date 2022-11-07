import { Variable } from "interfaces";

export type GlobalVariable =
  | "blockNumber"
  | "blockTimestamp"
  | "gasPrice"
  | "minerAddress"
  | "originAddress"
  | "investorAddress"
  | "activatorAddress"
  | "engineAddress"
  | string;

const BLOCK_NUMBER = "0xFB0A000000000000000000000000000000000000";
const BLOCK_TIMESTAMP = "0xFB0B000000000000000000000000000000000000";
const GAS_PRICE = "0xFB0C000000000000000000000000000000000000";

const MINER_ADDRESS = "0xFA0A000000000000000000000000000000000000";
const ORIGIN_ADDRESS = "0xFA0B000000000000000000000000000000000000";
const INVESTOR_ADDRESS = "0xFA0C000000000000000000000000000000000000";
const ACTIVATOR_ADDRESS = "0xFA0D000000000000000000000000000000000000";
const ENGINE_ADDRESS = "0xFA0E000000000000000000000000000000000000";

// const BLOCK_HASH = "0xFF00000000000000000000000000000000000000";

// const getBlockHash = (indexOfPreviousBlock: number = 1) => {
//   if (indexOfPreviousBlock === 0) {
//     throw new Error("Only previous blocks are supported");
//   }
//   if (indexOfPreviousBlock > 255) {
//     throw new Error("Only previous blocks up to 255 are supported");
//   }
//   return (indexOfPreviousBlock - 1).toString(16).padStart(BLOCK_HASH.length, BLOCK_HASH);
// };

const globalVariables = {
  blockNumber: BLOCK_NUMBER,
  blockTimestamp: BLOCK_TIMESTAMP,
  gasPrice: GAS_PRICE,
  minerAddress: MINER_ADDRESS,
  originAddress: ORIGIN_ADDRESS,
  investorAddress: INVESTOR_ADDRESS,
  activatorAddress: ACTIVATOR_ADDRESS,
  engineAddress: ENGINE_ADDRESS,
};

const getBlockNumber = (): Variable => ({ type: "global", id: "blockNumber" });
const getBlockTimestamp = (): Variable => ({ type: "global", id: "blockTimestamp" });
const getGasPrice = (): Variable => ({ type: "global", id: "gasPrice" });
const getMinerAddress = (): Variable => ({ type: "global", id: "minerAddress" });
const getOriginAddress = (): Variable => ({ type: "global", id: "originAddress" });
const getInvestorAddress = (): Variable => ({ type: "global", id: "investorAddress" });
const getActivatorAddress = (): Variable => ({ type: "global", id: "activatorAddress" });
const getEngineAddress = (): Variable => ({ type: "global", id: "engineAddress" });

export default {
  getBlockNumber,
  getBlockTimestamp,
  getGasPrice,
  getMinerAddress,
  getOriginAddress,
  getInvestorAddress,
  getActivatorAddress,
  getEngineAddress,
  globalVariables,
};
