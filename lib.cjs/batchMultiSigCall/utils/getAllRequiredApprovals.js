"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRequiredApprovals = void 0;
const fct_plugins_1 = require("@kiroboio/fct-plugins");
const ethers_1 = require("ethers");
const helpers_1 = require("../../helpers");
const classes_1 = require("../classes");
const { getAddress, id } = ethers_1.utils;
function getAllRequiredApprovals(FCT) {
    let requiredApprovals = [];
    if (!FCT.chainId) {
        throw new Error("No chainId or provider has been set");
    }
    const chainId = FCT.chainId;
    const calls = FCT.calls;
    for (const [callIndex, call] of FCT.callsAsObjects.entries()) {
        if (typeof call.to !== "string") {
            continue;
        }
        const callClass = new classes_1.CallBase(call);
        let approvals = [];
        const funcitonSignature = callClass.getFunctionSignature();
        // If the functionSignature is id("transferFrom(address,address,uint256)")
        // This is a bypass for an edge case where transferFrom is for ERC20 and ERC721
        if (funcitonSignature.toLowerCase() === id("transferFrom(address,address,uint256)").toLowerCase()) {
            const whoNeedsToApprove = call.params ? call.params[0].value : "";
            const amount = call.params ? call.params[2].value : "";
            const from = call.from;
            if (typeof whoNeedsToApprove === "string" &&
                typeof amount === "string" &&
                typeof from === "string" &&
                from.toLowerCase() !== whoNeedsToApprove.toLowerCase()) {
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
            continue;
        }
        const mainCallData = calls[callIndex];
        if (mainCallData.plugin) {
            const plugin = mainCallData.plugin;
            const pluginApprovals = plugin.getRequiredApprovals();
            approvals = pluginApprovals;
        }
        else {
            let pluginData;
            try {
                pluginData = (0, fct_plugins_1.getPlugin)({
                    signature: callClass.getFunctionSignature(),
                    address: call.to,
                    chainId,
                });
            }
            catch (error) {
                continue;
            }
            if (pluginData) {
                const initPlugin = new pluginData.plugin({
                    chainId,
                    vaultAddress: typeof call.from === "string" ? call.from : "",
                });
                const methodParams = call.params
                    ? call.params.reduce((acc, param) => {
                        acc[param.name] = param.value;
                        return acc;
                    }, {})
                    : {};
                initPlugin.input.set({
                    to: call.to,
                    methodParams,
                });
                approvals = initPlugin.getRequiredApprovals();
            }
        }
        if (approvals.length > 0 && typeof call.from === "string") {
            const manageValue = (value) => {
                if (helpers_1.InstanceOf.Variable(value) || !value) {
                    return "";
                }
                return value;
            };
            const requiredApprovalsWithFrom = approvals
                .map((approval) => {
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
                                spender: manageValue(approval.params[0]),
                                amount: approval.params[1],
                            },
                        };
                    }
                    else if (approval.protocol === "ERC721") {
                        return {
                            ...data,
                            protocol: approval.protocol,
                            params: {
                                spender: manageValue(approval.params[0]),
                                tokenId: approval.params[1],
                            },
                        };
                    }
                }
                if (approval.method === "setApprovalForAll" &&
                    (approval.protocol === "ERC721" || approval.protocol === "ERC1155")) {
                    return {
                        protocol: approval.protocol,
                        token: manageValue(approval.to),
                        method: approval.method,
                        params: {
                            spender: manageValue(approval.params[0]), // Who is going to spend
                            approved: approval.params[1] === "true",
                            ids: approval.params[2],
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
                            delegatee: manageValue(approval.params[0]), // Who is going to spend
                            amount: approval.params[1],
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
                const isGoingToGetApproved = FCT.callsAsObjects.some((fctCall, i) => {
                    if (i >= callIndex)
                        return false; // If the call is after the current call, we don't need to check
                    const { to, method, from } = fctCall;
                    if (typeof to !== "string" || typeof from !== "string")
                        return false; // If the call doesn't have a to or from, we don't need to check
                    // Check if there is the same call inside FCT and BEFORE this call. If there is, we don't need to approve again
                    return (to.toLowerCase() === approval.token.toLowerCase() &&
                        method === approval.method &&
                        from.toLowerCase() === approval.from.toLowerCase());
                });
                if (isGoingToGetApproved)
                    return false;
                const caller = getAddress(call.from);
                // If the protocol is AAVE, we check if the caller is the spender and the approver
                if (approval.protocol === "AAVE") {
                    const whoIsApproving = getAddress(approval.from);
                    const whoIsSpending = getAddress(approval.params.delegatee);
                    // If the caller is the spender and the approver - no need to approve
                    return !(caller === whoIsSpending && caller === whoIsApproving);
                }
                // If the protocol is ERC721 and the call method is safeTransferFrom or transferFrom
                if (approval.protocol === "ERC721" &&
                    (call.method === "safeTransferFrom" || call.method === "transferFrom")) {
                    const whoIsSending = getAddress(approval.from);
                    const whoIsSpending = getAddress(approval.params.spender);
                    // If the caller and spender is the same, no need to approve
                    return !(whoIsSending === whoIsSpending);
                }
                return true;
            });
            requiredApprovals = [...requiredApprovals, ...requiredApprovalsWithFrom];
        }
    }
    return requiredApprovals;
}
exports.getAllRequiredApprovals = getAllRequiredApprovals;
//# sourceMappingURL=getAllRequiredApprovals.js.map