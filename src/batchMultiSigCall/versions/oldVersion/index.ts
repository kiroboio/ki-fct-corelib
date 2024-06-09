import { BatchMultiSigCall } from "../../../batchMultiSigCall";
import { CallIdBase } from "../CallIdBase";
import { SessionIdBase } from "../SessionIdBase";
import { VersionBase } from "../VersionBase";
import { CallId_oldVersion } from "./CallId";
import { SessionId_oldVersion } from "./SessionId";

export class Version_old extends VersionBase {
  public SessionId: SessionIdBase;
  public CallId: CallIdBase;
  public batchMultiSigSelector = "0x7d971612";
  constructor(FCT?: BatchMultiSigCall) {
    super(FCT);
    this.SessionId = new SessionId_oldVersion(FCT);
    this.CallId = new CallId_oldVersion(FCT);
  }
}
