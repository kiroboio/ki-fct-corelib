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
const web3_1 = __importDefault(require("web3"));
const factoryProxy__abi_json_1 = __importDefault(require("../abi/factoryProxy_.abi.json"));
const helpers_1 = require("../helpers");
const web3 = new web3_1.default();
// Move to seperate folder/file where all the helper functions will be located
const getTypedDataDomain = (factoryProxy, factoryProxyAddress) => __awaiter(void 0, void 0, void 0, function* () {
    const chainId = yield factoryProxy.methods.CHAIN_ID().call();
    return {
        name: yield factoryProxy.methods.NAME().call(),
        version: yield factoryProxy.methods.VERSION().call(),
        chainId: Number("0x" + web3.utils.toBN(chainId).toString("hex")),
        verifyingContract: factoryProxyAddress,
        salt: yield factoryProxy.methods.uid().call(),
    };
});
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
    const group = (0, helpers_1.getGroupId)(call.groupId);
    const tnonce = (0, helpers_1.getNonce)(call.nonce);
    const after = (0, helpers_1.getAfterTimestamp)(call.afterTimestamp || 0);
    const before = call.beforeTimestamp ? (0, helpers_1.getBeforeTimestamp)(false, call.beforeTimestamp) : (0, helpers_1.getBeforeTimestamp)(true);
    const maxGas = (0, helpers_1.getMaxGas)(call.maxGas || 0);
    const maxGasPrice = call.maxGasPrice ? (0, helpers_1.getMaxGasPrice)(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
    const flags = Object.assign(Object.assign({}, defaultFlags), call.flags);
    const eip712 = (0, helpers_1.getFlags)(flags, true);
    const getSessionIdERC20 = () => `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;
    const typedData = Object.assign(Object.assign({}, batchTransferTypedData), { domain: yield getTypedDataDomain(FactoryProxy, factoryProxyAddress), message: {
            token_address: call.token,
            token_ens: call.tokenEnsHash || "",
            to: call.to,
            to_ens: call.toEnsHash || "",
            value: call.value,
            nonce: "0x" + group + tnonce,
            valid_from: "0x" + after,
            expires_at: "0x" + before,
            gas_limit: "0x" + maxGas,
            gas_price_limit: "0x" + maxGasPrice,
            refund: flags.payment,
        } });
    const messageDigest = ethers_eip712_1.TypedDataUtils.encodeDigest(typedData);
    let signature;
    if (call.signerPrivateKey) {
        const signingKey = new ethers_1.ethers.utils.SigningKey(call.signerPrivateKey);
        signature = signingKey.signDigest(messageDigest);
        signature.v = "0x" + signature.v.toString(16);
    }
    else if (window && "ethereum" in window) {
        // Do a request for MetaMask to sign EIP712
    }
    else {
        throw new Error("Browser doesn't have a Metamask and signerPrivateKey hasn't been provided");
    }
    return {
        r: signature.r,
        s: signature.s,
        signer: call.signer,
        token: call.token,
        tokenEnsHash: call.tokenEnsHash
            ? web3.utils.sha3(call.tokenEnsHash)
            : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        to: call.to,
        toEnsHash: call.toEnsHash
            ? web3.utils.sha3(call.toEnsHash)
            : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        value: call.value,
        sessionId: getSessionIdERC20() + signature.v.slice(2).padStart(2, "0"),
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
    execute(activator, groupId, silentRevert) {
        return __awaiter(this, void 0, void 0, function* () {
            const calls = this.calls;
            if (calls.length === 0) {
                throw new Error("No calls haven't been added");
            }
            return yield this.FactoryProxy.methods.batchTransfer_(calls, groupId, silentRevert).send({ from: activator });
        });
    }
}
exports.BatchTransfer = BatchTransfer;
