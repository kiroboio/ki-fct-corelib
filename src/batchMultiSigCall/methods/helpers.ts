import { getPlugin } from "@kirobo/ki-eth-fct-provider-ts";
import _ from "lodash";

import { CALL_TYPE_MSG, FCT_VAULT_ADDRESS, flows } from "../../constants";
import { instanceOfVariable } from "../../helpers";
import { DeepPartial, Param, Variable } from "../../types";
import {
  getComputedVariableMessage,
  getTxEIP712Types,
  handleFunctionSignature,
  handleMethodInterface,
  verifyOptions,
  verifyParam,
} from "../helpers";
import { getTypedDataDomain } from "../helpers/fct";
import { BatchMultiSigCall, EIP712_MULTISIG, EIP712_RECURRENCY, NO_JUMP } from "../index";
import { BatchMultiSigCallTypedData, FCTCallParam, IFCTOptions, IMSCallInput, IRequiredApproval } from "../types";

export function getCalldataForActuator(
  this: BatchMultiSigCall,
  {
    signedFCT,
    purgedFCT,
    investor,
    activator,
    version,
  }: {
    signedFCT: object;
    purgedFCT: string;
    investor: string;
    activator: string;
    version: string;
  }
): string {
  return this.FCT_BatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
    `0x${version}`.padEnd(66, "0"),
    signedFCT,
    purgedFCT,
    investor,
    activator,
  ]);
}

export function getAllRequiredApprovals(this: BatchMultiSigCall): IRequiredApproval[] {
  let requiredApprovals: IRequiredApproval[] = [];
  if (!this.chainId) {
    throw new Error("No chainId or provider has been set");
  }

  const chainId = this.chainId;

  for (const call of this.calls) {
    if (typeof call.to !== "string") {
      continue;
    }

    const pluginData = getPlugin({
      signature: handleFunctionSignature(call),
      address: call.to,
      chainId,
    });

    if (pluginData) {
      const initPlugin = new pluginData.plugin({ chainId });

      const methodParams = call.params
        ? call.params.reduce((acc, param) => {
            acc[param.name] = param.value;
            return acc;
          }, {} as { [key: string]: Param["value"] })
        : {};

      initPlugin.input.set({
        to: call.to,
        methodParams,
      });

      const approvals = initPlugin.getRequiredApprovals();
      if (approvals.length > 0 && typeof call.from === "string") {
        const manageValue = (value: string | undefined) => {
          if (value === FCT_VAULT_ADDRESS && typeof call.from === "string") {
            return call.from;
          }
          if (!value) {
            return "";
          }

          return value;
        };

        const requiredApprovalsWithFrom = approvals
          .filter((approval) => {
            return Object.values(approval).every((value) => typeof value !== "undefined");
          })
          .map((approval) => {
            return {
              token: approval.to ?? "",
              spender: manageValue(approval.spender),
              requiredAmount: approval.amount ?? "",
              from: approval.from || (typeof call.from === "string" ? call.from : ""),
            };
          });

        requiredApprovals = requiredApprovals.concat(requiredApprovalsWithFrom);
      }
    }
  }

  return requiredApprovals;
}

export function setOptions(this: BatchMultiSigCall, options: DeepPartial<IFCTOptions>): IFCTOptions | undefined {
  const mergedOptions = _.merge({ ...this._options }, options);
  verifyOptions(mergedOptions);

  this._options = mergedOptions;
  return this.options;
}

