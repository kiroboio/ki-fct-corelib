import { MessageTypeProperty } from "@metamask/eth-sig-util";

import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { Version_old } from "../oldVersion";
import { SessionId_020201 } from "./SessionId";
// NEW VERSION - 0x020201

const Limits: MessageTypeProperty[] = [
  { name: "valid_from", type: "uint40" },
  { name: "expires_at", type: "uint40" },
  { name: "payable_gas_limit_in_kilo", type: "uint24" },
  { name: "max_payable_gas_price", type: "uint40" },
  { name: "purgeable", type: "bool" },
  { name: "blockable", type: "bool" },
];

// This version introduced payable_gas_limit_in_kilo and max_payable_gas_price, removed gas_price_limit

export class Version_020201 extends Version_old {
  public SessionId: SessionId_020201;
  constructor(FCT?: BatchMultiSigCall) {
    super(FCT);
    this.SessionId = new SessionId_020201(FCT);
  }

  public Limits: MessageTypeProperty[] = Limits;

  getLimitsMessage(FCT: BatchMultiSigCall): Record<string, any> {
    const FCTOptions = FCT.options;
    return {
      valid_from: FCTOptions.validFrom,
      expires_at: FCTOptions.expiresAt,
      payable_gas_limit_in_kilo: FCTOptions.payableGasLimitInKilo,
      max_payable_gas_price: FCTOptions.maxGasPrice,
      purgeable: FCTOptions.purgeable,
      blockable: FCTOptions.blockable,
    };
  }
}
