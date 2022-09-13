export declare enum Flow {
    OK_CONT_FAIL_REVERT = "OK_CONT_FAIL_REVERT",
    OK_CONT_FAIL_STOP = "OK_CONT_FAIL_STOP",
    OK_CONT_FAIL_CONT = "OK_CONT_FAIL_CONT",
    OK_REVERT_FAIL_CONT = "OK_REVERT_FAIL_CONT",
    OK_REVERT_FAIL_STOP = "OK_REVERT_FAIL_STOP",
    OK_STOP_FAIL_CONT = "OK_STOP_FAIL_CONT",
    OK_STOP_FAIL_REVERT = "OK_STOP_FAIL_REVERT"
}
declare const _default: {
    Flow: typeof Flow;
    BLOCK_NUMBER: string;
    BLOCK_TIMESTAMP: string;
    GAS_PRICE: string;
    MINER_ADDRESS: string;
    ACTIVATOR_ADDRESS: string;
    getBlockHash: (indexOfPreviousBlock?: number) => string;
};
export default _default;
