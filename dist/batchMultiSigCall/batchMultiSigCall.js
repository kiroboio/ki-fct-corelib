"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchMultiSigCall = void 0;
const ethers_1 = require("ethers");
const FCT_BatchMultiSigCall_abi_json_1 = __importDefault(require("../abi/FCT_BatchMultiSigCall.abi.json"));
const FCT_Controller_abi_json_1 = __importDefault(require("../abi/FCT_Controller.abi.json"));
const helpers_1 = require("../helpers");
const constants_1 = require("./constants");
const fct_1 = require("./helpers/fct");
const methods_1 = require("./methods");
const computed_1 = require("./methods/computed");
class BatchMultiSigCall {
    constructor(input = {}) {
        this.FCT_Controller = new ethers_1.ethers.utils.Interface(FCT_Controller_abi_json_1.default);
        this.FCT_BatchMultiSigCall = new ethers_1.ethers.utils.Interface(FCT_BatchMultiSigCall_abi_json_1.default);
        this.batchMultiSigSelector = "0xf6407ddd";
        this.version = "0x010101";
        this._computed = [];
        this._calls = [];
        this._options = {
            maxGasPrice: "30000000000",
            validFrom: (0, helpers_1.getDate)(),
            expiresAt: (0, helpers_1.getDate)(7),
            purgeable: false,
            blockable: true,
            builder: "0x0000000000000000000000000000000000000000",
            authEnabled: true,
        };
        this._callDefault = {
            value: "0",
            options: constants_1.DEFAULT_CALL_OPTIONS,
        };
        // Set methods
        this.setOptions = methods_1.setOptions;
        this.setCallDefaults = methods_1.setCallDefaults;
        // Add Computed
        this.addComputed = computed_1.addComputed;
        // Plugin functions
        this.getPlugin = methods_1.getPlugin;
        this.getPluginClass = methods_1.getPluginClass;
        this.createPlugin = methods_1.createPlugin;
        // FCT Functions
        this.create = methods_1.create;
        this.createWithEncodedData = methods_1.createWithEncodedData;
        this.createWithPlugin = methods_1.createWithPlugin;
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
        this.createTypedData = methods_1.createTypedData;
        this.getParamsFromCall = methods_1.getParamsFromCall;
        this.handleTo = methods_1.handleTo;
        this.handleValue = methods_1.handleValue;
        this.decodeParams = methods_1.decodeParams;
        // Validation functions
        this.verifyCall = methods_1.verifyCall;
        // Getter functions
        this._getDecodedCalls = methods_1._getDecodedCalls;
        this._getCalls = methods_1._getCalls;
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
            this.domain = fct_1.TYPED_DATA_DOMAIN[this.chainId];
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
        return {
            ...this._options,
            name: this._options.name || "",
            recurrency: {
                maxRepeats: this._options.recurrency?.maxRepeats || "1",
                chillTime: this._options.recurrency?.chillTime || "0",
                accumetable: this._options.recurrency?.accumetable || false,
            },
            multisig: {
                externalSigners: this._options.multisig?.externalSigners || [],
                minimumApprovals: this._options.multisig?.minimumApprovals || "1",
            },
        };
    }
    get calls() {
        return this._getCalls();
    }
    get decodedCalls() {
        return this._getDecodedCalls();
    }
    get computedVariables() {
        return [];
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
