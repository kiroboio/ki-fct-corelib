"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionID = void 0;
const sessionIdFlag = {
    accumetable: 0x1,
    purgeable: 0x2,
    blockable: 0x4,
    eip712: 0x8,
    authEnabled: 0x10,
};
// Deconstructed sessionID
// 6 - Salt
// 2 - External signers
// 6 - Version
// 4 - Max Repeats
// 8 - Chill time
// 10 - After timestamp
// 10 - Before timestamp
// 16 - Gas price limit
// 2 - Flags
class SessionID {
    static asString({ salt, version, options }) {
        const currentDate = new Date();
        const { recurrency, multisig } = options;
        if (options.expiresAt && Number(options.expiresAt) < currentDate.getTime() / 1000) {
            throw new Error("Expires at date cannot be in the past");
        }
        const minimumApprovals = multisig.externalSigners.length > 0
            ? Number(options.multisig.minimumApprovals).toString(16).padStart(2, "0")
            : "00";
        const v = version.slice(2);
        const maxRepeats = Number(recurrency.maxRepeats) > 1 ? Number(options.recurrency.maxRepeats).toString(16).padStart(4, "0") : "0000";
        const chillTime = Number(recurrency.maxRepeats) > 1
            ? Number(options.recurrency.chillTime).toString(16).padStart(8, "0")
            : "00000000";
        const beforeTimestamp = Number(options.expiresAt).toString(16).padStart(10, "0");
        const afterTimestamp = Number(options.validFrom).toString(16).padStart(10, "0");
        const maxGasPrice = Number(options.maxGasPrice).toString(16).padStart(16, "0");
        let flagValue = 0;
        flagValue += sessionIdFlag.eip712; // EIP712 true by default
        if (options.recurrency?.accumetable)
            flagValue += sessionIdFlag.accumetable;
        if (options.purgeable)
            flagValue += sessionIdFlag.purgeable;
        if (options.blockable)
            flagValue += sessionIdFlag.blockable;
        if (options.authEnabled)
            flagValue += sessionIdFlag.authEnabled;
        const flags = flagValue.toString(16).padStart(2, "0");
        return `0x${salt}${minimumApprovals}${v}${maxRepeats}${chillTime}${beforeTimestamp}${afterTimestamp}${maxGasPrice}${flags}`;
    }
    static asOptions({ sessionId, builder, name, externalSigners = [], }) {
        // const salt = sessionId.slice(2, 8);
        const minimumApprovals = parseInt(sessionId.slice(8, 10), 16).toString();
        // const version = sessionId.slice(10, 16);
        const maxRepeats = parseInt(sessionId.slice(16, 20), 16).toString();
        const chillTime = parseInt(sessionId.slice(20, 28), 16).toString();
        const expiresAt = parseInt(sessionId.slice(28, 38), 16).toString();
        const validFrom = parseInt(sessionId.slice(38, 48), 16).toString();
        const maxGasPrice = parseInt(sessionId.slice(48, 64), 16).toString();
        const flagsNumber = parseInt(sessionId.slice(64, 66), 16);
        const flags = {
            eip712: (flagsNumber & sessionIdFlag.eip712) !== 0,
            accumetable: (flagsNumber & sessionIdFlag.accumetable) !== 0,
            purgeable: (flagsNumber & sessionIdFlag.purgeable) !== 0,
            blockable: (flagsNumber & sessionIdFlag.blockable) !== 0,
            authEnabled: (flagsNumber & sessionIdFlag.authEnabled) !== 0,
        };
        return {
            name,
            validFrom,
            expiresAt,
            maxGasPrice,
            blockable: flags.blockable,
            purgeable: flags.purgeable,
            authEnabled: flags.authEnabled,
            builder,
            recurrency: {
                accumetable: flags.accumetable,
                chillTime,
                maxRepeats,
            },
            multisig: {
                minimumApprovals,
                externalSigners,
            },
        };
    }
    static asStringFromExportFCT(exportFCT) {
        return this.asString({
            salt: exportFCT.salt,
            version: exportFCT.version,
            options: exportFCT.FCT.options,
        });
    }
}
exports.SessionID = SessionID;
