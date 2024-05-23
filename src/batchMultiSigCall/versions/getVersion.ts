import { BatchMultiSigCall } from "..";
import { Version_old } from "./oldVersion";
import { Version_020201 } from "./v020201";
import { VersionBase } from "./VersionBase";

// Create a function that takes the version of BatchMultiSigCall in format 0xXXYYZZ.
// XX - major version
// YY - minor version
// ZZ - patch version
// The function should return the correct Version class.

// In this instance if the version is less than 0x020201, we should return the old version. Else the new version.

export function getVersionClass(FCT: BatchMultiSigCall): VersionBase {
  return getVersionFromVersion(FCT.version, FCT);
}

export function getVersionFromVersion(version: string, FCT?: BatchMultiSigCall): VersionBase {
  const value = parseInt(version, 16);
  if (value >= 0x020201) {
    return new Version_020201(FCT);
  }
  return new Version_old(FCT);
}

export function parseSessionId(sessionId: string): Record<string, any> {
  //This is the session id string - 0x44578300020101000000000000009fc545c0000000000000000006fc23ac001cn
  //                              - 0x00000000ffffff00000000000000000000000000000000000000000000000000n
  // The version will always be located where 020101 is. Create mask for it
  const VERSION_MASK = 0x00000000ffffff00000000000000000000000000000000000000000000000000n;
  const version = (BigInt(sessionId) & VERSION_MASK) >> 200n;
  const VersionClass = getVersionFromVersion(version.toString());
  const parsed = VersionClass.SessionId.parse(sessionId);
  return parsed;
}
