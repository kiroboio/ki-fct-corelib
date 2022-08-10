"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiSigCall = void 0;
class MultiSigCall {
    constructor(object, getBatchMultiSigCall) {
        this.typeHash = object.typeHash;
        this.sessionId = object.sessionId;
        this.typedData = object.typedData;
        this.encodedMessage = object.encodedMessage;
        this.encodedLimits = object.encodedLimits;
        this.inputData = object.inputData;
        this.mcall = object.mcall;
        this.getBatchMultiSigCall = getBatchMultiSigCall;
    }
    addCall(call) {
        return __awaiter(this, void 0, void 0, function* () {
            this.inputData.calls.push(call);
            console.log("Adding");
            const data = yield this.getBatchMultiSigCall(this.inputData);
            this.typeHash = data.typeHash;
            this.sessionId = data.sessionId;
            this.typedData = data.typedData;
            this.encodedMessage = data.encodedMessage;
            this.encodedLimits = data.encodedLimits;
            this.inputData = data.inputData;
            this.mcall = data.mcall;
        });
    }
}
exports.MultiSigCall = MultiSigCall;
