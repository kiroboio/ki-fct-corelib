"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEngineAddress = exports.getActivatorAddress = exports.getInvestorAddress = exports.getOriginAddress = exports.getMinerAddress = exports.getGasPrice = exports.getBlockTimestamp = exports.getBlockNumber = exports.globalVariables = void 0;
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
exports.globalVariables = {
    blockNumber: BLOCK_NUMBER,
    blockTimestamp: BLOCK_TIMESTAMP,
    gasPrice: GAS_PRICE,
    minerAddress: MINER_ADDRESS,
    originAddress: ORIGIN_ADDRESS,
    investorAddress: INVESTOR_ADDRESS,
    activatorAddress: ACTIVATOR_ADDRESS,
    engineAddress: ENGINE_ADDRESS,
};
const getBlockNumber = () => ({ type: "global", id: "blockNumber" });
exports.getBlockNumber = getBlockNumber;
const getBlockTimestamp = () => ({ type: "global", id: "blockTimestamp" });
exports.getBlockTimestamp = getBlockTimestamp;
const getGasPrice = () => ({ type: "global", id: "gasPrice" });
exports.getGasPrice = getGasPrice;
const getMinerAddress = () => ({ type: "global", id: "minerAddress" });
exports.getMinerAddress = getMinerAddress;
const getOriginAddress = () => ({ type: "global", id: "originAddress" });
exports.getOriginAddress = getOriginAddress;
const getInvestorAddress = () => ({ type: "global", id: "investorAddress" });
exports.getInvestorAddress = getInvestorAddress;
const getActivatorAddress = () => ({ type: "global", id: "activatorAddress" });
exports.getActivatorAddress = getActivatorAddress;
const getEngineAddress = () => ({ type: "global", id: "engineAddress" });
exports.getEngineAddress = getEngineAddress;
