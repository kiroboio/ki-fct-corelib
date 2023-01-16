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
const data_1 = __importDefault(require("./data"));
const FCT_1 = require("./methods/FCT");
const helpers_2 = require("./methods/helpers");
const plugins_1 = require("./methods/plugins");
const variables_1 = require("./methods/variables");
const utils_1 = require("./utils");
class BatchMultiSigCall {
    constructor({ provider, contractAddress, options, chainId, }) {
        this.batchMultiSigSelector = "0x2409a934";
        this.computedVariables = [];
        this.calls = [];
        this.options = {
            maxGasPrice: "100000000000",
            validFrom: (0, helpers_1.getDate)(),
            expiresAt: (0, helpers_1.getDate)(7),
            purgeable: false,
            blockable: true,
            builder: "0x0000000000000000000000000000000000000000",
        };
        // Helpers
        this.getCalldataForActuator = helpers_2.getCalldataForActuator;
        this.getAllRequiredApprovals = helpers_2.getAllRequiredApprovals;
        // Variables
        this.getVariable = variables_1.getVariable;
        this.getOutputVariable = variables_1.getOutputVariable;
        this.getExternalVariable = variables_1.getExternalVariable;
        this.getComputedVariable = variables_1.getComputedVariable;
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
        // Helpers functions
        this.createTypedData = helpers_2.createTypedData;
        this.getParamsFromCall = helpers_2.getParamsFromCall;
        this.verifyParams = helpers_2.verifyParams;
        this.handleTo = helpers_2.handleTo;
        this.handleValue = helpers_2.handleValue;
        // Utility functions
        // public utils = utils;
        this.getPluginData = utils_1.getPluginData;
        this.FCT_Controller = new ethers_1.ethers.Contract(contractAddress || data_1.default[chainId || 1], FCT_Controller_abi_json_1.default, provider);
        if (chainId) {
            this.chainId = chainId;
        }
        this.FCT_BatchMultiSigCall = new ethers_1.ethers.utils.Interface(FCT_BatchMultiSigCall_abi_json_1.default);
        this.provider = provider;
        if (options) {
            this.setOptions(options);
        }
    }
    get length() {
        return this.calls.length;
    }
}
exports.BatchMultiSigCall = BatchMultiSigCall;
