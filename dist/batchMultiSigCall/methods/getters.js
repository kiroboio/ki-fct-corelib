"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getCalls = exports._getDecodedCalls = exports._getComputedVariables = void 0;
const lodash_1 = __importDefault(require("lodash"));
const helpers_1 = require("../../helpers");
function _getComputedVariables() {
    return this.calls.reduce((acc, call) => {
        if (call.params) {
            call.params.forEach((param) => {
                if ((0, helpers_1.instanceOfVariable)(param.value) && param.value.type === "computed") {
                    const variable = param.value;
                    acc.push({
                        variable: typeof variable.id.variable === "string"
                            ? variable.id.variable
                            : this.getVariable(variable.id.variable, param.type),
                        add: variable.id.add || "",
                        sub: variable.id.sub || "",
                        mul: variable.id.mul || "",
                        div: variable.id.div || "",
                    });
                }
            });
        }
        return acc;
    }, []);
}
exports._getComputedVariables = _getComputedVariables;
function _getDecodedCalls() {
    return this.calls.map((call) => {
        const params = call.params;
        if (params && params.length > 0) {
            const parameters = this.decodeParams(params);
            return { ...call, params: parameters };
        }
        return {
            ...call,
            params: [],
        };
    });
}
exports._getDecodedCalls = _getDecodedCalls;
function _getCalls() {
    return this._calls.map((call) => {
        const fullCall = lodash_1.default.merge({}, this._callDefault, call);
        if (typeof fullCall.from === "undefined") {
            throw new Error("From address is required");
        }
        const from = fullCall.from;
        return { ...fullCall, from };
    });
}
exports._getCalls = _getCalls;
