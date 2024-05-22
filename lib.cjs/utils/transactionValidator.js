"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionValidator = void 0;
const ethers_1 = require("ethers");
const classes_1 = require("../batchMultiSigCall/classes");
const Interfaces_1 = require("../helpers/Interfaces");
const transactionValidator = async (txVal) => {
    const { callData, actuatorContractAddress, activator, rpcUrl, activateForFree } = txVal;
    let { gasPrice } = txVal;
    const decodedFCTCalldata = Interfaces_1.Interfaces.FCT_BatchMultiSigCall.decodeFunctionData("batchMultiSigCall", callData);
    const { maxGasPrice, dryRun } = classes_1.SessionID.parse(decodedFCTCalldata[1].sessionId.toHexString());
    gasPrice = manageGasPrice({ gasPrice, maxGasPrice, dryRun });
    try {
        const gas = await estimateGas({
            rpcUrl,
            actuatorContractAddress,
            activateForFree,
            callData,
            activator,
            gasPrice,
        });
        if (gas.lt(40000)) {
            throw new Error("Unknown error - FCT execution finalized too quickly. Is there enough power for user?");
        }
        // Add 20% to gasUsed value, calculate with BigInt
        const gasUsed = Math.round(gas.toNumber() + gas.toNumber() * 0.2);
        return {
            isValid: true,
            txData: { gas: gasUsed, ...gasPrice, type: 2 },
            prices: { gas: gasUsed, gasPrice: gasPrice.maxFeePerGas },
            error: null,
        };
    }
    catch (err) {
        return handleTxValidatorError({
            err,
            dryRun,
            gasPrice,
            errorIsValid: txVal.errorIsValid,
        });
    }
};
exports.transactionValidator = transactionValidator;
function manageGasPrice({ dryRun, gasPrice, maxGasPrice, }) {
    if (dryRun) {
        return { maxFeePerGas: "0", maxPriorityFeePerGas: "0" };
    }
    if (BigInt(maxGasPrice) < BigInt(gasPrice.maxFeePerGas)) {
        return { maxFeePerGas: maxGasPrice.toString(), maxPriorityFeePerGas: "0" };
    }
    return gasPrice;
}
async function estimateGas({ rpcUrl, actuatorContractAddress, activateForFree, callData, activator, gasPrice, }) {
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
    const data = Interfaces_1.Interfaces.FCT_Actuator.encodeFunctionData(activateForFree ? "activateForFree" : "activate", [
        callData,
        activator,
    ]);
    return await provider.estimateGas({
        to: actuatorContractAddress,
        data,
        ...gasPrice,
        from: activator,
    });
}
function handleTxValidatorError({ err, dryRun, gasPrice, errorIsValid, }) {
    if (dryRun && err.reason.includes("dry run success")) {
        return {
            isValid: true,
            txData: { gas: 0, ...gasPrice, type: 2 },
            prices: {
                gas: 0,
                gasPrice: gasPrice.maxFeePerGas,
            },
            error: null,
        };
    }
    if (err.code === "SERVER_ERROR") {
        return {
            isValid: false,
            txData: { gas: 0, ...gasPrice, type: 2 },
            prices: {
                gas: 0,
                gasPrice: gasPrice.maxFeePerGas,
            },
            error: err.error.message || err.error,
        };
    }
    if (errorIsValid) {
        return {
            isValid: true,
            txData: { gas: 1_000_000, ...gasPrice, type: 2 },
            prices: {
                gas: 1_000_000, // 900k is the default gas limit
                gasPrice: gasPrice.maxFeePerGas,
            },
            error: null,
        };
    }
    return {
        isValid: false,
        txData: { gas: 0, ...gasPrice, type: 2 },
        prices: {
            gas: 0,
            gasPrice: gasPrice.maxFeePerGas,
        },
        error: err.reason ? err.reason : err.message,
    };
}
//# sourceMappingURL=transactionValidator.js.map