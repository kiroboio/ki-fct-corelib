"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRequiredApprovals = void 0;
const ki_eth_fct_provider_ts_1 = require("@kirobo/ki-eth-fct-provider-ts");
const helpers_1 = require("batchMultiSigCall/helpers");
const helpers_2 = require("helpers");
const constants_1 = require("../../constants");
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
            signature: (0, helpers_1.handleFunctionSignature)(call),
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
                    if ((0, helpers_2.instanceOfVariable)(value) || !value) {
                        return "";
                    }
                    if (value === constants_1.FCT_VAULT_ADDRESS && typeof call.from === "string") {
                        return call.from;
                    }
                    return value;
                };
                const requiredApprovalsWithFrom = approvals
                    .filter((approval) => {
                    return Object.values(approval).every((value) => typeof value !== "undefined");
                })
                    .map((approval) => {
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
exports.getAllRequiredApprovals = getAllRequiredApprovals;
