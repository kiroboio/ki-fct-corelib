"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRequiredApprovals = void 0;
const ki_eth_fct_provider_ts_1 = require("@kirobo/ki-eth-fct-provider-ts");
const utils_1 = require("ethers/lib/utils");
const constants_1 = require("../../constants");
const helpers_1 = require("../../helpers");
const helpers_2 = require("../helpers");
function getAllRequiredApprovals(FCT) {
    let requiredApprovals = [];
    if (!FCT.chainId) {
        throw new Error("No chainId or provider has been set");
    }
    const chainId = FCT.chainId;
    for (const call of FCT.calls) {
        if (typeof call.to !== "string") {
            continue;
        }
        const pluginData = (0, ki_eth_fct_provider_ts_1.getPlugin)({
            signature: (0, helpers_2.handleFunctionSignature)(call),
            address: call.to,
            chainId,
        });
        if (pluginData) {
            const initPlugin = new pluginData.plugin({ chainId });
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
            const approvals = initPlugin.getRequiredApprovals();
            if (approvals.length > 0 && typeof call.from === "string") {
                const manageValue = (value) => {
                    if ((0, helpers_1.instanceOfVariable)(value) || !value) {
                        return "";
                    }
                    if (value === constants_1.FCT_VAULT_ADDRESS && typeof call.from === "string") {
                        return call.from;
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
                                spender: manageValue(approval.params[0]),
                                approved: approval.params[1],
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
                                delegatee: manageValue(approval.params[0]),
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
                    const caller = (0, utils_1.getAddress)(call.from);
                    // If the protocol is AAVE, we check if the caller is the spender and the approver
                    if (approval.protocol === "AAVE") {
                        if (typeof call.from !== "string") {
                            return true;
                        }
                        const whoIsApproving = (0, utils_1.getAddress)(approval.from);
                        const whoIsSpending = (0, utils_1.getAddress)(approval.params.delegatee);
                        // If the caller is the spender and the approver - no need to approve
                        return !(caller === whoIsSpending && caller === whoIsApproving);
                    }
                    return true;
                });
                requiredApprovals = [...requiredApprovals, ...requiredApprovalsWithFrom];
            }
        }
    }
    // Reduce ERC20 approvals, so we don't have to approve the same approval multiple times
    requiredApprovals = requiredApprovals.reduce((acc, approval) => {
        if (approval.protocol !== "ERC20")
            return [...acc, approval];
        const existingApproval = acc.find((a) => a.method === approval.method &&
            a.protocol === approval.protocol &&
            a.token === approval.token &&
            a.from === approval.from &&
            a.params.spender === approval.params.spender);
        if (existingApproval && existingApproval.protocol !== "ERC20") {
            throw new Error("Should not happen");
        }
        if (existingApproval) {
            existingApproval.params.amount = (BigInt(approval.params.amount) + BigInt(existingApproval.params.amount)).toString();
        }
        else {
            acc.push(approval);
        }
        return acc;
    }, []);
    return requiredApprovals;
}
exports.getAllRequiredApprovals = getAllRequiredApprovals;
