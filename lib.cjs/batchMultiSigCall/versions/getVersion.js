"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSessionId = exports.getVersionFromVersion = exports.getVersionClass = void 0;
const v020201_1 = require("./v020201");
// Session ID example - 0x44578300020101000000000000009fc545c0000000000000000006fc23ac001cn
// This mask helps to extract the version from the session id, in the example it is 020101
const VERSION_MASK = 0x00000000ffffff00000000000000000000000000000000000000000000000000n;
// Create a function that takes the version of BatchMultiSigCall in format 0xXXYYZZ.
// XX - major version
// YY - minor version
// ZZ - patch version
// The function should return the correct Version class.
function getVersionClass(FCT) {
    return getVersionFromVersion(FCT.version, FCT);
}
exports.getVersionClass = getVersionClass;
function getVersionFromVersion(version, FCT) {
    const value = typeof version === "string" ? parseInt(version, 16) : version;
    // Only for testing we always return the newest version
    return new v020201_1.Version_020201(FCT);
    // if (value >= 0x020201) {
    // return new Version_020201(FCT);
    // }
    // return new Version_old(FCT);
}
exports.getVersionFromVersion = getVersionFromVersion;
function parseSessionId(sessionId) {
    const version = Number((BigInt(sessionId) & VERSION_MASK) >> 200n);
    const VersionClass = getVersionFromVersion(version);
    return VersionClass.SessionId.parse(sessionId);
}
exports.parseSessionId = parseSessionId;
//# sourceMappingURL=getVersion.js.map