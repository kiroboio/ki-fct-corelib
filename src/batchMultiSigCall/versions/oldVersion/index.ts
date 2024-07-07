import { BatchMultiSigCall } from "../../../batchMultiSigCall";
import { CallIdBase } from "../bases/CallIdBase";
import { EIP712Base } from "../bases/EIP712Base";
import { SessionIdBase } from "../bases/SessionIdBase";
import { UtilsBase } from "../bases/UtilsBase";
import { VersionBase } from "../bases/VersionBase";
import { CallId_oldVersion } from "./CallId";
import { SessionId_oldVersion } from "./SessionId";
import { Utils_oldVersion } from "./Utils";

export class Version_old extends VersionBase {
  public SessionId: SessionIdBase;
  public CallId: CallIdBase;
  public EIP712: EIP712Base;
  public Utils: UtilsBase;

  public batchMultiSigSelector = "0x7d971612";
  constructor(FCT?: BatchMultiSigCall) {
    super(FCT);
    this.SessionId = new SessionId_oldVersion(FCT);
    this.CallId = new CallId_oldVersion(FCT);
    this.EIP712 = new EIP712Base();
    this.Utils = new Utils_oldVersion(FCT);
  }
}
