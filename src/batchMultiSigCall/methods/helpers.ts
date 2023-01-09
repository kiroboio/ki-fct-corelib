import { ChainId, getPlugin } from "@kirobo/ki-eth-fct-provider-ts";
import { Param, Variable } from "@types";
import { utils } from "ethers";

import { CALL_TYPE_MSG, flows } from "../../constants";
import { createValidatorTxData, getTypedDataDomain, instanceOfVariable } from "../../helpers";
import {
  getComputedVariableMessage,
  getTxEIP712Types,
  handleFunctionSignature,
  handleMethodInterface,
} from "../helpers";
import { BatchMultiSigCall } from "../index";
import { BatchMultiSigCallTypedData, IFCTOptions, IMSCallInput, IRequiredApproval } from "../types";

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

export async function getAllRequiredApprovals(this: BatchMultiSigCall): Promise<IRequiredApproval[]> {
  let requiredApprovals: {
    token: string | undefined;
    spender: string | undefined;
    requiredAmount: string | undefined;
    from: string;
  }[] = [];
  if (!this.chainId && !this.provider) {
    throw new Error("No chainId or provider has been set");
  }

  const chainId = (this.chainId || (await this.provider.getNetwork()).chainId.toString()) as ChainId;

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

      const methodParams = call.params.reduce((acc, param) => {
        acc[param.name] = param.value;
        return acc;
      }, {});

      initPlugin.input.set({
        to: call.to,
        methodParams,
      });

      const approvals = initPlugin.getRequiredApprovals();
      if (approvals.length > 0 && typeof call.from === "string") {
        const requiredApprovalsWithFrom = approvals
          .filter((approval) => {
            return Object.values(approval).every((value) => typeof value !== "undefined");
          })
          .map((approval) => {
            return {
              token: approval.to,
              spender: approval.spender,
              requiredAmount: approval.amount,
              from: call.from as string,
            };
          });

        requiredApprovals = requiredApprovals.concat(requiredApprovalsWithFrom);
      }
    }
  }

  return requiredApprovals;
}

export function setOptions(this: BatchMultiSigCall, options: Partial<IFCTOptions>): IFCTOptions {
  if (options.maxGasPrice !== undefined && options.maxGasPrice === "0") {
    throw new Error("Max gas price cannot be 0 or less");
  }

  if (options.expiresAt !== undefined) {
    const now = Number(new Date().getTime() / 1000).toFixed();
    if (options.expiresAt <= now) {
      throw new Error("Expires at must be in the future");
    }
  }

  if (options.builder !== undefined && !utils.isAddress(options.builder)) {
    throw new Error("Builder must be a valid address");
  }

  this.options = { ...this.options, ...options };
  return this.options;
}

export async function createTypedData(
  this: BatchMultiSigCall,
  salt: string,
  version: string
): Promise<BatchMultiSigCallTypedData> {
  const typedDataMessage = this.calls.reduce((acc: object, call: IMSCallInput, index: number) => {
    // Update params if variables (FC) or references (FD) are used
    let paramsData = {};
    if (call.params) {
      this.verifyParams(call.params);
      paramsData = this.getParamsFromCall(call);

      // Check if paramsData has one key and that key is typeof object

      // if (Object.keys(paramsData).length === 1 && typeof paramsData[Object.keys(paramsData)[0]] === "object") {
      //   const allNativeTypes = (call.params[0].value as Param[]).every((param) => {
      //     const { type } = param;
      //     const nativeTypes = ["address", "uint", "int", "bytes32", "bool"];
      //     return nativeTypes.some((nativeType) => type.startsWith(nativeType));
      //   });

      //   if (allNativeTypes) {
      //     paramsData = paramsData[Object.keys(paramsData)[0]];
      //   }

      //   paramsData = paramsData[Object.keys(paramsData)[0]];
      // }
    }

    const options = call.options || {};
    const gasLimit = options.gasLimit ?? "0";
    const flow = options.flow ? flows[options.flow].text : "continue on success, revert on fail";

    let jumpOnSuccess = 0;
    let jumpOnFail = 0;

    if (options.jumpOnSuccess) {
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

    if (options.jumpOnFail) {
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

  let optionalMessage = {};
  let optionalTypes = {};
  const primaryType = [];

  if ("recurrency" in this.options) {
    optionalMessage = {
      recurrency: {
        max_repeats: this.options?.recurrency?.maxRepeats || "1",
        chill_time: this.options?.recurrency?.chillTime || "0",
        accumetable: this.options?.recurrency?.accumetable || false,
      },
    };
    optionalTypes = {
      Recurrency: [
        { name: "max_repeats", type: "uint16" },
        { name: "chill_time", type: "uint32" },
        { name: "accumetable", type: "bool" },
      ],
    };
    primaryType.push({ name: "recurrency", type: "Recurrency" });
  }

  if ("multisig" in this.options) {
    optionalMessage = {
      ...optionalMessage,
      multisig: {
        external_signers: this.options?.multisig?.externalSigners,
        minimum_approvals: this.options?.multisig?.minimumApprovals || 2,
      },
    };
    optionalTypes = {
      ...optionalTypes,
      Multisig: [
        { name: "external_signers", type: "address[]" },
        { name: "minimum_approvals", type: "uint8" },
      ],
    };
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
    domain: await getTypedDataDomain(this.FCT_Controller),
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

export function getParamsFromCall(this: BatchMultiSigCall, call: IMSCallInput) {
  // If call has parameters
  if (call.params) {
    // If mcall is a validation call
    if (call.validator) {
      Object.entries(call.validator.params).forEach(([key, value]) => {
        if (typeof value !== "string") {
          call.validator.params[key] = this.getVariable(value, "uint256");
        }
      });

      return createValidatorTxData(call);
    }
    const getParams = (params: Param[]) => {
      return {
        ...params.reduce((acc, param) => {
          let value: any;

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
            value = param.value;
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
  // If call is a validator method, return validator address as to address
  if (call.validator) {
    return call.validator.validatorAddress;
  }

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
