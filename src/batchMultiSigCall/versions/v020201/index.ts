import { MessageTypeProperty, TypedDataUtils } from "@metamask/eth-sig-util";
import { hexlify, id } from "ethers/lib/utils";

import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { EIP712 } from "../../classes";
import { Version_old } from "../oldVersion";
import { SessionId_020201 } from "./SessionId";
// NEW VERSION - 0x020201

const Limits: MessageTypeProperty[] = [
  { name: "valid_from", type: "uint40" },
  { name: "expires_at", type: "uint40" },
  { name: "tx_data_limit", type: "uint32" },
  { name: "payable_gas_limit", type: "uint32" },
  { name: "max_payable_gas_price", type: "uint40" },
  { name: "purgeable", type: "bool" },
  { name: "blockable", type: "bool" },
];

// This version introduced payable_gas_limit, max_payable_gas_price, tx_data_limit.
// Removed gas_price_limit

export class Version_020201 extends Version_old {
  public SessionId: SessionId_020201;
  public Limits: MessageTypeProperty[] = Limits;
  public batchMultiSigSelector = "0xead413ea";

  constructor(FCT?: BatchMultiSigCall) {
    super(FCT);
    this.SessionId = new SessionId_020201(FCT);
  }

  getLimitsMessage(FCT: BatchMultiSigCall): Record<string, any> {
    const FCTOptions = FCT.options;
    return {
      valid_from: FCTOptions.validFrom,
      expires_at: FCTOptions.expiresAt,
      tx_data_limit: "0",
      payable_gas_limit: FCTOptions.payableGasLimit,
      max_payable_gas_price: FCTOptions.maxGasPrice,
      purgeable: FCTOptions.purgeable,
      blockable: FCTOptions.blockable,
    };
  }

  exportFCT() {
    const FCT = this.FCT;
    if (!FCT) {
      throw new Error("FCT is not defined, this should not happen");
    }
    if (FCT.calls.length === 0) {
      throw new Error("No calls added to FCT");
    }
    const options = FCT.options;

    const typedData = new EIP712(FCT).getTypedData();
    return {
      typedData,
      typeHash: hexlify(TypedDataUtils.hashType(typedData.primaryType as string, typedData.types)),
      sessionId: this.SessionId.asString(),
      nameHash: id(options.name),
      appHash: id(options.app.name),
      appVersionHash: id(options.app.version),
      builderHash: id(options.builder.name),
      builderAddress: options.builder.address,
      domainHash: id(options.domain),
      verifierHash: id(options.verifier),
      mcall: FCT.calls.map((call, index) => call.getAsMCall(typedData, index)),
      externalSigners: options.multisig.externalSigners,
      signatures: [FCT.utils.getAuthenticatorSignature()],
      computed: FCT.computedAsData,
      validations: FCT.validation.getForData(),
      variables: [],
      txDataLimit: "0",
      payableGasLimit: options.payableGasLimit,
    };
  }
}
