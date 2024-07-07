import { IFCT } from "../types";
import { getVersionFromVersion } from "../versions/getVersion";

export * from "./signatures";

export function getCalldataForActuator(data: {
  signedFCT: IFCT;
  purgedFCT: string;
  investor: string;
  activator: string;
  version: string;
}) {
  const Version = getVersionFromVersion(data.version);
  return Version.Utils.getCalldataForActuatorWithSignedFCT(data);
}
