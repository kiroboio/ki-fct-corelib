import { Flow } from "../constants";
export const NO_JUMP = "NO_JUMP";
export const DEFAULT_CALL_OPTIONS = {
    permissions: "0000",
    gasLimit: "0",
    flow: Flow.OK_CONT_FAIL_REVERT,
    jumpOnSuccess: NO_JUMP,
    jumpOnFail: NO_JUMP,
    falseMeansFail: false,
    callType: "ACTION",
    validation: "",
    usePureMethod: false,
};
//# sourceMappingURL=constants.js.map