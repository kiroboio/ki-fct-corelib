"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCTUtils = void 0;
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const hardhat_network_helpers_1 = require("@nomicfoundation/hardhat-network-helpers");
const ethers_1 = require("ethers");
const graphlib_1 = require("graphlib");
const hre = __importStar(require("hardhat"));
const lodash_1 = __importDefault(require("lodash"));
const Interfaces_1 = require("../../../helpers/Interfaces");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const getAllRequiredApprovals_1 = require("../../utils/getAllRequiredApprovals");
const CallID_1 = require("../CallID");
const EIP712_1 = require("../EIP712");
const FCTBase_1 = require("../FCTBase");
const SessionID_1 = require("../SessionID");
const getPaymentPerPayer_1 = require("./getPaymentPerPayer");
class FCTUtils extends FCTBase_1.FCTBase {
    constructor(FCT) {
        super(FCT);
        // 38270821632831754769812 - kiro price
        // 1275004198 - max fee
        // 462109 - gas
        // TODO: Make this function deprecated. Use getPaymentPerPayer instead
        this.getKIROPayment = ({ priceOfETHInKiro, gasPrice, gas, }) => {
            const fct = this.FCTData;
            const vault = fct.typedData.message["transaction_1"].call.from;
            const gasInt = BigInt(gas);
            const gasPriceFormatted = BigInt(gasPrice);
            const limits = fct.typedData.message.limits;
            const maxGasPrice = limits.gas_price_limit;
            // 1000 - baseFee
            // 5000 - bonusFee
            const effectiveGasPrice = (gasPriceFormatted * BigInt(10000 + 1000) + (BigInt(maxGasPrice) - gasPriceFormatted) * BigInt(5000)) /
                BigInt(10000);
            const feeGasCost = gasInt * (effectiveGasPrice - gasPriceFormatted);
            const baseGasCost = gasInt * gasPriceFormatted;
            const totalCost = baseGasCost + feeGasCost;
            const normalisedPriceOfETHInKiro = BigInt(priceOfETHInKiro);
            const kiroCost = (totalCost * normalisedPriceOfETHInKiro) / BigInt(1e18);
            return {
                vault,
                amountInKIRO: kiroCost.toString(),
                amountInETH: totalCost.toString(),
            };
        };
        this.kiroPerPayerGas = ({ gas, gasPrice, penalty, ethPriceInKIRO, fees, }) => {
            const baseFeeBPS = fees?.baseFeeBPS ? BigInt(fees.baseFeeBPS) : 1000n;
            const bonusFeeBPS = fees?.bonusFeeBPS ? BigInt(fees.bonusFeeBPS) : 5000n;
            const gasBigInt = BigInt(gas);
            const gasPriceBigInt = BigInt(gasPrice);
            const limits = this.FCTData.typedData.message.limits;
            const maxGasPrice = BigInt(limits.gas_price_limit);
            const effectiveGasPrice = BigInt((0, getPaymentPerPayer_1.getEffectiveGasPrice)({
                gasPrice,
                maxGasPrice,
                baseFeeBPS,
                bonusFeeBPS,
            }));
            const base = gasBigInt * gasPriceBigInt;
            const fee = gasBigInt * (effectiveGasPrice - gasPriceBigInt);
            const ethCost = base + fee;
            const kiroCost = (ethCost * BigInt(ethPriceInKIRO)) / 10n ** 18n;
            return {
                ethCost: (ethCost * BigInt(penalty || 1)).toString(),
                kiroCost: kiroCost.toString(),
            };
        };
        this.getPaymentPerPayer = ({ signatures, gasPrice, ethPriceInKIRO, penalty, fees, }) => {
            const baseFeeBPS = fees?.baseFeeBPS ? BigInt(fees.baseFeeBPS) : 1000n;
            const bonusFeeBPS = fees?.bonusFeeBPS ? BigInt(fees.bonusFeeBPS) : 5000n;
            const fct = this.FCTData;
            const allPaths = this.getAllPaths();
            console.log("all paths", allPaths);
            const limits = fct.typedData.message.limits;
            const maxGasPrice = BigInt(limits.gas_price_limit);
            const txGasPrice = gasPrice ? BigInt(gasPrice) : maxGasPrice;
            const effectiveGasPrice = BigInt((0, getPaymentPerPayer_1.getEffectiveGasPrice)({
                gasPrice: txGasPrice,
                maxGasPrice,
                baseFeeBPS,
                bonusFeeBPS,
            }));
            fct.signatures = signatures || [];
            const calldata = this.getCalldataForActuator({
                activator: "0x0000000000000000000000000000000000000000",
                investor: "0x0000000000000000000000000000000000000000",
                purgedFCT: "0x".padEnd(66, "0"),
                signatures: fct.signatures,
            });
            const data = allPaths.map((path) => {
                const payers = (0, getPaymentPerPayer_1.getPayersForRoute)({
                    calldata,
                    calls: fct.mcall,
                    pathIndexes: path,
                });
                return payers.reduce((acc, payer) => {
                    const base = payer.gas * txGasPrice;
                    const fee = payer.gas * (effectiveGasPrice - txGasPrice);
                    const ethCost = base + fee;
                    const kiroCost = (ethCost * BigInt(ethPriceInKIRO)) / 10n ** 18n;
                    return {
                        ...acc,
                        [payer.payer]: {
                            ...payer,
                            ethCost: ethCost * BigInt(penalty || 1),
                            kiroCost,
                        },
                    };
                }, {});
            });
            const allPayers = [
                ...new Set(fct.mcall.map((call) => {
                    const { payerIndex } = CallID_1.CallID.parse(call.callId);
                    if (payerIndex === 0)
                        return ethers_1.ethers.constants.AddressZero;
                    const payer = fct.mcall[payerIndex - 1].from;
                    return payer;
                })),
            ];
            console.log("allPayers", allPayers);
            return allPayers.map((payer) => {
                const { largest, smallest } = data.reduce((acc, pathData) => {
                    const currentValues = acc;
                    const currentLargestValue = currentValues.largest?.kiroCost || 0n;
                    const currentSmallestValue = currentValues.smallest?.kiroCost;
                    const value = pathData[payer]?.kiroCost || 0n;
                    if (value > currentLargestValue) {
                        currentValues.largest = pathData[payer];
                    }
                    if (!currentSmallestValue || value < currentSmallestValue) {
                        currentValues.smallest = pathData[payer];
                    }
                    return currentValues;
                }, {});
                return {
                    payer,
                    largestPayment: {
                        gas: largest.gas.toString(),
                        amount: largest.kiroCost.toString(),
                        amountInETH: largest.ethCost.toString(),
                    },
                    smallestPayment: {
                        gas: smallest.gas.toString(),
                        amount: smallest.kiroCost.toString(),
                        amountInETH: smallest.ethCost.toString(),
                    },
                };
            });
        };
        this.getCallResults = async ({ rpcUrl, provider, txHash, }) => {
            if (!provider && !rpcUrl) {
                throw new Error("Either provider or rpcUrl is required");
            }
            if (!provider) {
                provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
            }
            const txReceipt = await provider.getTransactionReceipt(txHash);
            const batchMultiSigInterface = Interfaces_1.Interface.FCT_BatchMultiSigCall;
            const controllerInterface = Interfaces_1.Interface.FCT_Controller;
            // Get FCTE_Activated event
            const messageHash = txReceipt.logs.find((log) => {
                try {
                    return controllerInterface.parseLog(log).name === "FCTE_Registered";
                }
                catch (e) {
                    return false;
                }
            })?.topics[2];
            const messageHashUtil = this.getMessageHash();
            if (messageHash !== messageHashUtil) {
                throw new Error("Message hash mismatch");
            }
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
        this.deepValidateFCT = async ({ rpcUrl, actuatorAddress, signatures, }) => {
            const chainId = Number(this.FCT.chainId);
            hre.config.networks.hardhat.chainId = chainId;
            if (hre.config.networks.hardhat.forking) {
                hre.config.networks.hardhat.forking.url = rpcUrl;
            }
            else {
                throw new Error("Something weird");
            }
            /* @notice - We need to use hardhat ethers instead of regular ethers because additional functions are in hre.ethers
             * This is the reason why we are disabling the eslint rule for this line
             */
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const ethers = hre.ethers;
            // Imperonate actuator
            await (0, hardhat_network_helpers_1.impersonateAccount)(actuatorAddress);
            const calldata = this.getCalldataForActuator({
                signatures,
                activator: actuatorAddress,
                investor: ethers.constants.AddressZero,
                purgedFCT: ethers.constants.HashZero,
            });
            // Get Actuator signer
            const Actuator = await ethers.getSigner(actuatorAddress);
            const actuatorContractInterface = Interfaces_1.Interface.FCT_Actuator;
            const actuatorContractAddress = constants_1.addresses[chainId].Actuator;
            const ActuatorContract = new ethers.Contract(actuatorContractAddress, actuatorContractInterface, ethers.provider);
            try {
                // await setNextBlockBaseFeePerGas(ethers.utils.parseUnits("1", "gwei"));
                const tx = await ActuatorContract.connect(Actuator).activate(calldata, Actuator.address, {
                    gasLimit: 1000000,
                    gasPrice: this.FCT.options.maxGasPrice,
                });
                const txReceipt = await tx.wait();
                return {
                    success: true,
                    txReceipt: txReceipt,
                    message: "",
                };
            }
            catch (err) {
                return {
                    success: false,
                    txReceipt: null,
                    message: err.message,
                };
            }
        };
        this._eip712 = new EIP712_1.EIP712(FCT);
    }
    get FCTData() {
        return this.FCT.exportFCT();
    }
    async getAllRequiredApprovals() {
        return (0, getAllRequiredApprovals_1.getAllRequiredApprovals)(this.FCT);
    }
    getCalldataForActuator({ signatures, purgedFCT, investor, activator, }) {
        return (0, utils_1.getCalldataForActuator)({
            signedFCT: lodash_1.default.merge({}, this.FCTData, { signatures }),
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
            const signatureString = ethers_1.utils.joinSignature(signature);
            return (0, eth_sig_util_1.recoverTypedSignature)({
                data: this.FCTData.typedData,
                version: eth_sig_util_1.SignTypedDataVersion.V4,
                signature: signatureString,
            });
        }
        catch (e) {
            return null;
        }
    }
    getOptions() {
        const parsedSessionID = SessionID_1.SessionID.asOptions({
            builder: this.FCTData.builder,
            sessionId: this.FCTData.sessionId,
            name: "",
        });
        return {
            valid_from: parsedSessionID.validFrom,
            expires_at: parsedSessionID.expiresAt,
            gas_price_limit: parsedSessionID.maxGasPrice,
            blockable: parsedSessionID.blockable,
            purgeable: parsedSessionID.purgeable,
            builder: parsedSessionID.builder,
            recurrency: parsedSessionID.recurrency,
            multisig: parsedSessionID.multisig,
            authEnabled: parsedSessionID.authEnabled,
        };
    }
    getMessageHash() {
        return ethers_1.ethers.utils.hexlify(eth_sig_util_1.TypedDataUtils.eip712Hash(this.FCTData.typedData, eth_sig_util_1.SignTypedDataVersion.V4));
    }
    isValid(softValidation = false) {
        const keys = Object.keys(this.FCTData);
        this.validateFCTKeys(keys);
        const limits = this.FCTData.typedData.message.limits;
        const fctData = this.FCTData.typedData.message.meta;
        const currentDate = new Date().getTime() / 1000;
        const validFrom = parseInt(limits.valid_from);
        const expiresAt = parseInt(limits.expires_at);
        const gasPriceLimit = limits.gas_price_limit;
        if (!softValidation && validFrom > currentDate) {
            throw new Error(`FCT is not valid yet. FCT is valid from ${validFrom}`);
        }
        if (expiresAt < currentDate) {
            throw new Error(`FCT has expired. FCT expired at ${expiresAt}`);
        }
        if (gasPriceLimit === "0") {
            throw new Error(`FCT gas price limit cannot be 0`);
        }
        if (!fctData.eip712) {
            throw new Error(`FCT must be type EIP712`);
        }
        return true;
    }
    getSigners() {
        return this.FCTData.mcall.reduce((acc, { from }) => {
            if (!acc.includes(from)) {
                acc.push(from);
            }
            return acc;
        }, []);
    }
    getAllPaths() {
        const FCT = this.FCTData;
        const g = new graphlib_1.Graph({ directed: true });
        FCT.mcall.forEach((_, index) => {
            g.setNode(index.toString());
        });
        for (let i = 0; i < FCT.mcall.length - 1; i++) {
            //   const callID = parseCallID(fct.mcall[i].callId, true);
            const callID = CallID_1.CallID.parseWithNumbers(FCT.mcall[i].callId);
            const jumpOnSuccess = callID.options.jumpOnSuccess;
            const jumpOnFail = callID.options.jumpOnFail;
            if (jumpOnSuccess === jumpOnFail) {
                g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
            }
            else {
                g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
                g.setEdge(i.toString(), (i + 1 + Number(jumpOnFail)).toString());
            }
        }
        const allPaths = [];
        const isVisited = {};
        const pathList = [];
        const start = "0";
        const end = (FCT.mcall.length - 1).toString();
        pathList.push(start);
        const printAllPathsUtil = (g, start, end, isVisited, localPathList) => {
            if (start === end) {
                const path = localPathList.slice();
                allPaths.push(path);
                return;
            }
            isVisited[start] = true;
            let successors = g.successors(start);
            if (successors === undefined) {
                successors = [];
            }
            for (const id of successors) {
                if (!isVisited[id]) {
                    localPathList.push(id);
                    printAllPathsUtil(g, id, end, isVisited, localPathList);
                    localPathList.splice(localPathList.indexOf(id), 1);
                }
            }
            isVisited[start] = false;
        };
        printAllPathsUtil(g, start, end, isVisited, pathList);
        return allPaths;
    }
    validateFCTKeys(keys) {
        const validKeys = [
            "typeHash",
            "typedData",
            "sessionId",
            "nameHash",
            "mcall",
            "builder",
            "variables",
            "externalSigners",
            "computed",
            "signatures",
        ];
        validKeys.forEach((key) => {
            if (!keys.includes(key)) {
                throw new Error(`FCT missing key ${key}`);
            }
        });
    }
}
exports.FCTUtils = FCTUtils;
