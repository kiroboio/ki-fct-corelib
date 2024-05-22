import { BatchMultiSigCall } from "../../../batchMultiSigCall";
// import { Engine, Meta } from "../../classes/EIP712/constants";
import { VersionBase } from "../VersionBase";
// import { Engine, Meta } from "../constants";
// import { EIP712Base } from "../version";

export class Version_old extends VersionBase {
  getMetaMessage(FCT: BatchMultiSigCall): Record<string, any> {
    const FCTOptions = FCT.options;
    return {
      name: FCTOptions.name || "",
      app: FCTOptions.app.name || "",
      app_version: FCTOptions.app.version || "",
      builder: FCTOptions.builder.name || "",
      builder_address: FCTOptions.builder.address || "",
      domain: FCTOptions.domain || "",
    };
  }

  getEngineMessage(FCT: BatchMultiSigCall): Record<string, any> {
    const FCTOptions = FCT.options;
    return {
      selector: FCT.batchMultiSigSelector,
      version: FCT.version,
      random_id: `0x${FCT.randomId}`,
      eip712: true,
      verifier: FCTOptions.verifier,
      auth_enabled: FCTOptions.authEnabled,
      dry_run: FCTOptions.dryRun,
    };
  }

  getLimitsMessage(FCT: BatchMultiSigCall): Record<string, any> {
    const FCTOptions = FCT.options;
    return {
      valid_from: FCTOptions.validFrom,
      expires_at: FCTOptions.expiresAt,
      gas_price_limit: FCTOptions.maxGasPrice,
      purgeable: FCTOptions.purgeable,
      blockable: FCTOptions.blockable,
    };
  }
}
