"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCTUtils = void 0;
const tslib_1 = require("tslib");
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const ethers_1 = require("ethers");
const graphlib_1 = require("graphlib");
const node_cache_1 = tslib_1.__importDefault(require("node-cache"));
const helpers_1 = require("../../../helpers");
const deepMerge_1 = require("../../../helpers/deepMerge");
const Interfaces_1 = require("../../../helpers/Interfaces");
const utils_1 = require("../../utils");
const getAllRequiredApprovals_1 = require("../../utils/getAllRequiredApprovals");
const EIP712_1 = require("../EIP712");
const FCTBase_1 = require("../FCTBase");
const constants_1 = require("./constants");
const getPaymentPerPayer_1 = require("./utils/getPaymentPerPayer");
const paths_1 = require("./utils/paths");
const transactionTrace_1 = require("./utils/transactionTrace");
class FCTUtils extends FCTBase_1.FCTBase {
    _eip712;
    _cache = new node_cache_1.default();
    constructor(FCT) {
        super(FCT);
        this._eip712 = new EIP712_1.EIP712(FCT);
    }
    get FCTData() {
        return this.FCT.exportFCT();
    }
    async getAllRequiredApprovals() {
        return (0, getAllRequiredApprovals_1.getAllRequiredApprovals)(this.FCT);
    }
    getCalldataForActuator({ signatures, purgedFCT = ethers_1.ethers.constants.HashZero, investor = ethers_1.ethers.constants.AddressZero, activator, externalSigners = [], variables = [], }) {
        return (0, utils_1.getCalldataForActuator)({
            signedFCT: (0, deepMerge_1.deepMerge)(this.FCTData, { signatures, externalSigners, variables }),
            purgedFCT,
            investor,
            activator,
            version: this.FCT.version.slice(2),
        });
    }
    getAuthenticatorSignature() {
        return (0, utils_1.getAuthenticatorSignature)(this._eip712.getTypedData());
    }
    recoverAddress(signature) {
        try {
            const FCT = this.FCT;
            const data = new EIP712_1.EIP712(FCT).getTypedData();
            return (0, eth_sig_util_1.recoverTypedSignature)({
                data,
                version: eth_sig_util_1.SignTypedDataVersion.V4,
                signature: ethers_1.utils.joinSignature(signature),
            });
        }
        catch (e) {
            return null;
        }
    }
    getMessageHash() {
        const buffer = eth_sig_util_1.TypedDataUtils.eip712Hash(this.FCTData.typedData, eth_sig_util_1.SignTypedDataVersion.V4);
        return `0x${buffer.toString("hex")}`;
    }
    isValid(softValidation = false) {
        const options = this.FCT.options;
        const currentDate = new Date().getTime() / 1000;
        const validFrom = parseInt(options.validFrom);
        const expiresAt = parseInt(options.expiresAt);
        const gasPriceLimit = options.maxGasPrice;
        if (!softValidation && validFrom > currentDate) {
            return { valid: false, message: `FCT is not valid yet. FCT is valid from ${validFrom}` };
        }
        if (expiresAt < currentDate) {
            return { valid: false, message: `FCT has expired. FCT expired at ${expiresAt}` };
        }
        if (gasPriceLimit === "0") {
            return { valid: false, message: `FCT gas price limit cannot be 0` };
        }
        return { valid: true, message: null };
    }
    getSigners() {
        return this.FCT.calls.reduce((acc, call) => {
            const from = call.get().from;
            if (typeof from !== "string")
                return acc;
            const doNotReturn = constants_1.secureStorageAddresses.find((address) => address.address.toLowerCase() === from.toLowerCase() && address.chainId === this.FCT.chainId);
            if (!acc.includes(from) && !doNotReturn) {
                acc.push(from);
            }
            return acc;
        }, []);
    }
    getAllPaths() {
        const FCT = this.FCT;
        const g = new graphlib_1.Graph({ directed: true });
        const ends = (0, paths_1.manageFCTNodesInGraph)({
            calls: this.FCT.calls,
            FCT,
            g,
        });
        return (0, paths_1.getPathsFromGraph)({
            g,
            ends,
        });
    }
    async getAssetFlow() {
        const allPaths = this.getAllPaths();
        const allCalls = this.FCT.calls;
        const assetFlow = await Promise.all(allPaths.map(async (path) => {
            const calls = path.map((index) => allCalls[Number(index)]);
            const assetFlow = [];
            for (const call of calls) {
                const plugin = call.plugin;
                if (!plugin) {
                    return [];
                }
                const callAssetFlow = await plugin.getAssetFlow();
                // Check if the address is already in the accumulator
                for (const flow of callAssetFlow) {
                    const index = assetFlow.findIndex((accAsset) => accAsset.address === flow.address);
                    if (index === -1) {
                        assetFlow.push(flow);
                    }
                    else {
                        const data = assetFlow[index];
                        for (const token of flow.toReceive) {
                            const tokenIndex = data.toReceive.findIndex((accToken) => accToken.token === token.token);
                            if (tokenIndex !== -1) {
                                data.toReceive[tokenIndex].amount = (BigInt(data.toReceive[tokenIndex].amount) +
                                    BigInt(helpers_1.InstanceOf.Variable(token.amount) ? 0 : token.amount)).toString();
                            }
                            else {
                                data.toReceive.push(token);
                            }
                        }
                        for (const token of flow.toSpend) {
                            const tokenIndex = data.toSpend.findIndex((accToken) => accToken.token === token.token);
                            if (tokenIndex !== -1) {
                                data.toSpend[tokenIndex].amount = (BigInt(data.toSpend[tokenIndex].amount) +
                                    BigInt(helpers_1.InstanceOf.Variable(token.amount) ? 0 : token.amount)).toString();
                            }
                            else {
                                data.toSpend.push(token);
                            }
                        }
                    }
                }
            }
            return {
                path,
                assetFlow,
            };
        }));
        return assetFlow;
    }
    kiroPerPayerGas = ({ gas, gasPrice, penalty, ethPriceInKIRO, fees, }) => {
        const baseFeeBPS = fees?.baseFeeBPS ? BigInt(fees.baseFeeBPS) : 1000n;
        const bonusFeeBPS = fees?.bonusFeeBPS ? BigInt(fees.bonusFeeBPS) : 5000n;
        const gasBigInt = BigInt(gas);
        const limits = this.FCTData.typedData.message.limits;
        const maxGasPrice = BigInt(limits.max_payable_gas_price);
        const gasPriceBigInt = BigInt(gasPrice) > maxGasPrice ? maxGasPrice : BigInt(gasPrice);
        const effectiveGasPrice = BigInt((0, getPaymentPerPayer_1.getEffectiveGasPrice)({
            gasPrice: gasPriceBigInt,
            maxGasPrice,
            baseFeeBPS,
            bonusFeeBPS,
        }));
        const base = gasBigInt * gasPriceBigInt;
        const fee = gasBigInt * (effectiveGasPrice - gasPriceBigInt);
        const ethCost = base + fee;
        const kiroCost = (ethCost * BigInt(ethPriceInKIRO)) / 10n ** 18n;
        return {
            ethCost: ((ethCost * BigInt(penalty || 10_000)) / 10000n).toString(),
            kiroCost: kiroCost.toString(),
        };
    };
    getPaymentPerPayer = ({ signatures, gasPrice, maxGasPrice, ethPriceInKIRO, penalty, fees, }) => {
        const calls = this.FCT.calls;
        const options = this.FCT.options;
        signatures = signatures || [];
        const allPathsKey = JSON.stringify(options) + JSON.stringify(this.FCT.callsAsObjects);
        let allPaths = this._cache.get(allPathsKey);
        if (!allPaths) {
            allPaths = this.getAllPaths();
            this._cache.set(allPathsKey, allPaths);
        }
        const calldata = this.getCalldataForActuator({
            activator: "0x0000000000000000000000000000000000000000",
            investor: "0x0000000000000000000000000000000000000000",
            purgedFCT: "0x".padEnd(66, "0"),
            signatures,
        });
        const payerMap = (0, getPaymentPerPayer_1.getPayerMap)({
            chainId: this.FCT.chainId,
            paths: allPaths,
            calldata,
            calls,
            maxGasPrice: maxGasPrice ? BigInt(maxGasPrice) : BigInt(options.maxGasPrice),
            gasPrice: gasPrice ? BigInt(gasPrice) : BigInt("0"),
            baseFeeBPS: fees?.baseFeeBPS ? BigInt(fees.baseFeeBPS) : 1000n,
            bonusFeeBPS: fees?.bonusFeeBPS ? BigInt(fees.bonusFeeBPS) : 5000n,
            penalty,
        });
        const senders = [...new Set(calls.map((call) => call.get().from).filter((i) => typeof i === "string"))];
        return (0, getPaymentPerPayer_1.preparePaymentPerPayerResult)({
            payerMap,
            senders,
            ethPriceInKIRO,
        });
    };
    getPaymentPerSender = this.getPaymentPerPayer;
    getMaxGas = () => {
        const allPayers = this.getPaymentPerSender({ ethPriceInKIRO: "0" });
        return allPayers.reduce((acc, payer) => {
            const largestGas = payer.largestPayment.gas;
            if (BigInt(largestGas) > BigInt(acc)) {
                return largestGas;
            }
            return acc;
        }, "0");
    };
    getCallResults = async ({ rpcUrl, provider, txHash, }) => {
        if (!provider && !rpcUrl) {
            throw new Error("Either provider or rpcUrl is required");
        }
        if (!provider) {
            provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
        }
        const txReceipt = await provider.getTransactionReceipt(txHash);
        const batchMultiSigInterface = Interfaces_1.Interfaces.FCT_BatchMultiSigCall;
        (0, transactionTrace_1.verifyMessageHash)(txReceipt.logs, this.getMessageHash());
        const mapLog = (log) => {
            const parsedLog = batchMultiSigInterface.parseLog(log);
            return {
                id: parsedLog.args.id,
                caller: parsedLog.args.caller,
                callIndex: parsedLog.args.callIndex.toString(),
            };
        };
        const successCalls = txReceipt.logs
            .filter((log) => {
            try {
                return batchMultiSigInterface.parseLog(log).name === "FCTE_CallSucceed";
            }
            catch (e) {
                return false;
            }
        })
            .map(mapLog);
        const failedCalls = txReceipt.logs
            .filter((log) => {
            try {
                return batchMultiSigInterface.parseLog(log).name === "FCTE_CallFailed";
            }
            catch (e) {
                return false;
            }
        })
            .map(mapLog);
        const callResultConstants = {
            success: "SUCCESS",
            failed: "FAILED",
            skipped: "SKIPPED",
        };
        const manageResult = (index) => {
            if (successCalls.find((successCall) => successCall.callIndex === index))
                return callResultConstants.success;
            if (failedCalls.find((failedCall) => failedCall.callIndex === index))
                return callResultConstants.failed;
            return callResultConstants.skipped;
        };
        return this.FCT.calls.map((_, index) => {
            const indexString = (index + 1).toString();
            return {
                index: indexString,
                result: manageResult(indexString),
            };
        });
    };
    getTransactionTrace = async ({ txHash, tenderlyRpcUrl, tries = 3, }) => {
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(tenderlyRpcUrl);
        do {
            try {
                const data = await provider.send("tenderly_traceTransaction", [txHash]);
                if (!data?.trace || !data?.logs) {
                    throw new Error("Tenderly trace is not working");
                }
                const executedCalls = (0, transactionTrace_1.executedCallsFromLogs)(data.logs, this.getMessageHash());
                const traceData = (0, transactionTrace_1.getTraceData)({
                    calls: this.FCT.calls,
                    callsFromTenderlyTrace: (0, transactionTrace_1.getCallsFromTrace)(data.trace),
                    executedCalls,
                    computedVariables: this.FCT.computed,
                });
                return traceData;
            }
            catch (e) {
                if (tries > 0) {
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                }
                else {
                    throw e;
                }
            }
        } while (tries-- > 0);
    };
    getSimpleTransactionTrace = async ({ txHash, rpcUrl }) => {
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
        const txReceipt = await provider.getTransactionReceipt(txHash);
        (0, transactionTrace_1.verifyMessageHash)(txReceipt.logs, this.getMessageHash());
        const executedCalls = (0, transactionTrace_1.executedCallsFromRawLogs)(txReceipt.logs, this.getMessageHash());
        const fctCalls = this.FCT.calls;
        const allFCTComputed = this.FCT.computed;
        return executedCalls.reduce((acc, executedCall) => {
            const fctCall = fctCalls[Number(executedCall.callIndex) - 1];
            acc.calls = [
                ...acc.calls,
                {
                    isSuccess: executedCall.isSuccess,
                    id: fctCall.nodeId,
                },
            ];
            (0, transactionTrace_1.manageValidationAndComputed)(acc, fctCall, allFCTComputed);
            return acc;
        }, {
            calls: [],
            validations: [],
            computed: [],
        });
    };
    usesExternalVariables() {
        // External Variables can be in 3 places:
        // - calls
        // - computed variables
        // - validations
        let result = false;
        if (!result) {
            result = this.FCT.calls.some((call) => {
                return call.isExternalVariableUsed();
            });
        }
        if (!result) {
            result = this.FCT.variables.isExternalVariableUsed();
        }
        if (!result) {
            result = this.FCT.validation.isExternalVariableUsed();
        }
        return result;
    }
}
exports.FCTUtils = FCTUtils;
//# sourceMappingURL=index.js.map