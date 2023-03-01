import { MessageTypeProperty, TypedDataUtils } from "@metamask/eth-sig-util";
import { getAuthenticatorSignature } from "batchMultiSigCall/utils";
import { hexlify, id } from "ethers/lib/utils";
import _ from "lodash";

import { CALL_TYPE_MSG, flows } from "../../../constants";
import {
  BatchMultiSigCallTypedData,
  DecodedCalls,
  IBatchMultiSigCallFCT,
  TypedDataMessage,
  TypedDataTypes,
} from "../../../types";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { NO_JUMP } from "../../constants";
import { getComputedVariableMessage, handleMethodInterface, manageCallId } from "../../helpers";
import { handleData, handleFunctionSignature, handleTypes } from "../../helpers/handlers";
import { MSCall } from "../../types/general";
import { EIP712 } from "../EIP712";
import { EIP712StructTypes } from "../EIP712StructTypes";
import { Options } from "../Options";
import { SessionID } from "../SessionID";
import * as helpers from "./helpers";

export class ExportFCT {
  public FCT: BatchMultiSigCall;
  public salt: string;
  public calls: DecodedCalls[];
  public version: string;
  public sessionId: string;
  public typedData: BatchMultiSigCallTypedData;
  public mcall: MSCall[];

  static helpers = helpers;

  constructor(FCT: BatchMultiSigCall) {
    this.FCT = FCT;
    this.salt = FCT.randomId;
    this.calls = FCT.decodedCalls;
    this.version = FCT.version;
    this.typedData = this.getTypedData();
    this.sessionId = SessionID.asStringFromExportFCT(this);
    this.mcall = this.getCalls();

    if (this.FCT.calls.length === 0) {
      throw new Error("FCT has no calls");
    }

    Options.verify(this.FCT.options);
  }

