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
exports.BatchTransfer = void 0;
const ethers_1 = require("ethers");
const ethers_eip712_1 = require("ethers-eip712");
const utils_1 = require("ethers/lib/utils");
const factoryProxy__abi_json_1 = __importDefault(require("../abi/factoryProxy_.abi.json"));
const helpers_1 = require("../helpers");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const batchTransferTypedData = {
    types: {
        EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
            { name: "salt", type: "bytes32" },
        ],
        BatchTransfer_: [
            { name: "token_address", type: "address" },
            { name: "token_ens", type: "string" },
            { name: "to", type: "address" },
            { name: "to_ens", type: "string" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint64" },
            { name: "valid_from", type: "uint40" },
            { name: "expires_at", type: "uint40" },
            { name: "gas_limit", type: "uint32" },
            { name: "gas_price_limit", type: "uint64" },
            { name: "refund", type: "bool" },
        ],
    },
    primaryType: "BatchTransfer_",
};
// DefaultFlag - "f1" // payment + eip712
const defaultFlags = {
    eip712: true,
    payment: true,
};
const getBatchTransferData = (web3, FactoryProxy, factoryProxyAddress, call) => __awaiter(void 0, void 0, void 0, function* () {
    const callDetails = (0, helpers_1.getSessionIdDetails)(call, defaultFlags, true);
    const typedData = Object.assign(Object.assign({}, batchTransferTypedData), { domain: yield (0, helpers_1.getTypedDataDomain)(web3, FactoryProxy, factoryProxyAddress), message: {
            token_address: call.token || ZERO_ADDRESS,
            token_ens: call.tokenEns || "",
            to: call.to,
            to_ens: call.toEns || "",
            value: call.value,
            nonce: "0x" + callDetails.group + callDetails.nonce,
            valid_from: "0x" + callDetails.after,
            expires_at: "0x" + callDetails.before,
            gas_limit: "0x" + callDetails.gasLimit,
            gas_price_limit: "0x" + callDetails.maxGasPrice,
            refund: callDetails.pureFlags.payment,
        } });
    const encodedMessage = ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeData(typedData, typedData.primaryType, typedData.message));
    return {
        signer: call.signer,
        token: call.token || ZERO_ADDRESS,
        tokenEnsHash: call.tokenEns
            ? web3.utils.sha3(call.tokenEns)
            : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        to: call.to,
        toEnsHash: call.toEns
            ? web3.utils.sha3(call.toEns)
            : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        value: call.value,
        sessionId: callDetails.sessionId,
        encodedMessage,
        typedData,
        inputData: call,
    };
});
class BatchTransfer {
    constructor(web3, contractAddress) {
        this.calls = [];
        this.web3 = web3;
        // @ts-ignore
        this.FactoryProxy = new web3.eth.Contract(factoryProxy__abi_json_1.default, contractAddress);
        this.factoryProxyAddress = contractAddress;
    }
    decodeData(data) {
        const decodedData = utils_1.defaultAbiCoder.decode([
            "bytes32",
            "address",
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
        ], data);
        return {
            token: decodedData[1],
            tokenEnsHash: decodedData[2] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
                ? decodedData[2]
                : undefined,
            to: decodedData[3],
            toEnsHash: decodedData[4] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
                ? decodedData[4]
                : undefined,
            value: decodedData[5].toString(),
            nonce: decodedData[6].toHexString(),
            afterTimestamp: decodedData[7],
            beforeTimestamp: decodedData[8],
            maxGas: decodedData[9],
            maxGasPrice: decodedData[10].toString(),
            payable: decodedData[11],
        };
    }
    addTx(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
            this.calls = [...this.calls, data];
            return this.calls;
        });
    }
    addMultipleTx(txs) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Promise.all(txs.map((tx) => getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx)));
            this.calls = [...this.calls, ...data];
            return this.calls;
        });
    }
    editTx(index, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
            this.calls[index] = data;
            return this.calls;
        });
    }
    removeTx(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const restOfCalls = this.calls
                .slice(index + 1)
                .map((call) => (Object.assign(Object.assign({}, call.inputData), { nonce: call.inputData.nonce - 1 })));
            // Remove from calls
            this.calls.splice(index, 1);
            // Adjust nonce number for the rest of the calls
            const data = yield Promise.all(restOfCalls.map((tx) => getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx)));
            this.calls.splice(-Math.abs(data.length), data.length, ...data);
            return this.calls;
        });
    }
}
exports.BatchTransfer = BatchTransfer;
