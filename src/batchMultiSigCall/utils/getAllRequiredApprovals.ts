import { getPlugin } from "@kirobo/ki-eth-fct-provider-ts";
import { getAddress } from "ethers/lib/utils";

import { FCT_VAULT_ADDRESS } from "../../constants";
import { instanceOfVariable } from "../../helpers";
import { Param, Variable } from "../../types";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { handleFunctionSignature } from "../helpers";
import { IRequiredApproval } from "../types";

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
          .map((approval): IRequiredApproval => {
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
                  spender: manageValue(approval.params[0] as string), // Who is going to spend
                  approved: approval.params[1] as boolean,
                },
                from: manageValue(approval.from || call.from), // Who needs to approve
              };
            }

            if (approval.protocol === "AAVE" && approval.method === "approveDelegation") {
              return {
                protocol: approval.protocol,
                token: manageValue(approval.to),
                method: approval.method,
                params: {
                  delegatee: manageValue(approval.params[0] as string), // Who is going to spend
                  amount: approval.params[1] as string,
                },
                from: manageValue(approval.from || call.from), // Who needs to approve
              };
            }

            throw new Error("Unknown method for plugin");
          })
          .filter((approval) => {
            if (typeof call.from !== "string") {
              return true;
            }
            const caller = getAddress(call.from);
            // If the protocol is AAVE, we check if the caller is the spender and the approver
            if (approval.protocol === "AAVE") {
              const whoIsApproving = getAddress(approval.from);
              const whoIsSpending = getAddress(approval.params.delegatee);

              // If the caller is the spender and the approver - no need to approve
              return !(caller === whoIsSpending && caller === whoIsApproving);
            }

            // If the protocol is ERC721 and the call method is safeTransferFrom or transferFrom
            if (
              approval.protocol === "ERC721" &&
              (call.method === "safeTransferFrom" || call.method === "transferFrom")
            ) {
              const whoIsSending = getAddress(approval.from);
              const whoIsSpending = getAddress(approval.params.spender);
              console.log("whoIsSending", whoIsSending);
              console.log("whoIsSpending", whoIsSpending);

              // If the caller and spender is the same, no need to approve
              return !(whoIsSending === whoIsSpending);
            }
            return true;
          });

        requiredApprovals = [...requiredApprovals, ...requiredApprovalsWithFrom];
      }
    }
  }

  return requiredApprovals;
}
