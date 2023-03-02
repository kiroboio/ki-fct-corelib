import { getPlugin } from "@kirobo/ki-eth-fct-provider-ts";
import { handleFunctionSignature } from "batchMultiSigCall/helpers";
import { instanceOfVariable } from "helpers";
import { BatchMultiSigCall } from "methods";
import { IRequiredApproval, Param, Variable } from "types";

import { FCT_VAULT_ADDRESS } from "../../constants";

export function getAllRequiredApprovals(FCT: BatchMultiSigCall): IRequiredApproval[] {
  let requiredApprovals: IRequiredApproval[] = [];
  if (!FCT.chainId) {
    throw new Error("No chainId or provider has been set");
  }

  const chainId = FCT.chainId;

  for (const call of FCT.calls) {
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
