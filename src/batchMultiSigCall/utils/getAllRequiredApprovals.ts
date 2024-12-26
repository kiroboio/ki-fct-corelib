import { ChainId, getPlugin, RequiredApprovalInterface } from "@kiroboio/fct-plugins";
import { utils } from "ethers";

import { InstanceOf } from "../../helpers";
import { Param, Variable } from "../../types";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { CallBase } from "../classes";
import { IRequiredApproval, StrictMSCallInput } from "../types";

const { getAddress, id } = utils;

const transferFunctionSignature = id("transferFrom(address,address,uint256)").toLowerCase();

export function getAllRequiredApprovals(FCT: BatchMultiSigCall): IRequiredApproval[] {
  if (!FCT.chainId) {
    throw new Error("No chainId or provider has been set");
  }

  const chainId = FCT.chainId;
  const calls = FCT.calls;
  const callsAsObjects = FCT.callsAsObjects;

  const requiredApprovalsMap = new Map<string, IRequiredApproval>();
  const requiredApprovals: IRequiredApproval[] = [];

  for (const [callIndex, call] of callsAsObjects.entries()) {
    if (typeof call.to !== "string") {
      continue;
    }

    const callClass = new CallBase(call);
    let approvals: RequiredApprovalInterface[] = [];

    const funcitonSignature = callClass.getFunctionSignature();

    // If the functionSignature is id("transferFrom(address,address,uint256)")
    // This is a bypass for an edge case where transferFrom is for ERC20 and ERC721
    if (funcitonSignature.toLowerCase() === transferFunctionSignature) {
      handleTransferFrom(call as StrictMSCallInput & { to: string }, requiredApprovals);
      continue;
    }

    const mainCallData = calls[callIndex];
    if (mainCallData.plugin) {
      const pluginApprovals = mainCallData.plugin.getRequiredApprovals();
      approvals = pluginApprovals;
    } else {
      try {
        const pluginData = getPlugin({
          signature: funcitonSignature,
          address: call.to,
          chainId,
        });
        if (pluginData && !Array.isArray(pluginData)) {
          approvals = getApprovalsFromPlugin({ pluginData, call, chainId });
        }
      } catch (error) {
        continue;
      }
    }

    if (approvals.length > 0 && typeof call.from === "string") {
      const requiredApprovalsWithFrom = getApprovalsWithFrom({
        approvals,
        callIndex,
        call,
        callsAsObjects,
      });

      for (const approval of requiredApprovalsWithFrom) {
        if (approval.protocol === "ERC20") {
          const id = `${approval.from}-${approval.method}-${approval.token}-${approval.params.spender}`;
          if (requiredApprovalsMap.has(id)) {
            // Need to add amount to the existing approval
            const existingApproval = requiredApprovalsMap.get(id) as IRequiredApproval & { protocol: "ERC20" };
            existingApproval.params.amount = (
              BigInt(existingApproval.params.amount) + BigInt(approval.params.amount)
            ).toString();
          } else {
            requiredApprovalsMap.set(id, approval);
          }
          continue;
        }

        const regularId = `${approval.from}-${approval.method}-${approval.token}-${JSON.stringify(approval.params)}`;
        requiredApprovalsMap.set(regularId, approval);
      }
    }
  }
  return [...requiredApprovals, ...Array.from(requiredApprovalsMap.values())];
}

function handleTransferFrom(call: StrictMSCallInput & { to: string }, requiredApprovals: IRequiredApproval[]) {
  const whoNeedsToApprove = call.params ? call.params[0].value : "";
  const amount = call.params ? call.params[2].value : "";
  const from = call.from;
  if (
    typeof whoNeedsToApprove === "string" &&
    typeof amount === "string" &&
    typeof from === "string" &&
    from.toLowerCase() !== whoNeedsToApprove.toLowerCase()
  ) {
    requiredApprovals.push({
      protocol: "ERC20",
      from: whoNeedsToApprove,
      method: "approve",
      token: call.to,
      params: {
        spender: from,
        amount: amount,
      },
    });
  }
}

