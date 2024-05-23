import { BatchMultiSigCall } from "../../../batchMultiSigCall";
import { VersionBase } from "../VersionBase";
import { SessionId_oldVersion } from "./SessionId";

export class Version_old extends VersionBase {
  public SessionId: SessionId_oldVersion;

  constructor(FCT?: BatchMultiSigCall) {
    super(FCT);
    this.SessionId = new SessionId_oldVersion(FCT);
  }
}
