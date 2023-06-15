import { ChainId } from "@kiroboio/fct-plugins";
import { MessageTypeProperty } from "@metamask/eth-sig-util/dist/sign-typed-data";
import _ from "lodash";

import { CALL_TYPE_MSG } from "../../../../constants";
import { flows } from "../../../../constants/flows";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { NO_JUMP } from "../../constants";
import { getComputedVariableMessage, handleMethodInterface } from "../../helpers";
import { BatchMultiSigCallTypedData, TypedDataDomain, TypedDataMessage, TypedDataTypes } from "../../types";
import { EIP712StructTypes } from "../EIP712StructTypes";
import { FCTBase } from "../FCTBase";
import { Call, Computed, EIP712Domain, Limits, Meta, Multisig, Recurrency } from "./constants";
import * as helpers from "./helpers";

const TYPED_DATA_DOMAIN: Record<ChainId, TypedDataDomain> = {
  "1": {
    // Mainnet
    name: "FCT Controller",
    version: "1",
    chainId: 1,
    verifyingContract: "0x0A0ea58E6504aA7bfFf6F3d069Bd175AbAb638ee",
    salt: "0x0100c3ae8d91c3ffd32800000a0ea58e6504aa7bfff6f3d069bd175abab638ee",
  },
  "5": {
    // Goerli
    name: "FCT Controller",
    version: "1",
    chainId: 5,
    verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
    salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
  },
  "42161": {
    // Arbitrum
    // TODO: Update this when the testnet is live
    name: "FCT Controller",
    version: "1",
    chainId: 42161,
    verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
    salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
  },
  "421613": {
    // Arbitrum Testnet
    // TODO: Update this when the testnet is live
    name: "FCT Controller",
    version: "1",
    chainId: 421613,
    verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
    salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
  },
};

const types = {
  domain: EIP712Domain,
  meta: Meta,
  limits: Limits,
  computed: Computed,
  call: Call,
  recurrency: Recurrency,
  multisig: Multisig,
} as const;

export class EIP712 extends FCTBase {
  constructor(FCT: BatchMultiSigCall) {
    super(FCT);
  }
  static types = types;

  static getTypedDataDomain(chainId: ChainId) {
    return TYPED_DATA_DOMAIN[chainId];
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
        version: this.FCT.version,
        random_id: `0x${this.FCT.randomId}`,
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
      ...getComputedVariableMessage(this.FCT.computedWithValues),
      ...transactionTypedData,
    };
  }

  public getTypedDataTypes(): TypedDataTypes {
    const { structTypes, transactionTypes } = new EIP712StructTypes(this.FCT.calls);

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
    return this.FCT.calls.map((_, index) => ({
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
    return this.FCT.decodedCalls.reduce((acc: object, call, index: number) => {
      const paramsData = call.params ? helpers.getParams(call.params) : {};

      const options = call.options || {};
      const gasLimit = options.gasLimit ?? "0";
      const flow = options.flow ? flows[options.flow].text : "continue on success, revert on fail";

      let jumpOnSuccess = 0;
      let jumpOnFail = 0;

      if (options.jumpOnSuccess && options.jumpOnSuccess !== NO_JUMP) {
        const jumpOnSuccessIndex = this.FCT.calls.findIndex((c) => c.nodeId === options.jumpOnSuccess);

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
        const jumpOnFailIndex = this.FCT.calls.findIndex((c) => c.nodeId === options.jumpOnFail);

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
            from: this.FCT.variables.getValue(call.from, "address"),
            to: this.FCT.variables.getValue(call.to, "address"),
            to_ens: call.toENS || "",
            eth_value: this.FCT.variables.getValue(call.value, "uint256", "0"),
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
