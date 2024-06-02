import { VersionBase } from "../VersionBase";
import { SessionId_oldVersion } from "./SessionId";
export class Version_old extends VersionBase {
    SessionId;
    constructor(FCT) {
        super(FCT);
        this.SessionId = new SessionId_oldVersion(FCT);
    }
}
//# sourceMappingURL=index.js.map