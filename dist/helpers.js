"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manageCallFlags = exports.getFlags = exports.getMaxGasPrice = exports.getMaxGas = exports.getBeforeTimestamp = exports.getAfterTimestamp = exports.getNonce = exports.getGroupId = void 0;
const getGroupId = (group) => group.toString(16).padStart(6, "0");
exports.getGroupId = getGroupId;
const getNonce = (nonce) => nonce.toString(16).padStart(10, "0");
exports.getNonce = getNonce;
const getAfterTimestamp = (epochDate) => epochDate.toString(16).padStart(10, "0");
exports.getAfterTimestamp = getAfterTimestamp;
const getBeforeTimestamp = (infinity, epochDate) => infinity ? "ffffffffff" : epochDate.toString(16).padStart(10, "0");
exports.getBeforeTimestamp = getBeforeTimestamp;
const getMaxGas = (maxGas) => maxGas.toString(16).padStart(8, "0");
exports.getMaxGas = getMaxGas;
const getMaxGasPrice = (gasPrice) => gasPrice.toString(16).padStart(16, "0");
exports.getMaxGasPrice = getMaxGasPrice;
const getFlags = (flags, small) => {
    const array = ["0", "0", "0", "0"];
    if (flags.eip712 || flags.staticCall || flags.cancelable) {
        array[1] = flags.cancelable ? "8" : flags.staticCall ? "4" : "1";
    }
    array[0] = flags.payment ? "f" : "0";
    if (flags.flow) {
        array[2] = "f";
        array[3] = "f";
    }
    return small ? array.slice(0, 2).join("") : array.join("");
};
exports.getFlags = getFlags;
const manageCallFlags = (flags) => {
    const array = ["0", "x", "0", "0"];
    if (flags.onFailContinue && flags.onFailStop) {
        throw new Error("Both flags onFailContinue and onFailStop can't be enabled at once");
    }
    if (flags.onSuccessRevert && flags.onSuccessStop) {
        throw new Error("Both flags onSuccessRevert and onSuccessStop can't be enabled at once");
    }
    array[2] = flags.onSuccessRevert ? "2" : flags.onSuccessRevert ? "1" : "0";
    array[3] = flags.onFailContinue ? "2" : flags.onFailStop ? "1" : "0";
    return array.join("");
};
exports.manageCallFlags = manageCallFlags;
