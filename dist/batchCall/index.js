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
const getMethodInterface = (call) => {
    return `${call.method}(${call.params.map((item) => item.type).join(",")})`;
};
const getTypeHash = (typedData) => {
    const m2 = ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, typedData.primaryType);
    return ethers_1.ethers.utils.hexZeroPad(ethers_1.ethers.utils.hexlify(m2), 32);
};
const getTypedDataDomain = (web3, factoryProxy, factoryProxyAddress) => __awaiter(void 0, void 0, void 0, function* () {
    const chainId = yield factoryProxy.methods.CHAIN_ID().call();
    return {
        name: yield factoryProxy.methods.NAME().call(),
        version: yield factoryProxy.methods.VERSION().call(),
        chainId: Number("0x" + web3.utils.toBN(chainId).toString("hex")),
        verifyingContract: factoryProxyAddress,
        salt: yield factoryProxy.methods.uid().call(),
    };
});
// DefaultFlag - "f1" // payment + eip712
const defaultFlags = {
    eip712: true,
    payment: true,
    staticCall: false,
};
const getBatchCallData = (web3, factoryProxy, factoryProxyAddress, call) => __awaiter(void 0, void 0, void 0, function* () {
    const group = (0, helpers_1.getGroupId)(call.groupId);
    const tnonce = (0, helpers_1.getNonce)(call.nonce);
    const after = (0, helpers_1.getAfterTimestamp)(call.afterTimestamp || 0);
    const before = call.beforeTimestamp ? (0, helpers_1.getBeforeTimestamp)(false, call.beforeTimestamp) : (0, helpers_1.getBeforeTimestamp)(true);
    const maxGas = (0, helpers_1.getMaxGas)(call.maxGas || 0);
    const maxGasPrice = call.maxGasPrice ? (0, helpers_1.getMaxGasPrice)(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
    const flags = Object.assign(Object.assign({}, defaultFlags), call.flags);
    const eip712 = (0, helpers_1.getFlags)(flags, true);
    const getSessionId = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;
    const methodParams = call.params
        ? Object.assign({ method_params_offset: "0x60", method_params_length: "0x40" }, call.params.reduce((acc, item) => (Object.assign(Object.assign({}, acc), { [item.name]: item.value })), {})) : {};
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
        domain: yield getTypedDataDomain(web3, factoryProxy, factoryProxyAddress),
        message: Object.assign({ transaction: {
                call_address: call.to,
                call_ens: call.toEnsHash || "",
                eth_value: call.value,
                nonce: "0x" + group + tnonce,
                valid_from: Number.parseInt("0x" + after),
                expires_at: Number.parseInt("0x" + before),
                gas_limit: Number.parseInt("0x" + maxGas),
                gas_price_limit: Number.parseInt("0x" + maxGasPrice),
                view_only: flags.staticCall,
                refund: flags.payment,
                method_interface: call.method ? getMethodInterface(call) : "",
            } }, methodParams),
    };
    const hashedMessage = ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeData(typedData, typedData.primaryType, typedData.message));
    const hashedTxMessage = ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeData(typedData, "Transaction_", typedData.message.transaction));
    const encodedMethodParamsData = `0x${call.method
        ? utils_1.defaultAbiCoder.encode([getMethodInterface(call)], [call.params.map((item) => item.value)]).slice(2)
        : ""}`;
    return {
        typeHash: getTypeHash(typedData),
        to: call.to,
        ensHash: call.toEnsHash
            ? web3.utils.sha3(call.toEnsHash)
            : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        value: call.value,
        // sessionId: getSessionId() + signature.v.slice(2).padStart(2, "0"),
        sessionId: getSessionId(),
        signer: call.signer,
        functionSignature: call.method
            ? web3.utils.sha3(getMethodInterface(call))
            : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        data: encodedMethodParamsData,
        typedData,
        hashedMessage,
        hashedTxMessage,
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
    verifyMessage(message, signature, address) {
        const messageAddress = this.web3.eth.accounts.recover(message, signature);
        return messageAddress.toLowerCase() === address.toLowerCase();
    }
    decodeData(data, txData, params) {
        const decodedData = params
            ? utils_1.defaultAbiCoder.decode(["bytes32", "bytes32", "uint256", "uint256", ...params.map((item) => item.type)], data)
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
                maxGas: decodedTxData[7],
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
            const data = yield getBatchCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
            this.calls = [...this.calls, data];
            return this.calls;
        });
    }
    addMultipleTx(txs) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Promise.all(txs.map((tx, i) => getBatchCallData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx)));
            this.calls = [...this.calls, ...data];
            return data;
        });
    }
}
exports.BatchCall = BatchCall;
