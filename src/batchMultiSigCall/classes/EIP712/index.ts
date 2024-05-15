import { ChainId } from "@kiroboio/fct-plugins";
import { MessageTypeProperty } from "@metamask/eth-sig-util";

import { deepMerge } from "../../../helpers/deepMerge";
import { BatchMultiSigCallTypedData, TypedDataDomain, TypedDataMessage, TypedDataTypes } from "../../types";
import { FCTBase } from "../FCTBase";
import { IValidationEIP712 } from "../Validation/types";
import { IComputedEIP712 } from "../Variables/types";
import { Call, Computed, EIP712Domain, Engine, Limits, Meta, Multisig, Recurrency, Validation } from "./constants";

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
    verifyingContract: "0x1Bc4e8448E6B6703c7458C4Ee8361eB6c3015fD4",
    salt: "0x01006e6774a58cfed2c900001bc4e8448e6b6703c7458c4ee8361eb6c3015fd4",
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

const types = {
  domain: EIP712Domain,
  meta: Meta,
  engine: Engine,
  limits: Limits,
  computed: Computed,
  call: Call,
  recurrency: Recurrency,
  multisig: Multisig,
  validation: Validation,
} as const;

export class EIP712 extends FCTBase {
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

    return {
      meta: {
        name: FCTOptions.name || "",
        app: FCTOptions.app.name || "",
        app_version: FCTOptions.app.version || "",
        builder: FCTOptions.builder.name || "",
        builder_address: FCTOptions.builder.address || "",
        domain: FCTOptions.domain || "",
      },
      engine: {
        selector: this.FCT.batchMultiSigSelector,
        version: this.FCT.version,
        random_id: `0x${this.FCT.randomId}`,
        eip712: true,
        verifier: FCTOptions.verifier,
        auth_enabled: FCTOptions.authEnabled,
        dry_run: FCTOptions.dryRun,
      },
      limits: {
        valid_from: FCTOptions.validFrom,
        expires_at: FCTOptions.expiresAt,
        gas_price_limit: FCTOptions.maxGasPrice,
        purgeable: FCTOptions.purgeable,
        blockable: FCTOptions.blockable,
      },
      ...optionalMessage,
      ...this.getComputedVariableMessage(),
      ...this.getValidationMessage(),
      ...transactionTypedData,
    };
  }

  public getTypedDataTypes(): TypedDataTypes {
    const { structTypes, transactionTypes } = this.getCallTypesAndStructs();

    const FCTOptions = this.FCT.options;
    const { recurrency, multisig } = FCTOptions;
    let optionalTypes = {};
    const additionalTypesInPrimary: MessageTypeProperty[] = [];

    if (Number(recurrency.maxRepeats) > 1) {
      optionalTypes = deepMerge(optionalTypes, { Recurrency: EIP712.types.recurrency });
      additionalTypesInPrimary.push({ name: "recurrency", type: "Recurrency" });
    }

    if (multisig.externalSigners.length > 0) {
      optionalTypes = deepMerge(optionalTypes, { Multisig: EIP712.types.multisig });
      additionalTypesInPrimary.push({ name: "multisig", type: "Multisig" });
    }

    if (this.FCT.computed.length > 0) {
      optionalTypes = deepMerge(optionalTypes, { Computed: EIP712.types.computed });
    }

    if (this.FCT.validation.get().length > 0) {
      optionalTypes = deepMerge(optionalTypes, { Validation: EIP712.types.validation });
    }

    return {
      EIP712Domain: EIP712.types.domain,
      Meta: EIP712.types.meta,
      Engine: EIP712.types.engine,
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
}
