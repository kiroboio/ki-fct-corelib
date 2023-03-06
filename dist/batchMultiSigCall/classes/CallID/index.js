"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallID = void 0;
const constants_1 = require("../../../constants");
const constants_2 = require("../../constants");
const valueWithPadStart = (value, padStart) => {
    return Number(value).toString(16).padStart(padStart, "0");
};
// This is the structure of callId string
// 4 - Permissions
// 2 - Flow
// 4 - Fail Jump
// 4 - Ok Jump
// 4 - Payer index
// 4 - Call index
// 8 - Gas limit
// 2 - Flags
// 0x00000000000000000000000000000000 / 0000 / 05 / 0000 / 0001 / 0001 / 0001 / 00000000 / 00;
class CallID {
    static asString({ calls, call, index }) {
        const permissions = "0000";
        const flow = valueWithPadStart(constants_1.flows[call.options.flow].value, 2);
        const payerIndex = valueWithPadStart(index + 1, 4);
        const callIndex = valueWithPadStart(index + 1, 4);
        const gasLimit = valueWithPadStart(call.options.gasLimit, 8);
        const flags = () => {
            const callType = constants_1.CALL_TYPE[call.options.callType];
            const falseMeansFail = call.options.falseMeansFail ? 4 : 0;
            return callType + (parseInt(callType, 16) + falseMeansFail).toString(16);
        };
        let successJump = "0000";
        let failJump = "0000";
        if (call.options) {
            const { jumpOnFail, jumpOnSuccess } = call.options;
            if (jumpOnFail && jumpOnFail !== constants_2.NO_JUMP) {
                const nodeIndex = calls.findIndex((c) => c.nodeId === call?.options?.jumpOnFail);
                failJump = Number(nodeIndex - index - 1)
                    .toString(16)
                    .padStart(4, "0");
            }
            if (jumpOnSuccess && jumpOnSuccess !== constants_2.NO_JUMP) {
                const nodeIndex = calls.findIndex((c) => c.nodeId === call?.options?.jumpOnSuccess);
                successJump = Number(nodeIndex - index - 1)
                    .toString(16)
                    .padStart(4, "0");
            }
        }
        return ("0x" +
            `${permissions}${flow}${failJump}${successJump}${payerIndex}${callIndex}${gasLimit}${flags()}`.padStart(64, "0"));
    }
    static parse(callId) {
        const permissions = callId.slice(36, 38);
        const flowNumber = parseInt(callId.slice(38, 40), 16);
        const jumpOnFail = parseInt(callId.slice(40, 44), 16);
        const jumpOnSuccess = parseInt(callId.slice(44, 48), 16);
        const payerIndex = parseInt(callId.slice(48, 52), 16);
        const callIndex = parseInt(callId.slice(52, 56), 16);
        const gasLimit = parseInt(callId.slice(56, 64), 16).toString();
        const flags = parseInt(callId.slice(64, 66), 16);
        const getFlow = () => {
            const flow = Object.entries(constants_1.flows).find(([, value]) => {
                return value.value === flowNumber.toString();
            });
            if (!flow)
                throw new Error("Invalid flow");
            return constants_1.Flow[flow[0]];
        };
        const options = {
            gasLimit,
            flow: getFlow(),
            jumpOnFail: "",
            jumpOnSuccess: "",
        };
        if (jumpOnFail)
            options["jumpOnFail"] = `node${callIndex + jumpOnFail}`;
        if (jumpOnSuccess)
            options["jumpOnSuccess"] = `node${callIndex + jumpOnFail}`;
        return {
            options,
            viewOnly: flags === 1,
            permissions,
            payerIndex,
            callIndex,
        };
    }
    static parseWithNumbers(callId) {
        const permissions = callId.slice(36, 38);
        const flowNumber = parseInt(callId.slice(38, 40), 16);
        const jumpOnFail = parseInt(callId.slice(40, 44), 16);
        const jumpOnSuccess = parseInt(callId.slice(44, 48), 16);
        const payerIndex = parseInt(callId.slice(48, 52), 16);
        const callIndex = parseInt(callId.slice(52, 56), 16);
        const gasLimit = parseInt(callId.slice(56, 64), 16).toString();
        const flags = parseInt(callId.slice(64, 66), 16);
        const getFlow = () => {
            const flow = Object.entries(constants_1.flows).find(([, value]) => {
                return value.value === flowNumber.toString();
            });
            if (!flow)
                throw new Error("Invalid flow");
            return constants_1.Flow[flow[0]];
        };
        const options = {
            gasLimit,
            flow: getFlow(),
            jumpOnFail,
            jumpOnSuccess,
        };
        return {
            options,
            viewOnly: flags === 1,
            permissions,
            payerIndex,
            callIndex,
        };
    }
}
exports.CallID = CallID;
