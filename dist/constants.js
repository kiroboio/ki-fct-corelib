"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Flow = void 0;
var Flow;
(function (Flow) {
    Flow[Flow["OK_CONT_FAIL_REVERT"] = 0] = "OK_CONT_FAIL_REVERT";
    Flow[Flow["OK_CONT_FAIL_STOP"] = 1] = "OK_CONT_FAIL_STOP";
    Flow[Flow["OK_CONT_FAIL_JUMP"] = 2] = "OK_CONT_FAIL_JUMP";
    Flow[Flow["OK_REVERT_FAIL_CONT"] = 3] = "OK_REVERT_FAIL_CONT";
    Flow[Flow["OK_STOP_FAIL_CONT"] = 4] = "OK_STOP_FAIL_CONT";
    Flow[Flow["OK_JUMP_FAIL_CONT"] = 5] = "OK_JUMP_FAIL_CONT";
})(Flow = exports.Flow || (exports.Flow = {}));
exports.default = { Flow };
