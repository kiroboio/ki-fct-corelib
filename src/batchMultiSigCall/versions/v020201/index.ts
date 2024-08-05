import { MessageTypeProperty, TypedDataUtils } from "@metamask/eth-sig-util";
import { hexlify, id } from "ethers/lib/utils";

import { CALL_TYPE_MSG } from "../../../constants";
import { flows } from "../../../constants/flows";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { Call as CallClass, EIP712 } from "../../classes";
import { Version_old } from "../oldVersion";
import { CallId_020201 } from "./CallId";
import { EIP712_020201 } from "./EIP712";
import { getVariableArgsForEIP712 } from "./helpers/variableArgs";
import { SessionId_020201 } from "./SessionId";
import { Utils_020201 } from "./Utils";
// NEW VERSION - 0x020201

export interface V020201_ExportOptions {
  strictGasLimits: boolean;
  forceDryRun: boolean;
}

const Limits: MessageTypeProperty[] = [
  { name: "valid_from", type: "uint40" },
  { name: "expires_at", type: "uint40" },
  { name: "tx_data_limit", type: "uint32" },
  { name: "payable_gas_limit", type: "uint32" },
  { name: "max_payable_gas_price", type: "uint40" },
  { name: "purgeable", type: "bool" },
  { name: "blockable", type: "bool" },
];

export const Call: MessageTypeProperty[] = [
  { name: "call_index", type: "uint16" },
  { name: "payer_index", type: "uint16" },
  { name: "call_type", type: "string" },
  { name: "from", type: "address" },
  { name: "to", type: "address" },
  { name: "to_ens", type: "string" },
  { name: "value", type: "uint256" },
  { name: "gas_limit", type: "uint32" },
  { name: "permissions", type: "uint16" },
  { name: "validation", type: "uint16" },
  { name: "flow_control", type: "string" },
  { name: "returned_false_means_fail", type: "bool" },
  { name: "jump_on_success", type: "uint16" },
  { name: "jump_on_fail", type: "uint16" },
  { name: "variable_arguments_start", type: "uint32" },
  { name: "variable_arguments_end", type: "uint32" },
  { name: "method_interface", type: "string" },
];

// This version introduced payable_gas_limit, max_payable_gas_price, tx_data_limit.
// Removed gas_price_limit

export class Version_020201 extends Version_old {
  // public SessionId: SessionId_020201;
  // public CallId: CallId_020201;

  public Limits: MessageTypeProperty[] = Limits;
  public Call: MessageTypeProperty[] = Call;
  public batchMultiSigSelector = "0xead413ea";

  constructor(FCT?: BatchMultiSigCall) {
    super(FCT);
    this.SessionId = new SessionId_020201(FCT);
    this.CallId = new CallId_020201(FCT);
    this.EIP712 = new EIP712_020201();
    this.Utils = new Utils_020201(FCT);
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

  exportFCT(exportOptions?: Partial<V020201_ExportOptions>) {
    const FCT = this.FCT;
    const strictGasLimits = Boolean(exportOptions?.strictGasLimits);
    const forceDryRun = Boolean(exportOptions?.forceDryRun);

    if (!FCT) {
      throw new Error("FCT is not defined, this should not happen");
    }
    if (FCT.calls.length === 0) {
      throw new Error("No calls added to FCT");
    }
    const options = FCT.options;
    const initialGasLimits: Record<number, string> = {};

    if (!strictGasLimits) {
      FCT.calls.forEach((call, i) => {
        initialGasLimits[i] = call.options.gasLimit;
        call.setOptions({ gasLimit: "0" });
      });
    }

    if (forceDryRun) {
      FCT.setOptions({ forceDryRun: true });
    }

    const typedData = new EIP712(FCT).getTypedData();
    const FCTData = {
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
    if (!strictGasLimits) {
      FCT.calls.forEach((call, i) => {
        call.setOptions({ gasLimit: initialGasLimits[i] });
      });
    }

    if (forceDryRun) {
      FCT.setOptions({ forceDryRun: false });
    }

    return FCTData;
  }

  generateCallForEIP712Message(call: CallClass, index: number) {
    const FCT = this.FCT;
    if (!FCT) {
      throw new Error("FCT is not defined, this should not happen");
    }
    const callData = call.get();
    const options = call.options;
    const flow = flows[options.flow].text;

    const { jumpOnSuccess, jumpOnFail } = call.getJumps(index);

    const variableArgs = getVariableArgsForEIP712(call);

    return {
      call_index: index + 1,
      payer_index: typeof call.options.payerIndex === "number" ? call.options.payerIndex : index + 1,
      call_type: CALL_TYPE_MSG[call.options.callType],
      from: FCT.variables.getValue(callData.from, "address"),
      to: FCT.variables.getValue(callData.to, "address"),
      to_ens: callData.toENS || "",
      value: FCT.variables.getValue(callData.value, "uint256", "0"),
      gas_limit: callData.options.gasLimit,
      permissions: 0,
      validation: call.options.validation ? FCT.validation.getIndex(call.options.validation) : 0,
      flow_control: flow,
      returned_false_means_fail: options.falseMeansFail,
      jump_on_success: jumpOnSuccess,
      jump_on_fail: jumpOnFail,
      variable_arguments_start: variableArgs.variable_arguments_start,
      variable_arguments_end: variableArgs.variable_arguments_end,
      method_interface: call.getFunction(),
    };
  }
}
