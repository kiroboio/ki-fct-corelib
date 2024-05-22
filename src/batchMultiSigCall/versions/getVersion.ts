import { Version_old } from "./oldVersion";
import { Version_020201 } from "./v020201";
import { VersionBase } from "./VersionBase";

// Create a function that takes the version of BatchMultiSigCall in format 0xXXYYZZ.
// XX - major version
// YY - minor version
// ZZ - patch version
// The function should return the correct Version class.

// In this instance if the version is less than 0x020201, we should return the old version. Else the new version.

export function getVersionClass(version: string): VersionBase {
  const value = parseInt(version, 16);
  if (value >= 0x020201) {
    return new Version_020201();
  }
  return new Version_old();
}
