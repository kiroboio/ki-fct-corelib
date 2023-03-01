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
exports.BatchMultiSigCall = void 0;
const ethers_1 = require("ethers");
const FCT_BatchMultiSigCall_abi_json_1 = __importDefault(require("../abi/FCT_BatchMultiSigCall.abi.json"));
const FCT_Controller_abi_json_1 = __importDefault(require("../abi/FCT_Controller.abi.json"));
const helpers_1 = require("../helpers");
const classes_1 = require("./classes");
const constants_1 = require("./constants");
const methods_1 = require("./methods");
const utils = __importStar(require("./utils"));
class BatchMultiSigCall {
    constructor(input = {}) {
        this.FCT_Controller = new ethers_1.ethers.utils.Interface(FCT_Controller_abi_json_1.default);
        this.FCT_BatchMultiSigCall = new ethers_1.ethers.utils.Interface(FCT_BatchMultiSigCall_abi_json_1.default);
        this.batchMultiSigSelector = "0xf6407ddd";
        this.version = "0x010101";
        this.randomId = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
        this._computed = [];
        this._options = new classes_1.Options();
        // Set methods
        this.setOptions = (options) => {
            return this._options.set(options);
        };
        this.setCallDefaults = (callDefault) => {
            return this._calls.setCallDefaults(callDefault);
        };
        // Add Computed
        this.addComputed = methods_1.addComputed;
        // Plugin functions
        this.getPlugin = methods_1.getPlugin;
        this.getPluginClass = methods_1.getPluginClass;
        this.createPlugin = methods_1.createPlugin;
        // FCT Functions
        this.create = methods_1.create;
        this.createMultiple = methods_1.createMultiple;
        this.exportFCT = methods_1.exportFCT;
        this.importFCT = methods_1.importFCT;
        this.importEncodedFCT = methods_1.importEncodedFCT;
        this.getCall = methods_1.getCall;
        // Utility functions
        this.getPluginData = methods_1.getPluginData;
        this.getAllRequiredApprovals = methods_1.getAllRequiredApprovals;
        // Variables
        this.getVariable = methods_1.getVariable;
        this.getOutputVariable = methods_1.getOutputVariable;
        this.getExternalVariable = methods_1.getExternalVariable;
        this.getComputedVariable = methods_1.getComputedVariable;
        // Internal helper functions
        this.decodeParams = methods_1.decodeParams;
        this.handleVariableValue = methods_1.handleVariableValue;
        if (input.chainId) {
            this.chainId = input.chainId;
        }
        else {
            this.chainId = "5"; // For now we default to Goerli. TODO: Change this to mainnet
        }
        if (input.domain) {
            this.domain = input.domain;
        }
        else {
            this.domain = classes_1.EIP712.getTypedDataDomain(this.chainId);
        }
        if (input.version)
            this.version = input.version;
        if (input.options)
            this.setOptions(input.options);
        if (input.defaults)
            this.setCallDefaults(input.defaults);
        this._calls = new classes_1.FCTCalls(this, {
            value: "0",
            options: constants_1.DEFAULT_CALL_OPTIONS,
        });
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
        return this._computed;
    }
    get convertedComputed() {
        const handleVariable = (value) => {
            if ((0, helpers_1.instanceOfVariable)(value)) {
                return this.getVariable(value, "uint256");
            }
            return value;
        };
        return this._computed.map((c, i) => ({
            index: (i + 1).toString(),
            value: handleVariable(c.value),
            add: handleVariable(c.add),
            sub: handleVariable(c.sub),
            mul: handleVariable(c.mul),
            pow: handleVariable(c.pow),
            div: handleVariable(c.div),
            mod: handleVariable(c.mod),
        }));
    }
}
exports.BatchMultiSigCall = BatchMultiSigCall;
// Static methods
BatchMultiSigCall.utils = utils;
