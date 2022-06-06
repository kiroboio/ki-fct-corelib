"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchMultiSigCall = void 0;
const ethers_1 = require("ethers");
const ethers_eip712_1 = require("ethers-eip712");
const factoryProxy__abi_json_1 = __importDefault(require("../abi/factoryProxy_.abi.json"));
const helpers_1 = require("../helpers");
const contractInteractionDefaults = [
    { name: "details", type: "Transaction_" },
    { name: "method_params_offset", type: "uint256" },
    { name: "method_params_length", type: "uint256" },
];
const generateTxType = (item) => {
    return item.methodData
        ? [
            ...contractInteractionDefaults,
            ...Object.entries(item.methodData).map(([key, value]) => ({ name: key, type: value[0] })),
        ]
        : [{ name: "details", type: "Transaction_" }];
};
function arraysEqual(a, b) {
    if (a === b)
        return true;
    if (a == null || b == null)
        return false;
    if (a.length !== b.length)
        return false;
    for (var i = 0; i < a.length; ++i) {
        if (JSON.stringify(a[1]) !== JSON.stringify(b[1]))
            return false;
    }
    return true;
}
// DefaultFlag - "f100" // payment + eip712
const defaultFlags = {
    eip712: true,
    payment: true,
    flow: false,
};
const getBatchTransferData = (web3, FactoryProxy, factoryProxyAddress, call) => __awaiter(void 0, void 0, void 0, function* () {
    const group = (0, helpers_1.getGroupId)(call.groupId);
    const tnonce = (0, helpers_1.getNonce)(call.nonce);
    const after = (0, helpers_1.getAfterTimestamp)(call.afterTimestamp || 0);
    const before = call.beforeTimestamp ? (0, helpers_1.getBeforeTimestamp)(false, call.beforeTimestamp) : (0, helpers_1.getBeforeTimestamp)(true);
    const maxGas = (0, helpers_1.getMaxGas)(call.maxGas || 0);
    const maxGasPrice = call.maxGasPrice ? (0, helpers_1.getMaxGasPrice)(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
    const batchFlags = Object.assign(Object.assign({}, defaultFlags), call.flags);
    const eip712 = (0, helpers_1.getFlags)(batchFlags, false); // not-ordered, payment, eip712
    const getSessionId = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;
    // Creates types and batchMultiCallTypes for EIP712 sign
    const txTypes = call.multiCalls.reduce((acc, item, index) => {
        const txTypeExists = Object.entries(acc.txTypes).some((txType) => arraysEqual(txType[1], generateTxType(item)));
        // If multicall has encoded contract data
        if (item.data) {
            if (txTypeExists) {
                const typeName = Object.keys(acc.txTypes).find((key) => arraysEqual(acc.txTypes[key], generateTxType(item)));
                return {
                    batchMulticallTypes: [...acc.batchMulticallTypes, { name: `transaction_${index + 1}`, type: typeName }],
                    txTypes: acc.txTypes,
                };
            }
            return {
                batchMulticallTypes: [
                    ...acc.batchMulticallTypes,
                    { name: `transaction_${index + 1}`, type: `ContractInteraction_${index + 1}` },
                ],
                txTypes: Object.assign(Object.assign({}, acc.txTypes), { [`ContractInteraction_${index + 1}`]: [
                        ...contractInteractionDefaults,
                        ...Object.entries(item.methodData).map(([key, value]) => ({ name: key, type: value[0] })),
                    ] }),
            };
        }
        // Else multicall is ETH transfer
        return {
            batchMulticallTypes: [...acc.batchMulticallTypes, { name: `transaction_${index + 1}`, type: "EthTransfer" }],
            txTypes: txTypeExists
                ? acc.txTypes
                : Object.assign(Object.assign({}, acc.txTypes), { EthTransfer: [{ name: "details", type: "Transaction_" }] }),
        };
    }, {
        batchMulticallTypes: [],
        txTypes: {},
    });
    // Creates messages from multiCalls array for EIP712 sign
    // If multicall has encoded contract data, add method_params_offset, method_params_length and method data variables
    // Else multicall is ETH Transfer - add only details
    const typedDataMessage = call.multiCalls.reduce((acc, item, index) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return (Object.assign(Object.assign({}, acc), { [`transaction_${index + 1}`]: item.data
                ? Object.assign({ details: {
                        signer: item.signer,
                        call_address: item.to,
                        call_ens: item.toEnsHash || "",
                        eth_value: item.value,
                        gas_limit: Number.parseInt("0x" + maxGas),
                        view_only: ((_a = item.flags) === null || _a === void 0 ? void 0 : _a.viewOnly) || false,
                        continue_on_fail: ((_b = item.flags) === null || _b === void 0 ? void 0 : _b.continueOnFail) || false,
                        stop_on_fail: ((_c = item.flags) === null || _c === void 0 ? void 0 : _c.stopOnFail) || false,
                        stop_on_success: ((_d = item.flags) === null || _d === void 0 ? void 0 : _d.stopOnSuccess) || false,
                        revert_on_success: ((_e = item.flags) === null || _e === void 0 ? void 0 : _e.revertOnSuccess) || false,
                        method_interface: item.methodInterface || "",
                    }, method_params_offset: "0x60", method_params_length: "0x40" }, Object.entries(item.methodData).reduce((acc, [key, value]) => {
                    return Object.assign(Object.assign({}, acc), { [key]: value[1] });
                }, {})) : {
                details: {
                    signer: item.signer,
                    call_address: item.to,
                    call_ens: item.toEnsHash || "",
                    eth_value: item.value,
                    gas_limit: Number.parseInt("0x" + maxGas),
                    view_only: ((_f = item.flags) === null || _f === void 0 ? void 0 : _f.viewOnly) || false,
                    continue_on_fail: ((_g = item.flags) === null || _g === void 0 ? void 0 : _g.continueOnFail) || false,
                    stop_on_fail: ((_h = item.flags) === null || _h === void 0 ? void 0 : _h.stopOnFail) || false,
                    stop_on_success: ((_j = item.flags) === null || _j === void 0 ? void 0 : _j.stopOnSuccess) || false,
                    revert_on_success: ((_k = item.flags) === null || _k === void 0 ? void 0 : _k.revertOnSuccess) || false,
                    method_interface: "",
                },
            } }));
    }, {});
    const typedData = {
        types: Object.assign({ EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
                { name: "salt", type: "bytes32" },
            ], BatchMultiSigCall_: [{ name: "limits", type: "Limits_" }, ...txTypes.batchMulticallTypes], Limits_: [
                { name: "nonce", type: "uint64" },
                { name: "refund", type: "bool" },
                { name: "valid_from", type: "uint40" },
                { name: "expires_at", type: "uint40" },
                { name: "gas_price_limit", type: "uint64" },
            ], Transaction_: [
                { name: "signer", type: "address" },
                { name: "call_address", type: "address" },
                { name: "call_ens", type: "string" },
                { name: "eth_value", type: "uint256" },
                { name: "gas_limit", type: "uint32" },
                { name: "view_only", type: "bool" },
                { name: "continue_on_fail", type: "bool" },
                { name: "stop_on_fail", type: "bool" },
                { name: "stop_on_success", type: "bool" },
                { name: "revert_on_success", type: "bool" },
                { name: "method_interface", type: "string" },
            ] }, txTypes.txTypes),
        primaryType: "BatchMultiSigCall_",
        domain: {
            name: yield FactoryProxy.methods.NAME().call(),
            version: yield FactoryProxy.methods.VERSION().call(),
            chainId: Number("0x" + web3.utils.toBN(yield FactoryProxy.methods.CHAIN_ID().call()).toString("hex")),
            verifyingContract: factoryProxyAddress,
            salt: yield FactoryProxy.methods.uid().call(),
        },
        message: Object.assign({ limits: {
                nonce: "0x" + group + tnonce,
                refund: batchFlags.payment,
                valid_from: Number.parseInt("0x" + after),
                expires_at: Number.parseInt("0x" + before),
                gas_price_limit: Number.parseInt("0x" + maxGasPrice),
            } }, typedDataMessage),
    };
    const messageDigest = ethers_eip712_1.TypedDataUtils.encodeDigest(typedData);
    const getSignature = (signer, i) => __awaiter(void 0, void 0, void 0, function* () {
        if (call.signerPrivateKeys) {
            let signature;
            const signingKey = new ethers_1.ethers.utils.SigningKey(call.signerPrivateKeys[i]);
            signature = signingKey.signDigest(messageDigest);
            signature.v = "0x" + signature.v.toString(16);
            return signature;
        }
        else if (window && "ethereum" in window) {
            // Do a request for MetaMask to sign EIP712
            return;
        }
        else {
            throw new Error("Browser doesn't have a Metamask and signerPrivateKey hasn't been provided");
        }
    });
    return {
        signatures: yield Promise.all(call.signers.map(getSignature)),
        typeHash: ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, typedData.primaryType),
        sessionId: getSessionId(),
        mcall: call.multiCalls.map((item, index) => ({
            typeHash: ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, typedData.types.BatchMultiSigCall_[index + 1].type),
            functionSignature: item.methodInterface
                ? web3.utils.sha3(item.methodInterface)
                : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
            value: item.value,
            signer: item.signer,
            gasLimit: Number.parseInt("0x" + maxGas),
            flags: item.flags ? (0, helpers_1.manageCallFlags)(item.flags) : "0",
            to: item.to,
            ensHash: item.toEnsHash
                ? web3.utils.sha3(item.toEnsHash)
                : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
            data: item.data && item.data.length > 0 ? "0x" + item.data.slice(10) : "0x",
        })),
    };
});
class BatchMultiSigCall {
    constructor(web3, contractAddress) {
        this.calls = [];
        this.web3 = web3;
        // @ts-ignore
        this.FactoryProxy = new web3.eth.Contract(factoryProxy__abi_json_1.default, contractAddress);
        this.factoryProxyAddress = contractAddress;
    }
    addBatchCall(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
            this.calls = [...this.calls, data];
            return this.calls;
        });
    }
    addMultipleBatchCalls(txs) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Promise.all(txs.map((tx) => getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx)));
            this.calls = [...this.calls, ...data];
            return this.calls;
        });
    }
    execute(activator, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const calls = this.calls;
            if (calls.length === 0) {
                throw new Error("No calls haven't been added");
            }
            return yield this.FactoryProxy.methods.batchMultiSigCall_(calls, groupId).send({ from: activator });
        });
    }
}
exports.BatchMultiSigCall = BatchMultiSigCall;
