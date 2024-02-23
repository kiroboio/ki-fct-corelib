import { Variable } from "../types";

export type GlobalVariable =
  | "blockNumber"
  | "blockTimestamp"
  | "gasPrice"
  | "minerAddress"
  | "originAddress"
  | "investorAddress"
  | "activatorAddress"
  | "engineAddress"
  | "chainId"
  | "flowHash";

const BLOCK_NUMBER = "0xFB0A000000000000000000000000000000000000";
const BLOCK_TIMESTAMP = "0xFB0B000000000000000000000000000000000000";
const GAS_PRICE = "0xFB0C000000000000000000000000000000000000";

const MINER_ADDRESS = "0xFA0A000000000000000000000000000000000000";
const ORIGIN_ADDRESS = "0xFA0B000000000000000000000000000000000000";
const INVESTOR_ADDRESS = "0xFA0C000000000000000000000000000000000000";
const ACTIVATOR_ADDRESS = "0xFA0D000000000000000000000000000000000000";
const ENGINE_ADDRESS = "0xFA0E000000000000000000000000000000000000";
const CHAIN_ID = "0xFB0E000000000000000000000000000000000000";
const FLOW_HASH = "0xFB0D000000000000000000000000000000000000";

// const BLOCK_HASH = "0xFF00000000000000000000000000000000000000";

export const globalVariables = {
  blockNumber: BLOCK_NUMBER,
  blockTimestamp: BLOCK_TIMESTAMP,
  chainId: CHAIN_ID,
  gasPrice: GAS_PRICE,
  minerAddress: MINER_ADDRESS,
  originAddress: ORIGIN_ADDRESS,
  investorAddress: INVESTOR_ADDRESS,
  activatorAddress: ACTIVATOR_ADDRESS,
  engineAddress: ENGINE_ADDRESS,
  flowHash: FLOW_HASH,
};

export const globalVariablesBytes = {
  blockNumber: BLOCK_NUMBER.padEnd(66, "0"),
  blockTimestamp: BLOCK_TIMESTAMP.padEnd(66, "0"),
  chainId: CHAIN_ID.padEnd(66, "0"),
  gasPrice: GAS_PRICE.padEnd(66, "0"),
  flowHash: FLOW_HASH.padEnd(66, "0"),
};

export const getBlockNumber = (): Variable => ({ type: "global", id: "blockNumber" });
export const getBlockTimestamp = (): Variable => ({ type: "global", id: "blockTimestamp" });
export const getGasPrice = (): Variable => ({ type: "global", id: "gasPrice" });
export const getMinerAddress = (): Variable => ({ type: "global", id: "minerAddress" });
export const getOriginAddress = (): Variable => ({ type: "global", id: "originAddress" });
export const getInvestorAddress = (): Variable => ({ type: "global", id: "investorAddress" });
export const getActivatorAddress = (): Variable => ({ type: "global", id: "activatorAddress" });
export const getEngineAddress = (): Variable => ({ type: "global", id: "engineAddress" });
export const getChainID = (): Variable => ({ type: "global", id: "chainId" });
export const getFlowHash = (): Variable => ({ type: "global", id: "flowHash" });
