import { ChainId } from "@kiroboio/fct-plugins";
import { MessageTypeProperty } from "@metamask/eth-sig-util";

import { deepMerge } from "../../../helpers/deepMerge";
import { BatchMultiSigCallTypedData, TypedDataDomain, TypedDataMessage, TypedDataTypes } from "../../types";
import { getVersionClass } from "../../versions/getVersion";
import { VersionBase } from "../../versions/VersionBase";
import { FCTBase } from "../FCTBase";
import { IValidationEIP712 } from "../Validation/types";
import { IComputedEIP712 } from "../Variables/types";

const TYPED_DATA_DOMAIN: Record<string, TypedDataDomain> = {
  // Mainnet
  "1": {
    name: "FCT Controller",
    version: "1",
    chainId: 1,
    verifyingContract: "0x0A0ea58E6504aA7bfFf6F3d069Bd175AbAb638ee",
    salt: "0x0100c3ae8d91c3ffd32800000a0ea58e6504aa7bfff6f3d069bd175abab638ee",
  },
  // Arbitrum One
  "42161": {
    name: "FCT Controller",
    version: "1",
    chainId: 42161,
    verifyingContract: "0x7A45405D953974998fc447C196Fb015DC41C0650",
    salt: "0x0100af89b3a0314c9a2f00007a45405d953974998fc447c196fb015dc41c0650",
  },
  // Optimism
  "10": {
    name: "FCT Controller",
    version: "1",
    chainId: 10,
    verifyingContract: "0x574F4cDAB7ec20E3A37BDE025260F0A2359503d6",
    salt: "0x0100cf95b9e9710875170000574f4cdab7ec20e3a37bde025260f0a2359503d6",
  },
  // Base
  "8453": {
    name: "FCT Controller",
    version: "1",
    chainId: 8453,
    verifyingContract: "0xE8572102FA6AE172df00634d5262E56ee283C134",
    salt: "0x010031f459a6ee43c8ab0000e8572102fa6ae172df00634d5262e56ee283c134",
  },
  //
  // Testnets
  //
  // Sepolia
  "11155111": {
    name: "FCT Controller",
    version: "1",
    chainId: 11155111,
    verifyingContract: "0xEa34C0bF3057D3d2bC97902091c71a8D4c9747DC",
    salt: "0x01008fae4fc2403818850000ea34c0bf3057d3d2bc97902091c71a8d4c9747dc",
  },
  // Goerli (DEPRECATED)
  "5": {
    name: "FCT Controller",
    version: "1",
    chainId: 5,
    verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
    salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
  },
  // Arbitrum Goerli (DEPRECATED)
  "421613": {
    name: "FCT Controller",
    version: "1",
    chainId: 421613,
    verifyingContract: "0x574F4cDAB7ec20E3A37BDE025260F0A2359503d6",
    salt: "0x0100df6d107dcaba91640000574f4cdab7ec20e3a37bde025260f0a2359503d6",
  },
};

export class EIP712 extends FCTBase {
  private _lastVersion: string | undefined;
  private _VersionClass: VersionBase | undefined;

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
      optionalMessage = deepMerge(optionalMessage, {
        recurrency: {
          max_repeats: recurrency.maxRepeats,
          chill_time: recurrency.chillTime,
          accumetable: recurrency.accumetable,
        },
      });
    }

    if (multisig.externalSigners.length > 0) {
      optionalMessage = deepMerge(optionalMessage, {
        multisig: {
          external_signers: multisig.externalSigners,
          minimum_approvals: multisig.minimumApprovals || "2",
        },
      });
    }

    const Version = this._getVersionClass();

    return {
      meta: Version.getMetaMessage(this.FCT) as any,
      engine: Version.getEngineMessage(this.FCT) as any,
      limits: Version.getLimitsMessage(this.FCT) as any,
      ...optionalMessage,
      ...this.getComputedVariableMessage(),
      ...this.getValidationMessage(),
      ...transactionTypedData,
    };
  }

  public getTypedDataTypes(): TypedDataTypes {
    const Version = getVersionClass(this.FCT);
    const { structTypes, transactionTypes } = this.getCallTypesAndStructs();

    const FCTOptions = this.FCT.options;
    const { recurrency, multisig } = FCTOptions;
    let optionalTypes = {};
    const additionalTypesInPrimary: MessageTypeProperty[] = [];

    if (Number(recurrency.maxRepeats) > 1) {
      optionalTypes = deepMerge(optionalTypes, { Recurrency: Version.Recurrency });
      additionalTypesInPrimary.push({ name: "recurrency", type: "Recurrency" });
    }

    if (multisig.externalSigners.length > 0) {
      optionalTypes = deepMerge(optionalTypes, { Multisig: Version.Multisig });
      additionalTypesInPrimary.push({ name: "multisig", type: "Multisig" });
    }

    if (this.FCT.computed.length > 0) {
      optionalTypes = deepMerge(optionalTypes, { Computed: Version.Computed });
    }

    if (this.FCT.validation.get().length > 0) {
      optionalTypes = deepMerge(optionalTypes, { Validation: Version.Validation });
    }

    return {
      EIP712Domain: Version.EIP712Domain,
      Meta: Version.Meta,
      Engine: Version.Engine,
      Limits: Version.Limits,
      ...optionalTypes,
      ...transactionTypes,
      ...structTypes,
      BatchMultiSigCall: this.getPrimaryTypeTypes(additionalTypesInPrimary),
      Call: Version.Call,
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
      { name: "engine", type: "Engine" },
      { name: "limits", type: "Limits" },
      ...additionalTypes,
      ...this.getComputedPrimaryType(),
      ...this.getValidationPrimaryType(),
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

  private getValidationPrimaryType() {
    return this.FCT.validation.get().map((_, index) => ({
      name: `validation_${index + 1}`,
      type: `Validation`,
    }));
  }

  private getTransactionTypedDataMessage() {
    return this.FCT.calls.reduce((acc: object, call, index: number) => {
      return {
        ...acc,
        [`transaction_${index + 1}`]: call.generateEIP712Message(index),
      };
    }, {} as TypedDataMessage);
  }

  private getValidationMessage() {
    return this.FCT.validation.getForEIP712().reduce(
      (acc, item, i) => {
        return {
          ...acc,
          [`validation_${i + 1}`]: item,
        };
      },
      {} as Record<`validation_${number}`, IValidationEIP712>,
    );
  }

  private getComputedVariableMessage = () => {
    return this.FCT.variables.computedForEIP712.reduce(
      (acc, item, i) => {
        return {
          ...acc,
          [`computed_${i + 1}`]: item,
        };
      },
      {} as Record<`computed_${number}`, IComputedEIP712>,
    );
  };

  private getCallTypesAndStructs() {
    let structs: Record<string, { name: string; type: string }[]> = {};
    const types: Record<string, { name: string; type: string }[]> = {};

    this.FCT.calls.forEach((call, index) => {
      const { structTypes, callType } = call.generateEIP712Type(index);
      structs = { ...structs, ...structTypes };
      types[`transaction${index + 1}`] = callType;
    });

    return { structTypes: structs, transactionTypes: types };
  }

  private _getVersionClass() {
    if (!this._VersionClass || this._lastVersion !== this.FCT.version) {
      this._VersionClass = getVersionClass(this.FCT);
      this._lastVersion = this.FCT.version;
    }
    return this._VersionClass;
  }
}
