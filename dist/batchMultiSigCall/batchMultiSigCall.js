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
exports.BatchMultiSigCall = void 0;
const classes_1 = require("./classes");
const constants_1 = require("./constants");
const methods_1 = require("./methods");
const utils = __importStar(require("./utils"));
class BatchMultiSigCall {
    constructor(input = {}) {
        this.batchMultiSigSelector = "0xf6407ddd";
        this.version = "0x010101";
        this.randomId = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
        // Utils
        this.utils = new classes_1.FCTUtils(this);
        this._variables = new classes_1.Variables(this);
        this._options = new classes_1.Options();
        this._calls = new classes_1.FCTCalls(this, {
            value: "0",
            options: constants_1.DEFAULT_CALL_OPTIONS,
        });
        // Setters
        this.setOptions = (options) => {
            return this._options.set(options);
        };
        this.setCallDefaults = (callDefault) => {
            return this._calls.setCallDefaults(callDefault);
        };
        this.changeChainId = (chainId) => {
            this.chainId = chainId;
            const domain = classes_1.EIP712.getTypedDataDomain(this.chainId);
            if (!domain)
                throw new Error(`ChainId ${this.chainId} is not supported. Please provide a custom EIP712 domain.`);
            this.domain = domain;
        };
        // Variables
        this.addComputed = (computed) => {
            return this._variables.addComputed(computed);
        };
        // Plugin functions
        this.getPlugin = methods_1.getPlugin;
        this.getPluginClass = methods_1.getPluginClass;
        this.getPluginData = methods_1.getPluginData;
        this.createPlugin = methods_1.createPlugin;
        // FCT Functions
        this.create = methods_1.create;
        this.createMultiple = methods_1.createMultiple;
        this.exportFCT = methods_1.exportFCT;
        this.importFCT = methods_1.importFCT;
        this.importEncodedFCT = methods_1.importEncodedFCT;
        this.getCall = methods_1.getCall;
        if (input.chainId) {
            this.chainId = input.chainId;
        }
        else {
            this.chainId = "5"; // @todo This should be changed to mainnet in the future. For now we use Goerli
        }
        if (input.domain) {
            this.domain = input.domain;
        }
        else {
            const domain = classes_1.EIP712.getTypedDataDomain(this.chainId);
            if (!domain)
                throw new Error(`ChainId ${this.chainId} is not supported. Please provide a custom EIP712 domain.`);
        }
        if (input.version)
            this.version = input.version;
        if (input.options)
            this.setOptions(input.options);
        if (input.defaults)
            this.setCallDefaults(input.defaults);
    }
    // Getters
    get options() {
        return this._options.get();
    }
    get calls() {
        return this._calls.get();
    }
    get decodedCalls() {
        return this._calls.getWithDecodedVariables();
    }
    get computed() {
        return this._variables.computed;
    }
    get computedWithValues() {
        return this._variables.computedWithValues;
    }
}
exports.BatchMultiSigCall = BatchMultiSigCall;
// Static functions
BatchMultiSigCall.utils = utils;
BatchMultiSigCall.from = (input) => {
    const batchMultiSigCall = new BatchMultiSigCall();
    batchMultiSigCall.importFCT(input);
    return batchMultiSigCall;
};
