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
    dryRun: 0x20,
};
const valueWithPadStart = (value, padStart) => {
    return Number(value).toString(16).padStart(padStart, "0");
};
// /** @dev we used a parameter called sessionId to hold the following info: */
// // 1-7      8bit flags
// uint256 constant MAX_GAS_PRICE_BIT = 8; // 8-48     40bit gas price limit
// uint256 constant K_GAS_LIMIT_BIT = 48; // 48-72     24bit gas price limit
// uint256 constant AFTER_TS_BIT = 72; // 72-112   40bit after timestamp
// uint256 constant BEFORE_TS_BIT = 112; // 112-152  40bit before timestamp
// uint256 constant CHILL_TIME_BIT = 152; // 152-184  32bit chill time
// uint256 constant RECURRENT_BIT = 184; // 184-200  16bit nonce
// uint256 constant VERSION_BIT = 200; // 200-224  24bit nonce
// uint256 constant EXT_SIGNERS_BIT = 224; // 224-232  8bit nonce
// uint256 constant SALT_BIT = 232; // 232-256  24bit nonce
// Deconstructed sessionID:
//   - 6  : Salt
//   - 2  : External signers
//   - 6  : Version
//   - 4  : Max Repeats
//   - 8  : Chill time
//   - 10 : After timestamp
//   - 10 : Before timestamp
//   - 6  : Payable gas limit in kilo
//   - 10 : Gas price limit
//   - 2  : Flags
// 0xcb57b9 / 00 / 020201 / 0000 / 00000000 / 0066573973 / 00664dfef3 / 000000 / 06fc23ac00 / 1c
class SessionID extends FCTBase_1.FCTBase {
    asString() {
        return SessionID.asString({
            salt: this.FCT.randomId,
            version: this.FCT.version,
            options: this.FCT.options,
        });
    }
    static asString({ salt, version, options }) {
        const { recurrency, multisig } = options;
        const minimumApprovals = valueWithPadStart(multisig.minimumApprovals, 2);
        const v = version.slice(2);
        const maxRepeats = valueWithPadStart(recurrency.maxRepeats, 4);
        const chillTime = Number(+recurrency.maxRepeats > 1 ? +options.recurrency.chillTime : 0)
            .toString(16)
            .padStart(8, "0");
        const beforeTimestamp = valueWithPadStart(options.expiresAt || 0, 10);
        const afterTimestamp = valueWithPadStart(options.validFrom || 0, 10);
        const maxGasPrice = valueWithPadStart(options.maxGasPrice || 0, 10);
        const payableGasLimitInKilo = valueWithPadStart(options.payableGasLimitInKilo || 0, 6);
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
        if (options.dryRun)
            flagValue += sessionIdFlag.dryRun;
        const flags = flagValue.toString(16).padStart(2, "0");
        return [
            "0x",
            salt,
            minimumApprovals,
            v,
            maxRepeats,
            chillTime,
            beforeTimestamp,
            afterTimestamp,
            payableGasLimitInKilo,
            maxGasPrice,
            flags,
        ].join("");
    }
    static asOptions(sessionId) {
        return SessionID.parse(sessionId);
    }
    static parse(sessionId) {
        const minimumApprovals = parseInt(sessionId.slice(8, 10), 16).toString();
        const maxRepeats = parseInt(sessionId.slice(16, 20), 16).toString();
        const chillTime = parseInt(sessionId.slice(20, 28), 16).toString();
        const expiresAt = parseInt(sessionId.slice(28, 38), 16).toString();
        const validFrom = parseInt(sessionId.slice(38, 48), 16).toString();
        const maxGasPrice = parseInt(sessionId.slice(48, 58), 16).toString();
        const payableGasLimitInKilo = parseInt(sessionId.slice(58, 64), 16).toString();
        const flagsNumber = parseInt(sessionId.slice(64, 66), 16);
        const flags = {
            eip712: (flagsNumber & sessionIdFlag.eip712) !== 0,
            accumetable: (flagsNumber & sessionIdFlag.accumetable) !== 0,
            purgeable: (flagsNumber & sessionIdFlag.purgeable) !== 0,
            blockable: (flagsNumber & sessionIdFlag.blockable) !== 0,
            authEnabled: (flagsNumber & sessionIdFlag.authEnabled) !== 0,
            dryRun: (flagsNumber & sessionIdFlag.dryRun) !== 0,
        };
        return {
            validFrom,
            expiresAt,
            maxGasPrice,
            payableGasLimitInKilo,
            dryRun: flags.dryRun,
            blockable: flags.blockable,
            purgeable: flags.purgeable,
            authEnabled: flags.authEnabled,
            recurrency: {
                accumetable: flags.accumetable,
                chillTime,
                maxRepeats,
            },
            multisig: {
                minimumApprovals,
            },
        };
    }
}
exports.SessionID = SessionID;
//# sourceMappingURL=index.js.map