"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallBase = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("../../../constants");
const deepMerge_1 = require("../../../helpers/deepMerge");
const helpers_1 = require("./helpers");
const callParams_1 = require("./helpers/callParams");
class CallBase {
    _call;
    constructor(input) {
        let fullInput;
        if (!input.nodeId) {
            fullInput = { ...input, nodeId: (0, helpers_1.generateNodeId)() };
        }
        else {
            fullInput = input;
        }
        this._call = fullInput;
    }
    get call() {
        return this._call;
    }
    get nodeId() {
        return this._call.nodeId;
    }
    getOutputVariable(innerIndex = 0) {
        return {
            type: "output",
            id: {
                nodeId: this._call.nodeId,
                innerIndex,
            },
        };
    }
    getTypesArray() {
        const call = this._call;
        if (!call.params) {
            return [];
        }
        return (0, helpers_1.getTypesArray)(call.params);
    }
    /**
     * Returns the function signature of the call.
     * If the call has a method, it returns the function signature using the `utils.id` function.
     * Otherwise, it returns hashed empty string. (ethers.utils.id(''))
     *
     * @returns The function signature of the call or hashed empty string.
     */
    getFunctionSignature() {
        return this._call.method ? ethers_1.utils.id(this.getFunction()) : constants_1.EMPTY_HASH;
    }
    getFunction() {
        return this._call.options?.usePureMethod
            ? this._call.method || ""
            : (0, callParams_1.getMethodInterface)({
                method: this._call.method,
                params: this._call.params,
            });
    }
    setOptions(options) {
        this._call.options = (0, deepMerge_1.deepMerge)(this._call.options, options);
    }
    update(call) {
        this._call = (0, deepMerge_1.deepMerge)(this._call, call);
    }
}
exports.CallBase = CallBase;
//# sourceMappingURL=CallBase.js.map