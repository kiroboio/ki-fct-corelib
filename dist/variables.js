"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BLOCK_NUMBER = "0xFB0A000000000000000000000000000000000000";
const BLOCK_TIMESTAMP = "0xFB0B000000000000000000000000000000000000";
const GAS_PRICE = "0xFB0C000000000000000000000000000000000000";
const MINER_ADDRESS = "0xFA0A000000000000000000000000000000000000";
const ACTIVATOR_ADDRESS = "0x00FA0B000000000000000000000000000000000000";
const BLOCK_HASH = "0xFF00000000000000000000000000000000000000";
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
    activatorAddress: ACTIVATOR_ADDRESS,
    // blockHash: BLOCK_HASH,
};
const useBlockNumber = () => ({ type: "global", id: "blockNumber" });
const useBlockTimestamp = () => ({ type: "global", id: "blockTimestamp" });
const useGasPrice = () => ({ type: "global", id: "gasPrice" });
const useMinerAddress = () => ({ type: "global", id: "minerAddress" });
const useActivatorAddress = () => ({ type: "global", id: "activatorAddress" });
// const getBlockHash = (indexOfPreviousBlock: number = 1): Variable => ({
//   type: "global",
//   id: getBlockHash(indexOfPreviousBlock),
// });
exports.default = {
    useBlockNumber,
    useBlockTimestamp,
    useGasPrice,
    useMinerAddress,
    useActivatorAddress,
    globalVariables,
};