  public get(): IBatchMultiSigCallFCT {
    return {
      typedData: this.typedData,
      builder: this.FCT.options.builder,
      typeHash: hexlify(TypedDataUtils.hashType(this.typedData.primaryType as string, this.typedData.types)),
      sessionId: this.sessionId,
      nameHash: id(this.FCT.options.name),
      mcall: this.mcall,
      variables: [],
      externalSigners: [],
      signatures: [getAuthenticatorSignature(this.typedData)],
      computed: this.FCT.convertedComputed.map((c) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { index, ...rest } = c;
        return rest;
      }),
    };
  }

  public getCalls(): MSCall[] {
    const typedData = this.typedData;
    const calls = this.calls;
    return calls.map((call, index) => {
      const usedTypeStructs = helpers.getUsedStructTypes(typedData, `transaction${index + 1}`);

      return {
        typeHash: hexlify(TypedDataUtils.hashType(`transaction${index + 1}`, typedData.types)),
        ensHash: id(call.toENS || ""),
        functionSignature: handleFunctionSignature(call),
        value: this.FCT.handleVariableValue(call.to, "uint256", "0"),
        callId: manageCallId(calls, call, index),
        from: this.FCT.handleVariableValue(call.from, "address"),
        to: this.FCT.handleVariableValue(call.to, "address"),
        data: handleData(call),
        types: handleTypes(call),
        typedHashes:
          usedTypeStructs.length > 0
            ? usedTypeStructs.map((hash) => hexlify(TypedDataUtils.hashType(hash, typedData.types)))
            : [],
      };
    });
  }

  public getTypedData(): BatchMultiSigCallTypedData {
    return {
      types: this.getTypedDataTypes(),
      primaryType: this.getPrimaryType(),
      domain: this.getTypedDataDomain(),
      message: this.getTypedDataMessage(),
    };
  }

  public getTypedDataMessage(): TypedDataMessage {
    const transactionTypedData = this.getTransactionTypedDataMessage();

    const FCTOptions = this.FCT.options;
    const { recurrency, multisig } = FCTOptions;
    let optionalMessage = {};

    if (Number(recurrency.maxRepeats) > 1) {
      optionalMessage = _.merge(optionalMessage, {
        recurrency: {
          max_repeats: recurrency.maxRepeats,
          chill_time: recurrency.chillTime,
          accumetable: recurrency.accumetable,
        },
      });
    }

    if (multisig.externalSigners.length > 0) {
      optionalMessage = _.merge(optionalMessage, {
        multisig: {
          external_signers: multisig.externalSigners,
          minimum_approvals: multisig.minimumApprovals || "2",
        },
      });
    }

    return {
      meta: {
        name: FCTOptions.name || "",
        builder: FCTOptions.builder || "0x0000000000000000000000000000000000000000",
        selector: this.FCT.batchMultiSigSelector,
        version: this.version,
        random_id: `0x${this.salt}`,
        eip712: true,
        auth_enabled: FCTOptions.authEnabled,
      },
      limits: {
        valid_from: FCTOptions.validFrom,
        expires_at: FCTOptions.expiresAt,
        gas_price_limit: FCTOptions.maxGasPrice,
        purgeable: FCTOptions.purgeable,
        blockable: FCTOptions.blockable,
      },
      ...optionalMessage,
      ...getComputedVariableMessage(this.FCT.convertedComputed),
      ...transactionTypedData,
    };
  }

  public getTypedDataTypes(): TypedDataTypes {
    const { structTypes, transactionTypes } = new EIP712StructTypes(this.calls);

    const FCTOptions = this.FCT.options;
    const { recurrency, multisig } = FCTOptions;
    let optionalTypes = {};
    const additionalTypesInPrimary: MessageTypeProperty[] = [];

    if (Number(recurrency.maxRepeats) > 1) {
      optionalTypes = _.merge(optionalTypes, { Recurrency: EIP712.types.recurrency });
      additionalTypesInPrimary.push({ name: "recurrency", type: "Recurrency" });
    }

    if (multisig.externalSigners.length > 0) {
      optionalTypes = _.merge(optionalTypes, { Multisig: EIP712.types.multisig });
      additionalTypesInPrimary.push({ name: "multisig", type: "Multisig" });
    }

    if (this.FCT.computed.length > 0) {
      optionalTypes = _.merge(optionalTypes, { Computed: EIP712.types.computed });
    }

    return {
      EIP712Domain: EIP712.types.domain,
      Meta: EIP712.types.meta,
      Limits: EIP712.types.limits,
      ...optionalTypes,
      ...transactionTypes,
      ...structTypes,
      BatchMultiSigCall: this.getPrimaryTypeTypes(additionalTypesInPrimary),
      Call: EIP712.types.call,
    };
  }

  public getTypedDataDomain() {
    return this.FCT.domain;
  }

  public getPrimaryType() {
    return "BatchMultiSigCall";
  }

  private getPrimaryTypeTypes(additionalTypes: MessageTypeProperty[]) {
    return [
      { name: "meta", type: "Meta" },
      { name: "limits", type: "Limits" },
      ...additionalTypes,
      ...this.getComputedPrimaryType(),
      ...this.getCallsPrimaryType(),
    ];
  }

  private getCallsPrimaryType() {
    return this.calls.map((_, index) => ({
      name: `transaction_${index + 1}`,
      type: `transaction${index + 1}`,
    }));
  }

  private getComputedPrimaryType() {
    return this.FCT.computed.map((_, index) => ({
      name: `computed_${index + 1}`,
      type: `Computed`,
    }));
  }

  private getTransactionTypedDataMessage() {
    return this.calls.reduce((acc: object, call, index: number) => {
      let paramsData = {};
      if (call.params) {
        paramsData = helpers.getParams(call.params);
      }

      const options = call.options || {};
      const gasLimit = options.gasLimit ?? "0";
      const flow = options.flow ? flows[options.flow].text : "continue on success, revert on fail";

      let jumpOnSuccess = 0;
      let jumpOnFail = 0;

      if (options.jumpOnSuccess && options.jumpOnSuccess !== NO_JUMP) {
        const jumpOnSuccessIndex = this.calls.findIndex((c) => c.nodeId === options.jumpOnSuccess);

        if (jumpOnSuccessIndex === -1) {
          throw new Error(`Jump on success node id ${options.jumpOnSuccess} not found`);
        }

        if (jumpOnSuccessIndex <= index) {
          throw new Error(
            `Jump on success node id ${options.jumpOnSuccess} is current or before current node (${call.nodeId})`
          );
        }

        jumpOnSuccess = jumpOnSuccessIndex - index - 1;
      }

      if (options.jumpOnFail && options.jumpOnFail !== NO_JUMP) {
        const jumpOnFailIndex = this.calls.findIndex((c) => c.nodeId === options.jumpOnFail);

        if (jumpOnFailIndex === -1) {
          throw new Error(`Jump on fail node id ${options.jumpOnFail} not found`);
        }

        if (jumpOnFailIndex <= index) {
          throw new Error(
            `Jump on fail node id ${options.jumpOnFail} is current or before current node (${call.nodeId})`
          );
        }

        jumpOnFail = jumpOnFailIndex - index - 1;
      }

      return {
        ...acc,
        [`transaction_${index + 1}`]: {
          call: {
            call_index: index + 1,
            payer_index: index + 1,
            call_type: call.options?.callType ? CALL_TYPE_MSG[call.options.callType] : CALL_TYPE_MSG.ACTION,
            from: this.FCT.handleVariableValue(call.from, "address"),
            to: this.FCT.handleVariableValue(call.to, "address"),
            to_ens: call.toENS || "",
            eth_value: this.FCT.handleVariableValue(call.to, "uint256", "0"),
            gas_limit: gasLimit,
            permissions: 0,
            flow_control: flow,
            returned_false_means_fail: options.falseMeansFail || false,
            jump_on_success: jumpOnSuccess,
            jump_on_fail: jumpOnFail,
            method_interface: handleMethodInterface(call),
          },
          ...paramsData,
        },
      };
    }, {} as TypedDataMessage);
  }
}
