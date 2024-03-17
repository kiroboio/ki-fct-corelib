"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CALL_OPTIONS = exports.NO_JUMP = void 0;
const constants_1 = require("../constants");
exports.NO_JUMP = "NO_JUMP";
exports.DEFAULT_CALL_OPTIONS = {
    permissions: "0000",
    gasLimit: "0",
    flow: constants_1.Flow.OK_CONT_FAIL_REVERT,
    jumpOnSuccess: exports.NO_JUMP,
    jumpOnFail: exports.NO_JUMP,
    falseMeansFail: false,
    callType: "ACTION",
    validation: "",
    usePureMethod: false,
};
//# sourceMappingURL=constants.js.map