export function createTypedData(this: BatchMultiSigCall, salt: string, version: string): BatchMultiSigCallTypedData {
  const typedDataMessage = this.strictCalls.reduce((acc: object, call, index: number) => {
    let paramsData = {};
    if (call.params) {
      paramsData = this.getParamsFromCall(call, index);
    }

    const options = call.options || {};
    const gasLimit = options.gasLimit ?? "0";
    const flow = options.flow ? flows[options.flow].text : "continue on success, revert on fail";

    let jumpOnSuccess = 0;
    let jumpOnFail = 0;

    if (options.jumpOnSuccess !== NO_JUMP) {
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

    if (options.jumpOnFail !== NO_JUMP) {
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
          from: typeof call.from === "string" ? call.from : this.getVariable(call.from, "address"),
          to: this.handleTo(call),
          to_ens: call.toENS || "",
          eth_value: this.handleValue(call),
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
  }, {});

  const FCTOptions = this.options;
  const { recurrency, multisig } = FCTOptions;
  let optionalMessage = {};
  let optionalTypes = {};
  const primaryType = [];

  if (Number(recurrency.maxRepeats) > 1) {
    optionalMessage = _.merge(optionalMessage, {
      recurrency: {
        max_repeats: recurrency.maxRepeats,
        chill_time: recurrency.chillTime,
        accumetable: recurrency.accumetable,
      },
    });

    optionalTypes = _.merge(optionalTypes, { Recurrency: EIP712_RECURRENCY });
    primaryType.push({ name: "recurrency", type: "Recurrency" });
  }

  if (multisig.externalSigners.length > 0) {
    optionalMessage = _.merge(optionalMessage, {
      multisig: {
        external_signers: multisig.externalSigners,
        minimum_approvals: multisig.minimumApprovals || "2",
      },
    });

    optionalTypes = _.merge(optionalTypes, { Multisig: EIP712_MULTISIG });
    primaryType.push({ name: "multisig", type: "Multisig" });
  }

  const { structTypes, txTypes } = getTxEIP712Types(this.calls);

  const typedData: BatchMultiSigCallTypedData = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "salt", type: "bytes32" },
      ],
      BatchMultiSigCall: [
        { name: "meta", type: "Meta" },
        { name: "limits", type: "Limits" },
        ...primaryType,
        ...this.computedVariables.map((_, index) => ({
          name: `computed_${index + 1}`,
          type: `Computed`,
        })),
        ...this.calls.map((_, index) => ({
          name: `transaction_${index + 1}`,
          type: `transaction${index + 1}`,
        })),
      ],
      Meta: [
        { name: "name", type: "string" },
        { name: "builder", type: "address" },
        { name: "selector", type: "bytes4" },
        { name: "version", type: "bytes3" },
        { name: "random_id", type: "bytes3" },
        { name: "eip712", type: "bool" },
      ],
      Limits: [
        { name: "valid_from", type: "uint40" },
        { name: "expires_at", type: "uint40" },
        { name: "gas_price_limit", type: "uint64" },
        { name: "purgeable", type: "bool" },
        { name: "blockable", type: "bool" },
      ],
      ...optionalTypes,
      ...txTypes,
      ...structTypes,
      ...(this.computedVariables.length > 0
        ? {
            Computed: [
              { name: "index", type: "uint256" },
              { name: "var", type: "uint256" },
              { name: "add", type: "uint256" },
              { name: "sub", type: "uint256" },
              { name: "mul", type: "uint256" },
              { name: "div", type: "uint256" },
            ],
          }
        : {}),
      Call: [
        { name: "call_index", type: "uint16" },
        { name: "payer_index", type: "uint16" },
        { name: "call_type", type: "string" },
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "to_ens", type: "string" },
        { name: "eth_value", type: "uint256" },
        { name: "gas_limit", type: "uint32" },
        { name: "permissions", type: "uint16" },
        { name: "flow_control", type: "string" },
        { name: "returned_false_means_fail", type: "bool" },
        { name: "jump_on_success", type: "uint16" },
        { name: "jump_on_fail", type: "uint16" },
        { name: "method_interface", type: "string" },
      ],
    },
    primaryType: "BatchMultiSigCall",
    domain: getTypedDataDomain(this.chainId),
    message: {
      meta: {
        name: this.options.name || "",
        builder: this.options.builder || "0x0000000000000000000000000000000000000000",
        selector: this.batchMultiSigSelector,
        version,
        random_id: `0x${salt}`,
        eip712: true,
      },
      limits: {
        valid_from: this.options.validFrom,
        expires_at: this.options.expiresAt,
        gas_price_limit: this.options.maxGasPrice,
        purgeable: this.options.purgeable,
        blockable: this.options.blockable,
      },
      ...optionalMessage,
      ...getComputedVariableMessage(this.computedVariables),
      ...typedDataMessage,
    },
  };
  return typedData;
}

export function getParamsFromCall(this: BatchMultiSigCall, call: IMSCallInput, index: number) {
  // If call has parameters
  if (call.params) {
    const getParams = (params: Param[]): Record<string, FCTCallParam> => {
      return {
        ...params.reduce((acc, param) => {
          let value: FCTCallParam;

          // If parameter is a custom type (struct)
          if (param.customType || param.type.includes("tuple")) {
            // If parameter is an array of custom types
            if (param.type.lastIndexOf("[") > 0) {
              const valueArray = param.value as Param[][];
              value = valueArray.map((item) => getParams(item));
            } else {
              // If parameter is a custom type
              const valueArray = param.value as Param[];
              value = getParams(valueArray);
            }
          } else {
            try {
              verifyParam(param);
            } catch (err) {
              if (err instanceof Error) {
                throw new Error(`Error in call ${index + 1}: ${err.message}`);
              }
            }
            if (instanceOfVariable(param.value)) {
              param.value = this.getVariable(param.value, param.type);
            }
            value = param.value as string[] | string | boolean;
          }
          return {
            ...acc,
            [param.name]: value,
          };
        }, {}),
      };
    };

    return getParams(call.params);
  }
  return {};
}

export function verifyParams(this: BatchMultiSigCall, params: Param[]) {
  params.forEach((param: Param) => {
    // If parameter is a variable

    if (instanceOfVariable(param.value)) {
      param.value = this.getVariable(param.value, param.type);
    }

    if (param.customType || param.type.includes("tuple")) {
      if (param.type.lastIndexOf("[") > 0) {
        for (const parameter of param.value as Param[][]) {
          this.verifyParams(parameter as Param[]);
        }
      } else {
        this.verifyParams(param.value as Param[]);
      }
    }
  });
}

export function handleTo(this: BatchMultiSigCall, call: IMSCallInput) {
  if (typeof call.to === "string") {
    return call.to;
  }

  // Else it is a variable
  return this.getVariable(call.to, "address");
}

export function handleValue(this: BatchMultiSigCall, call: IMSCallInput): string {
  // If value isn't provided => 0
  if (!call.value) {
    return "0";
  }

  // Check if value is a number
  if (typeof call.value === "string") {
    return call.value;
  }

  // Else it is a variable
  return this.getVariable(call.value as Variable, "uint256");
}
