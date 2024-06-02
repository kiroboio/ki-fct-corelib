import { utils } from "ethers";
import { EMPTY_HASH } from "../../../constants";
import { deepMerge } from "../../../helpers/deepMerge";
import { generateNodeId, getTypesArray } from "./helpers";
import { getMethodInterface } from "./helpers/callParams";
export class CallBase {
    _call;
    constructor(input) {
        let fullInput;
        if (!input.nodeId) {
            fullInput = { ...input, nodeId: generateNodeId() };
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
        return getTypesArray(call.params);
    }
    /**
     * Returns the function signature of the call.
     * If the call has a method, it returns the function signature using the `utils.id` function.
     * Otherwise, it returns hashed empty string. (ethers.utils.id(''))
     *
     * @returns The function signature of the call or hashed empty string.
     */
    getFunctionSignature() {
        return this._call.method ? utils.id(this.getFunction()) : EMPTY_HASH;
    }
    getFunction() {
        return this._call.options?.usePureMethod
            ? this._call.method || ""
            : getMethodInterface({
                method: this._call.method,
                params: this._call.params,
            });
    }
    setOptions(options) {
        this._call.options = deepMerge(this._call.options, options);
    }
    update(call) {
        this._call = deepMerge(this._call, call);
    }
}
//# sourceMappingURL=CallBase.js.map