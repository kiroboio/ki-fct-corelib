"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportFCT = void 0;
const helpers_1 = require("batchMultiSigCall/helpers");
const lodash_1 = __importDefault(require("lodash"));
class ImportFCT {
    constructor(FCT) {
        const { meta } = FCT.typedData.message;
        const domain = FCT.typedData.domain;
        const sessionIdOptions = (0, helpers_1.parseSessionID)(FCT.sessionId, FCT.builder, FCT.externalSigners);
        const name = meta.name;
        this.options = lodash_1.default.merge({}, sessionIdOptions, { name });
        this.randomId = meta.random_id;
        this.version = meta.version;
        this.chainId = domain.chainId.toString();
        this.domain = domain;
    }
}
exports.ImportFCT = ImportFCT;
