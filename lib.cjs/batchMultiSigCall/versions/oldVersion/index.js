"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version_old = void 0;
const VersionBase_1 = require("../VersionBase");
const SessionId_1 = require("./SessionId");
class Version_old extends VersionBase_1.VersionBase {
    SessionId;
    constructor(FCT) {
        super(FCT);
        this.SessionId = new SessionId_1.SessionId_oldVersion(FCT);
    }
}
exports.Version_old = Version_old;
//# sourceMappingURL=index.js.map