import { SessionIdBase } from "../bases/SessionIdBase";

const sessionIdFlag = {
  accumetable: 0x1,
  purgeable: 0x2,
  blockable: 0x4,
  eip712: 0x8,
  authEnabled: 0x10,
  dryRun: 0x20,
} as const;

const valueWithPadStart = (value: string | number, padStart: number) => {
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

export class SessionId_oldVersion extends SessionIdBase {
  //   public asString({ salt, version, options }: { salt: string; version: string; options: RequiredFCTOptions }): string {
  public asString(): string {
    if (!this.FCT) throw new Error("FCT is not defined, this should not happen");
    const salt = this.FCT.randomId;
    const version = this.FCT.version;
    const options = this.FCT.options;
    const { recurrency, multisig } = options;

    const minimumApprovals = valueWithPadStart(multisig.minimumApprovals, 2);
    const v = version.slice(2);
    const maxRepeats = valueWithPadStart(recurrency.maxRepeats, 4);
    const chillTime = Number(+recurrency.maxRepeats > 1 ? +options.recurrency.chillTime : 0)
      .toString(16)
      .padStart(8, "0");
    const beforeTimestamp = valueWithPadStart(options.expiresAt || 0, 10);
    const afterTimestamp = valueWithPadStart(options.validFrom || 0, 10);
    const maxGasPrice = valueWithPadStart(options.maxGasPrice || 0, 16);

    let flagValue = 0;
    flagValue += sessionIdFlag.eip712; // EIP712 true by default
    if (options.recurrency?.accumetable) flagValue += sessionIdFlag.accumetable;
    if (options.purgeable) flagValue += sessionIdFlag.purgeable;
    if (options.blockable) flagValue += sessionIdFlag.blockable;
    if (options.authEnabled) flagValue += sessionIdFlag.authEnabled;
    if (options.dryRun) flagValue += sessionIdFlag.dryRun;

    const flags = flagValue.toString(16).padStart(2, "0");

    return `0x${salt}${minimumApprovals}${v}${maxRepeats}${chillTime}${beforeTimestamp}${afterTimestamp}${maxGasPrice}${flags}`;
  }

  public parse(sessionId: string) {
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
      dryRun: (flagsNumber & sessionIdFlag.dryRun) !== 0,
    };

    return {
      validFrom,
      expiresAt,
      maxGasPrice,
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
