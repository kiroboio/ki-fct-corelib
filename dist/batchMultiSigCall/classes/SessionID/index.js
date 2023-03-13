"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionID = void 0;
const FCTBase_1 = require("../FCTBase");
const sessionIdFlag = {
    accumetable: 0x1,
    purgeable: 0x2,
    blockable: 0x4,
    eip712: 0x8,
    authEnabled: 0x10,
};
const valueWithPadStart = (value, padStart) => {
    return Number(value).toString(16).padStart(padStart, "0");
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
class SessionID extends FCTBase_1.FCTBase {
    constructor(FCT) {
        super(FCT);
    }
    asString() {
        return SessionID.asString({
            salt: this.FCT.randomId,
            version: this.FCT.version,
            options: this.FCT.options,
        });
    }
    static asString({ salt, version, options }) {
        const currentDate = new Date();
        const { recurrency, multisig } = options;
        if (options.expiresAt && Number(options.expiresAt) < currentDate.getTime() / 1000) {
            throw new Error("Expires at date cannot be in the past");
        }
        const minimumApprovals = valueWithPadStart(multisig.minimumApprovals, 2);
        const v = version.slice(2);
        const maxRepeats = valueWithPadStart(recurrency.maxRepeats, 4);
        const chillTime = Number(Number(recurrency.maxRepeats) > 1 ? options.recurrency.chillTime : 0)
            .toString(16)
            .padStart(8, "0");
        const beforeTimestamp = valueWithPadStart(options.expiresAt || 0, 10);
        const afterTimestamp = valueWithPadStart(options.validFrom || 0, 10);
        const maxGasPrice = valueWithPadStart(options.maxGasPrice || 0, 16);
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
        const minimumApprovals = parseInt(sessionId.slice(8, 10), 16).toString();
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
}
exports.SessionID = SessionID;