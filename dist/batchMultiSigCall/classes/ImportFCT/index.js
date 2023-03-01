"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportFCT = void 0;
const SessionID_1 = require("../SessionID");
class ImportFCT {
    constructor(FCT) {
        const { meta } = FCT.typedData.message;
        const domain = FCT.typedData.domain;
        const sessionIdOptions = SessionID_1.SessionID.fromFCT(FCT);
        this.options = sessionIdOptions;
        this.randomId = meta.random_id;
        this.version = meta.version;
        this.chainId = domain.chainId.toString();
        this.domain = domain;
    }
}
exports.ImportFCT = ImportFCT;
