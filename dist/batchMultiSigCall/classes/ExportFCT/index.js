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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportFCT = void 0;
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const utils_1 = require("ethers/lib/utils");
const helpers_1 = require("../../helpers");
const CallID_1 = require("../CallID");
const EIP712_1 = require("../EIP712");
const FCTBase_1 = require("../FCTBase");
const Options_1 = require("../Options");
const SessionID_1 = require("../SessionID");
const helpers = __importStar(require("./helpers"));
class ExportFCT extends FCTBase_1.FCTBase {
    constructor(FCT) {
        super(FCT);
        this.calls = FCT.decodedCalls;
        this._eip712 = new EIP712_1.EIP712(FCT);
        if (this.FCT.calls.length === 0) {
            throw new Error("FCT has no calls");
        }
        Options_1.Options.verify(this.FCT.options);
    }
    get typedData() {
        return this._eip712.getTypedData();
    }
    get mcall() {
        return this.getCalls();
    }
    get sessionId() {
        return new SessionID_1.SessionID(this.FCT).asString();
    }
    get() {
        return {
            typedData: this.typedData,
            builder: this.FCT.options.builder,
            typeHash: (0, utils_1.hexlify)(eth_sig_util_1.TypedDataUtils.hashType(this.typedData.primaryType, this.typedData.types)),
            sessionId: this.sessionId,
            nameHash: (0, utils_1.id)(this.FCT.options.name),
            mcall: this.mcall,
            variables: [],
            externalSigners: [],
            signatures: [this.FCT.utils.getAuthenticatorSignature()],
            computed: this.FCT.computedWithValues.map((c) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { index, ...rest } = c;
                return rest;
            }),
        };
    }
    getCalls() {
        const typedData = this.typedData;
        const calls = this.calls;
        return calls.map((call, index) => {
            const usedTypeStructs = helpers.getUsedStructTypes(typedData, `transaction${index + 1}`);
            return {
                typeHash: (0, utils_1.hexlify)(eth_sig_util_1.TypedDataUtils.hashType(`transaction${index + 1}`, typedData.types)),
                ensHash: (0, utils_1.id)(call.toENS || ""),
                functionSignature: (0, helpers_1.handleFunctionSignature)(call),
                value: this.FCT._variables.getValue(call.value, "uint256", "0"),
                callId: CallID_1.CallID.asString({
                    calls,
                    call,
                    index,
                }),
                from: this.FCT._variables.getValue(call.from, "address"),
                to: this.FCT._variables.getValue(call.to, "address"),
                data: (0, helpers_1.handleData)(call),
                types: (0, helpers_1.handleTypes)(call),
                typedHashes: usedTypeStructs.length > 0
                    ? usedTypeStructs.map((hash) => (0, utils_1.hexlify)(eth_sig_util_1.TypedDataUtils.hashType(hash, typedData.types)))
                    : [],
            };
        });
    }
}
exports.ExportFCT = ExportFCT;
ExportFCT.helpers = helpers;
