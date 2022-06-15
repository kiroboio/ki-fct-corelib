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
exports.BatchCall = void 0;
const ethers_1 = require("ethers");
const ethers_eip712_1 = require("ethers-eip712");
const utils_1 = require("ethers/lib/utils");
const factoryProxy__abi_json_1 = __importDefault(require("../abi/factoryProxy_.abi.json"));
const helpers_1 = require("../helpers");
// DefaultFlag - "f1" // payment + eip712
const defaultFlags = {
    eip712: true,
    payment: true,
};
const getBatchCallData = (web3, factoryProxy, factoryProxyAddress, call) => __awaiter(void 0, void 0, void 0, function* () {
    const callDetails = (0, helpers_1.getSessionIdDetails)(call, defaultFlags, true);
    const methodParams = call.params
        ? Object.assign({ method_params_offset: (0, helpers_1.getParamsOffset)(), method_params_length: (0, helpers_1.getParamsLength)((0, helpers_1.getEncodedMethodParams)(call)) }, call.params.reduce((acc, item) => (Object.assign(Object.assign({}, acc), { [item.name]: item.value })), {})) : {};
    const contractType = call.params
        ? [
            { name: "method_params_offset", type: "uint256" },
            { name: "method_params_length", type: "uint256" },
            ...call.params.reduce((acc, item) => [...acc, { name: item.name, type: item.type }], []),
        ]
        : [];
    const typedData = {
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
                { name: "salt", type: "bytes32" },
            ],
            BatchCall_: [{ name: "transaction", type: "Transaction_" }, ...contractType],
            Transaction_: [
                { name: "call_address", type: "address" },
                { name: "call_ens", type: "string" },
                { name: "eth_value", type: "uint256" },
                { name: "nonce", type: "uint64" },
                { name: "valid_from", type: "uint40" },
                { name: "expires_at", type: "uint40" },
                { name: "gas_limit", type: "uint32" },
                { name: "gas_price_limit", type: "uint64" },
                { name: "view_only", type: "bool" },
                { name: "refund", type: "bool" },
                { name: "method_interface", type: "string" },
            ],
        },
        primaryType: "BatchCall_",
        domain: yield (0, helpers_1.getTypedDataDomain)(web3, factoryProxy, factoryProxyAddress),
        message: Object.assign({ transaction: {
                call_address: call.to,
                call_ens: call.toEns || "",
                eth_value: call.value,
                nonce: "0x" + callDetails.group + callDetails.nonce,
                valid_from: Number.parseInt("0x" + callDetails.after),
                expires_at: Number.parseInt("0x" + callDetails.before),
                gas_limit: Number.parseInt("0x" + callDetails.gasLimit),
                gas_price_limit: Number.parseInt("0x" + callDetails.maxGasPrice),
                view_only: callDetails.pureFlags.viewOnly,
                refund: callDetails.pureFlags.payment,
                method_interface: call.method ? (0, helpers_1.getMethodInterface)(call) : "",
            } }, methodParams),
    };
    const encodedMessage = ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeData(typedData, typedData.primaryType, typedData.message));
    const encodedTxMessage = ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeData(typedData, "Transaction_", typedData.message.transaction));
    return {
        typeHash: (0, helpers_1.getTypeHash)(typedData),
        to: call.to,
        ensHash: call.toEns
            ? web3.utils.sha3(call.toEns)
            : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        value: call.value,
        sessionId: callDetails.sessionId,
        signer: call.signer,
        functionSignature: call.method
            ? web3.utils.sha3((0, helpers_1.getMethodInterface)(call))
            : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        data: (0, helpers_1.getEncodedMethodParams)(call),
        typedData,
        encodedMessage,
        encodedTxMessage,
        unhashedCall: call,
    };
});
class BatchCall {
    constructor(web3, contractAddress) {
        this.calls = [];
        this.web3 = web3;
        // @ts-ignore
        this.FactoryProxy = new web3.eth.Contract(factoryProxy__abi_json_1.default, contractAddress);
        this.factoryProxyAddress = contractAddress;
    }
    decodeData(data, txData, params) {
        const decodedData = params
            ? utils_1.defaultAbiCoder.decode(["bytes32", "bytes32", "bytes32", "bytes32", ...params.map((item) => item.type)], data)
            : utils_1.defaultAbiCoder.decode(["bytes32", "bytes32"], data);
        const decodedTxData = utils_1.defaultAbiCoder.decode([
            "bytes32",
            "address",
            "bytes32",
            "uint256",
            "uint64",
            "uint40",
            "uint40",
            "uint32",
            "uint64",
            "bool",
            "bool",
            "bytes32",
        ], txData);
        const defaultReturn = {
            typeHash: decodedData[0],
            txHash: decodedData[1],
            transaction: {
                to: decodedTxData[1],
                toEnsHash: decodedTxData[2] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
                    ? decodedTxData[2]
                    : undefined,
                value: decodedTxData[3].toString(),
                nonce: decodedTxData[4].toHexString(),
                afterTimestamp: decodedTxData[5],
                beforeTimestamp: decodedTxData[6],
                gasLimit: decodedTxData[7],
                maxGasPrice: decodedTxData[8].toString(),
                staticCall: decodedTxData[9],
                payment: decodedTxData[10],
                methodHash: decodedTxData[11] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
                    ? decodedTxData[11]
                    : undefined,
            },
        };
        const extraData = params
            ? params.reduce((acc, item, i) => (Object.assign(Object.assign({}, acc), { [item.name]: ethers_1.ethers.BigNumber.isBigNumber(decodedData[4 + i])
                    ? decodedData[4 + i].toString()
                    : decodedData[4 + i] })), {})
            : {};
        return Object.assign(Object.assign({}, defaultReturn), extraData);
    }
    addTx(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastNonce = this.calls.length !== 0 ? this.calls[this.calls.length - 1].unhashedCall.nonce : 0;
            if (tx.nonce <= lastNonce) {
                tx.nonce = lastNonce + 1;
            }
            const data = yield getBatchCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
            this.calls = [...this.calls, data];
            return this.calls;
        });
    }
    addMultipleTx(txs) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Promise.all(txs.map((tx) => getBatchCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx)));
            this.calls = [...this.calls, ...data];
            return this.calls;
        });
    }
    editTx(index, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getBatchCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
            this.calls[index] = data;
            return this.calls;
        });
    }
    removeTx(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const restOfCalls = this.calls
                .slice(index + 1)
                .map((call) => (Object.assign(Object.assign({}, call.unhashedCall), { nonce: call.unhashedCall.nonce - 1 })));
            // Remove from calls
            this.calls.splice(index, 1);
            // Adjust nonce number for the rest of the calls
            const data = yield Promise.all(restOfCalls.map((tx) => getBatchCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx)));
            this.calls.splice(-Math.abs(data.length), data.length, ...data);
            return this.calls;
        });
    }
}
exports.BatchCall = BatchCall;
