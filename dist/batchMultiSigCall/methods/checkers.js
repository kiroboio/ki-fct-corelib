"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCall = void 0;
const helpers_1 = require("..//helpers");
function verifyCall(call) {
    if (!call.to) {
        throw new Error("To address is required");
    }
    if (!call.from) {
        throw new Error("From address is required");
    }
    if (call.nodeId) {
        const index = this.calls.findIndex((item) => item.nodeId === call.nodeId);
        if (index > 0) {
            throw new Error(`Node ID ${call.nodeId} already exists, please use a different one`);
        }
    }
    if (call.params) {
        call.params.map(helpers_1.verifyParam);
    }
}
exports.verifyCall = verifyCall;
