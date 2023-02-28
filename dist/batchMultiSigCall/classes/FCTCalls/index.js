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
exports.FCTCalls = void 0;
const constants_1 = require("batchMultiSigCall/constants");
const utils_1 = require("ethers/lib/utils");
const lodash_1 = __importDefault(require("lodash"));
const constants_2 = require("../../../constants");
const helpers = __importStar(require("./helpers"));
function generateNodeId() {
    return [...Array(20)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}
class FCTCalls {
    constructor(FCT, callDefault) {
        this._calls = [];
        this._callDefault = {
            value: "0",
            options: constants_1.DEFAULT_CALL_OPTIONS,
        };
        this.FCT = FCT;
        if (callDefault) {
            this._callDefault = lodash_1.default.merge({}, this._callDefault, callDefault);
        }
    }
    get() {
        return this._calls.map((call) => {
            const fullCall = lodash_1.default.merge({}, this._callDefault, call);
            if (typeof fullCall.from === "undefined") {
                throw new Error("From address is required");
            }
            const from = fullCall.from;
            return { ...fullCall, from };
        });
    }
    getWithDecodedVariables() {
        return this.get().map((call) => {
            const params = call.params;
            if (params && params.length > 0) {
                const parameters = this.FCT.decodeParams(params);
                return { ...call, params: parameters };
            }
            return {
                ...call,
                params: [],
            };
        });
    }
    async create(call) {
        if ("plugin" in call) {
            return await this.createWithPlugin(call);
        }
        else if ("abi" in call) {
            return await this.createWithEncodedData(call);
        }
        else {
            const data = { ...call, nodeId: call.nodeId || generateNodeId() };
            return this.addCall(data);
        }
    }
    async createWithPlugin(callWithPlugin) {
        const pluginCall = await callWithPlugin.plugin.create();
        if (pluginCall === undefined) {
            throw new Error("Error creating call with plugin. Make sure input values are valid");
        }
        const data = {
            ...pluginCall,
            from: callWithPlugin.from,
            options: { ...pluginCall.options, ...callWithPlugin.options },
            nodeId: callWithPlugin.nodeId || generateNodeId(),
        };
        return this.addCall(data);
    }
    async createWithEncodedData(callWithEncodedData) {
        const { value, encodedData, abi, options, nodeId } = callWithEncodedData;
        const iface = new utils_1.Interface(abi);
        const { name, args, value: txValue, functionFragment: { inputs }, } = iface.parseTransaction({
            data: encodedData,
            value: typeof value === "string" ? value : "0",
        });
        const data = {
            from: callWithEncodedData.from,
            to: callWithEncodedData.to,
            method: name,
            params: helpers.getParamsFromInputs(inputs, args),
            options,
            value: txValue?.toString(),
            nodeId: nodeId || generateNodeId(),
        };
        return this.addCall(data);
    }
    setCallDefaults(callDefault) {
        this._callDefault = lodash_1.default.merge({}, this._callDefault, callDefault);
        return this._callDefault;
    }
    addCall(call) {
        // Before adding the call, we check if it is valid
        this.verifyCall(call);
        this._calls.push(call);
        return call;
    }
    verifyCall(call) {
        // To address validator
        if (!call.to) {
            throw new Error("To address is required");
        }
        else if (typeof call.to === "string") {
            helpers.isAddress(call.to, "To");
        }
        // Value validator
        if (call.value && typeof call.value === "string") {
            helpers.isInteger(call.value, "Value");
        }
        // Method validator
        if (call.method && call.method.length === 0) {
            throw new Error("Method cannot be empty string");
        }
        // Node ID validator
        if (call.nodeId) {
            const index = this.get().findIndex((item) => item.nodeId === call.nodeId);
            if (index > -1) {
                throw new Error(`Node ID ${call.nodeId} already exists, please use a different one`);
            }
        }
        // Options validator
        if (call.options) {
            const { gasLimit, callType } = call.options;
            if (gasLimit && typeof gasLimit === "string") {
                helpers.isInteger(gasLimit, "Gas limit");
            }
            if (callType) {
                const keysOfCALLTYPE = Object.keys(constants_2.CALL_TYPE);
                if (!keysOfCALLTYPE.includes(callType)) {
                    throw new Error(`Call type ${callType} is not valid`);
                }
            }
        }
        if (call.params && call.params.length) {
            if (!call.method) {
                throw new Error("Method is required when params are present");
            }
            call.params.map(helpers.verifyParam);
        }
    }
}
exports.FCTCalls = FCTCalls;
FCTCalls.helpers = helpers;
