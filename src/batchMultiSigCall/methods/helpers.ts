import { getPlugin } from "@kirobo/ki-eth-fct-provider-ts";

import { FCT_VAULT_ADDRESS } from "../../constants";
import { instanceOfVariable } from "../../helpers";
import { DeepPartial, Param, ParamWithoutVariable, Variable } from "../../types";
import { handleFunctionSignature } from "../helpers";
import { BatchMultiSigCall } from "../index";
import { IFCTOptions, IRequiredApproval } from "../types";

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
        const manageValue = (value: string | Variable | undefined) => {
          if (instanceOfVariable(value) || !value) {
            return "";
          }
          if (value === FCT_VAULT_ADDRESS && typeof call.from === "string") {
            return call.from;
          }

          return value;
        };

        const requiredApprovalsWithFrom = approvals
          .filter((approval) => {
            return Object.values(approval).every((value) => typeof value !== "undefined");
          })
          .map((approval): IRequiredApproval => {
            // If method is approve
            if (approval.method === "approve") {
              const data = {
                token: manageValue(approval.to),
                method: approval.method,
                from: manageValue(approval.from || call.from),
              };
              if (approval.protocol === "ERC20") {
                return {
                  ...data,
                  protocol: approval.protocol,
                  params: {
                    spender: manageValue(approval.params[0] as string),
                    amount: approval.params[1] as string,
                  },
                };
              } else if (approval.protocol === "ERC721") {
                return {
                  ...data,
                  protocol: approval.protocol,
                  params: {
                    spender: manageValue(approval.params[0] as string),
                    tokenId: approval.params[1] as string,
                  },
                };
              }
            }
            if (
              approval.method === "setApprovalForAll" &&
              (approval.protocol === "ERC721" || approval.protocol === "ERC1155")
            ) {
              return {
                protocol: approval.protocol,
                token: manageValue(approval.to),
                method: approval.method,
                params: {
                  spender: manageValue(approval.params[0] as string),
                  approved: approval.params[1] as boolean,
                },
                from: manageValue(approval.from || call.from),
              };
            }

            throw new Error("Unknown method for plugin");
          });

        requiredApprovals = [...requiredApprovals, ...requiredApprovalsWithFrom];
      }
    }
  }

  return requiredApprovals;
}

export function setOptions(this: BatchMultiSigCall, options: DeepPartial<IFCTOptions>): IFCTOptions {
  return this._options.set(options);
}

export function handleVariableValue(
  this: BatchMultiSigCall,
  value: undefined | Variable | string,
  type: string,
  returnIfUndefined = ""
) {
  if (!value) {
    return returnIfUndefined;
  }
  if (typeof value === "string") {
    return value;
  }

  return this.getVariable(value, type);
}

export function decodeParams(this: BatchMultiSigCall, params: Param[]): ParamWithoutVariable[] {
  return params.reduce((acc, param) => {
    if (param.type === "tuple" || param.customType) {
      if (param.type.lastIndexOf("[") > 0) {
        const value = param.value as Param[][];
        const decodedValue = value.map((tuple) => this.decodeParams(tuple));
        return [...acc, { ...param, value: decodedValue }];
      }

      const value = this.decodeParams(param.value as Param[]);
      return [...acc, { ...param, value }];
    }
    if (instanceOfVariable(param.value)) {
      const value = this.getVariable(param.value, param.type);
      const updatedParam = { ...param, value };
      return [...acc, updatedParam];
    }
    return [...acc, param as ParamWithoutVariable];
  }, [] as ParamWithoutVariable[]);
}