function getApprovalsFromPlugin({
  pluginData,
  call,
  chainId,
}: {
  pluginData: any;
  call: StrictMSCallInput;
  chainId: ChainId;
}) {
  const initPlugin = new pluginData.plugin({
    chainId,
    vaultAddress: typeof call.from === "string" ? call.from : "",
  });

  if (pluginData.name === "MulticallPlugin") {
    function getMethodParamsForMulticallPlugins(params: Param[]) {
      return params.map((param) => {
        if (param.type === "tuple[]") {
          return (param.value as any).map((p) => getMethodParamsForMulticallPlugins(p));
        }
        if (param.type === "tuple") {
          return getMethodParamsForMulticallPlugins(param.value as any);
        }
        return param.value;
      });
    }

    const _methodParams = getMethodParamsForMulticallPlugins(call.params as any);

    initPlugin.setMethodParams(_methodParams);
  } else {
    const methodParams = call.params
      ? call.params.reduce(
          (acc, param) => {
            acc[param.name] = param.value;
            return acc;
          },
          {} as { [key: string]: Param["value"] },
        )
      : {};

    initPlugin.input.set({
      to: call.to,
      methodParams,
    });
  }

  return initPlugin.getRequiredApprovals();
}

function getApprovalsWithFrom({
  approvals,
  callIndex,
  call,
  callsAsObjects,
}: {
  approvals: RequiredApprovalInterface[];
  callIndex: number;
  call: StrictMSCallInput;
  callsAsObjects: StrictMSCallInput[];
}) {
  const mappedApprovals = approvals.map((approval) => handleApproval(approval, call));
  console.log(mappedApprovals);

  return mappedApprovals.filter((approval) => {
    if (typeof call.from !== "string") {
      return true;
    }
    const isGoingToGetApproved = callsAsObjects.some((fctCall, i) => {
      if (i >= callIndex) return false; // If the call is after the current call, we don't need to check
      const { to, method, from } = fctCall;
      if (typeof to !== "string" || typeof from !== "string") return false; // If the call doesn't have a to or from, we don't need to check

      // Check if there is the same call inside FCT and BEFORE this call. If there is, we don't need to approve again
      return (
        to.toLowerCase() === approval.token.toLowerCase() &&
        method === approval.method &&
        from.toLowerCase() === approval.from.toLowerCase()
      );
    });

    if (isGoingToGetApproved) return false;

    const caller = getAddress(call.from);
    // If the protocol is AAVE, we check if the caller is the spender and the approver
    if (approval.protocol === "AAVE") {
      const whoIsApproving = getAddress(approval.from);
      const whoIsSpending = getAddress(approval.params.delegatee);

      // If the caller is the spender and the approver - no need to approve
      return !(caller === whoIsSpending && caller === whoIsApproving);
    }

    // If the protocol is ERC721 and the call method is safeTransferFrom or transferFrom
    if (approval.protocol === "ERC721" && (call.method === "safeTransferFrom" || call.method === "transferFrom")) {
      const whoIsSending = getAddress(approval.from);
      const whoIsSpending = getAddress(approval.params.spender);

      // If the caller and spender is the same, no need to approve
      return whoIsSending !== whoIsSpending;
    }
    return true;
  });
}

const manageValue = (value: string | Variable | undefined) => {
  if (InstanceOf.Variable(value) || !value) {
    return "";
  }

  return value;
};

function handleApproval(approval: RequiredApprovalInterface, call: StrictMSCallInput) {
  if (approval.method === "approve") {
    const data = {
      token: manageValue(approval.to as unknown as string | Variable | undefined),
      method: approval.method,
      from: manageValue((approval.from || call.from) as unknown as string | Variable | undefined),
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
  if (approval.method === "setApprovalForAll" && (approval.protocol === "ERC721" || approval.protocol === "ERC1155")) {
    return {
      protocol: approval.protocol,
      token: manageValue(approval.to as unknown as string | Variable | undefined),
      method: approval.method,
      params: {
        spender: manageValue(approval.params[0] as string), // Who is going to spend
        approved: approval.params[1] === "true",
        ids: approval.params[2] as string[],
      },
      from: manageValue((approval.from || call.from) as unknown as string | Variable | undefined), // Who needs to approve
    };
  }

  if (approval.protocol === "AAVE" && approval.method === "approveDelegation") {
    return {
      protocol: approval.protocol,
      token: manageValue(approval.to as unknown as string | Variable | undefined),
      method: approval.method,
      params: {
        delegatee: manageValue(approval.params[0] as string), // Who is going to spend
        amount: approval.params[1] as string,
      },
      from: manageValue((approval.from || call.from) as unknown as string | Variable | undefined), // Who needs to approve
    };
  }

  throw new Error("Unknown method for plugin");
}
