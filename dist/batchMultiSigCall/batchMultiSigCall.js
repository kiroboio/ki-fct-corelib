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
const checkers_1 = require("./methods/checkers");
const FCT_1 = require("./methods/FCT");
const helpers_2 = require("./methods/helpers");
const plugins_1 = require("./methods/plugins");
const variables_1 = require("./methods/variables");
class BatchMultiSigCall {
    constructor(input = {}) {
        this.FCT_Controller = new ethers_1.ethers.utils.Interface(FCT_Controller_abi_json_1.default);
        this.FCT_BatchMultiSigCall = new ethers_1.ethers.utils.Interface(FCT_BatchMultiSigCall_abi_json_1.default);
        this.batchMultiSigSelector = "0x2409a934";
        this.version = "0x010102";
        this.computedVariables = [];
        this.calls = [];
        this.options = {
            maxGasPrice: "30000000000",
            validFrom: (0, helpers_1.getDate)(),
            expiresAt: (0, helpers_1.getDate)(7),
            purgeable: false,
            blockable: true,
            builder: "0x0000000000000000000000000000000000000000",
        };
        // Helpers
        // Options
        this.setOptions = helpers_2.setOptions;
        // Plugin functions
        this.getPlugin = plugins_1.getPlugin;
        this.getPluginClass = plugins_1.getPluginClass;
        // FCT Functions
        this.create = FCT_1.create;
        this.createMultiple = FCT_1.createMultiple;
        this.exportFCT = FCT_1.exportFCT;
        this.importFCT = FCT_1.importFCT;
        this.importEncodedFCT = FCT_1.importEncodedFCT;
        this.getCall = FCT_1.getCall;
        // Utility functions
        this.getPluginData = plugins_1.getPluginData;
        this.getAllRequiredApprovals = helpers_2.getAllRequiredApprovals;
        // Variables
        this.getVariable = variables_1.getVariable;
        this.getOutputVariable = variables_1.getOutputVariable;
        this.getExternalVariable = variables_1.getExternalVariable;
        this.getComputedVariable = variables_1.getComputedVariable;
        // Internal helper functions
        this.createTypedData = helpers_2.createTypedData;
        this.getParamsFromCall = helpers_2.getParamsFromCall;
        this.verifyParams = helpers_2.verifyParams;
        this.handleTo = helpers_2.handleTo;
        this.handleValue = helpers_2.handleValue;
        // Validation functions
        this.verifyCall = checkers_1.verifyCall;
        if (input.chainId) {
            this.chainId = input.chainId;
        }
        else {
            this.chainId = "5"; // For now we default to Goerli. TODO: Change this to mainnet
        }
        if (input.options)
            this.setOptions(input.options);
    }
    get length() {
        return this.calls.length;
    }
}
exports.BatchMultiSigCall = BatchMultiSigCall;
