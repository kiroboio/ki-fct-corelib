"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getCalls = exports._getDecodedCalls = void 0;
const lodash_1 = __importDefault(require("lodash"));
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
