"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchMultiSigCall = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const ki_eth_fct_provider_ts_1 = require("@kirobo/ki-eth-fct-provider-ts");
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const FCT_Controller_abi_json_1 = __importDefault(require("../abi/FCT_Controller.abi.json"));
const FCT_BatchMultiSigCall_abi_json_1 = __importDefault(require("../abi/FCT_BatchMultiSigCall.abi.json"));
const variables_1 = require("../variables");
const helpers_1 = require("../helpers");
const helpers_2 = require("../helpers");
const helpers_3 = require("./helpers");
const constants_1 = require("../constants");
class BatchMultiSigCall {
    constructor({ provider, contractAddress, options, chainId, }) {
        this.batchMultiSigSelector = "0x07eefcb4";
        this.calls = [];
        this.options = {
            maxGasPrice: "100000000000",
            validFrom: (0, helpers_2.getDate)(),
            expiresAt: (0, helpers_2.getDate)(7),
            purgeable: false,
            blockable: true,
            builder: "0x0000000000000000000000000000000000000000",
        };
        // Helpers
        this.getCalldataForActuator = ({ signedFCT, purgedFCT, investor, activator, version, }) => {
            return this.FCT_BatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
                `0x${version}`.padEnd(66, "0"),
                signedFCT,
                purgedFCT,
                investor,
                activator,
            ]);
        };
        this.getAllRequiredApprovals = async () => {
            let requiredApprovals = [];
            if (!this.provider) {
                throw new Error("No provider set");
            }
            const chainId = (this.chainId || (await this.provider.getNetwork()).chainId.toString());
            for (const call of this.calls) {
                if (typeof call.to !== "string") {
                    continue;
                }
                const pluginData = (0, ki_eth_fct_provider_ts_1.getPlugin)({
                    signature: (0, helpers_3.handleFunctionSignature)(call),
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
                            .map((approval) => ({
                            ...approval,
                            from: call.from,
                        }));
                        requiredApprovals = requiredApprovals.concat(requiredApprovalsWithFrom);
                    }
                }
            }
            const multiCallContract = new ethers_1.ethers.Contract(constants_1.multicallContracts[chainId], [
                "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
            ], this.provider);
            const calls = requiredApprovals.map((approval) => {
                return {
                    target: approval.to,
                    callData: new ethers_1.ethers.utils.Interface([
                        "function allowance(address owner, address spender) view returns (uint256)",
                    ]).encodeFunctionData("allowance", [approval.from, approval.spender]),
                };
            });
            const [, returnData] = await multiCallContract.callStatic.aggregate(calls);
            const approvals = returnData.map((data, index) => {
                const decoded = ethers_1.utils.defaultAbiCoder.decode(["uint256"], data);
                return {
                    token: requiredApprovals[index].to,
                    spender: requiredApprovals[index].spender,
                    requiredAmount: requiredApprovals[index].amount,
                    currentAmount: decoded[0].toString(),
                    from: requiredApprovals[index].from,
                };
            });
            return approvals;
        };
        // End of options
        //
        //
        // Plugin functions
        this.getPlugin = async (index) => {
            let chainId;
            if (this.chainId) {
                chainId = this.chainId.toString();
            }
            else {
                const data = await this.provider.getNetwork();
                chainId = data.chainId.toString();
            }
            const call = this.getCall(index);
            if ((0, helpers_1.instanceOfVariable)(call.to)) {
                throw new Error("To value cannot be a variable");
            }
            const pluginData = (0, ki_eth_fct_provider_ts_1.getPlugin)({
                signature: (0, helpers_3.handleFunctionSignature)(call),
                address: call.to,
                chainId: chainId,
            });
            const pluginClass = pluginData.plugin;
            const plugin = new pluginClass({
                chainId: chainId.toString(),
            });
            plugin.input.set({
                to: call.to,
                methodParams: call.params.reduce((acc, param) => {
                    return { ...acc, [param.name]: param.value };
                }, {}),
            });
            return plugin;
        };
        this.getPluginClass = async (index) => {
            const { chainId } = await this.provider.getNetwork();
            const call = this.getCall(index);
            if ((0, helpers_1.instanceOfVariable)(call.to)) {
                throw new Error("To value cannot be a variable");
            }
            const pluginData = (0, ki_eth_fct_provider_ts_1.getPlugin)({
                signature: (0, helpers_3.handleFunctionSignature)(call),
                address: call.to,
                chainId: chainId.toString(),
            });
            return pluginData;
        };
        this.handleTo = (call) => {
            // If call is a validator method, return validator address as to address
            if (call.validator) {
                return call.validator.validatorAddress;
            }
            if (typeof call.to === "string") {
                return call.to;
            }
            // Else it is a variable
            return this.getVariable(call.to, "address");
        };
        this.handleValue = (call) => {
            // If value isn't provided => 0
            if (!call.value) {
                return "0";
            }
            // Check if value is a number
            if (typeof call.value === "string") {
                return call.value;
            }
            // Else it is a variable
            return this.getVariable(call.value, "uint256");
        };
        this.FCT_Controller = new ethers_1.ethers.Contract(contractAddress || "0x0000000000000000000000000000000000000000", FCT_Controller_abi_json_1.default, provider);
        if (chainId) {
            this.chainId = chainId;
        }
        this.FCT_BatchMultiSigCall = new ethers_1.ethers.utils.Interface(FCT_BatchMultiSigCall_abi_json_1.default);
        this.provider = provider;
        if (options) {
            this.setOptions(options);
        }
    }
    // Variables
    getVariable(variable, type) {
        if (variable.type === "external") {
            return this.getExternalVariable(variable.id, type);
        }
        if (variable.type === "output") {
            const id = variable.id;
            const indexForNode = this.calls.findIndex((call) => call.nodeId === id.nodeId);
            return this.getOutputVariable(indexForNode, id.innerIndex, type);
        }
        if (variable.type === "global") {
            const globalVariable = variables_1.globalVariables[variable.id];
            if (!globalVariable) {
                throw new Error("Global variable not found");
            }
            return globalVariable;
        }
    }
    getOutputVariable(index, innerIndex, type) {
        const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
        let base;
        let innerIndexHex;
        innerIndex = innerIndex ?? 0;
        if (innerIndex < 0) {
            innerIndexHex = ((innerIndex + 1) * -1).toString(16).padStart(4, "0");
            if (type.includes("bytes")) {
                base = constants_1.FDBackBaseBytes;
            }
            else {
                base = constants_1.FDBackBase;
            }
        }
        if (innerIndex >= 0) {
            innerIndexHex = innerIndex.toString(16).padStart(4, "0");
            if (type.includes("bytes")) {
                base = constants_1.FDBaseBytes;
            }
            else {
                base = constants_1.FDBase;
            }
        }
        return (innerIndexHex + outputIndexHex).padStart(base.length, base);
    }
    getExternalVariable(index, type) {
        const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
        if (type.includes("bytes")) {
            return outputIndexHex.padStart(constants_1.FCBaseBytes.length, constants_1.FCBaseBytes);
        }
        return outputIndexHex.padStart(constants_1.FCBase.length, constants_1.FCBase);
    }
    // End of variables
    //
    //
    // Options
    setOptions(options) {
        if (options.maxGasPrice !== undefined && options.maxGasPrice === "0") {
            throw new Error("Max gas price cannot be 0 or less");
        }
        if (options.expiresAt !== undefined) {
            const now = Number(new Date().getTime() / 1000).toFixed();
            if (options.expiresAt <= now) {
                throw new Error("Expires at must be in the future");
            }
        }
        if (options.builder !== undefined && !ethers_1.ethers.utils.isAddress(options.builder)) {
            throw new Error("Builder must be a valid address");
        }
        this.options = { ...this.options, ...options };
        return this.options;
    }
    // End of plugin functions
    //
    //
    // FCT Functions
    async create(callInput) {
        let call;
        if ("plugin" in callInput) {
            const pluginCall = await callInput.plugin.create();
            if (pluginCall === undefined) {
                throw new Error("Error creating call with plugin");
            }
            call = {
                ...pluginCall,
                from: callInput.from,
                options: callInput.options,
                nodeId: callInput.nodeId,
            };
        }
        else {
            if (!callInput.to) {
                throw new Error("To address is required");
            }
            call = { ...callInput };
        }
        if (call.nodeId) {
            const index = this.calls.findIndex((call) => call.nodeId === callInput.nodeId);
            if (index > 0) {
                throw new Error("Node id already exists, please use different id");
            }
        }
        this.calls.push(call);
        return this.calls;
    }
    async createMultiple(calls) {
        for (const call of calls) {
            await this.create(call);
        }
        return this.calls;
    }
    getCall(index) {
        return this.calls[index];
    }
    get length() {
        return this.calls.length;
    }
    async exportFCT() {
        if (this.calls.length === 0) {
            throw new Error("No calls added");
        }
        if (this.options.builder) {
            ethers_1.utils.isAddress(this.options.builder);
        }
        const salt = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
        const version = "0x010101";
        const typedData = await this.createTypedData(salt, version);
        const sessionId = (0, helpers_3.getSessionId)(salt, this.options);
        const mcall = this.calls.map((call, index) => {
            const usedTypeStructs = (0, helpers_3.getUsedStructTypes)(typedData, `transaction${index + 1}`);
            return {
                typeHash: ethers_1.ethers.utils.hexlify(eth_sig_util_1.TypedDataUtils.hashType(`transaction${index + 1}`, typedData.types)),
                ensHash: (0, helpers_3.handleEnsHash)(call),
                functionSignature: (0, helpers_3.handleFunctionSignature)(call),
                value: this.handleValue(call),
                callId: (0, helpers_3.manageCallId)(this.calls, call, index),
                from: typeof call.from === "string" ? call.from : this.getVariable(call.from, "address"),
                to: this.handleTo(call),
                data: (0, helpers_3.handleData)(call),
                types: (0, helpers_3.handleTypes)(call),
                typedHashes: usedTypeStructs.length > 0
                    ? usedTypeStructs.map((hash) => ethers_1.ethers.utils.hexlify(eth_sig_util_1.TypedDataUtils.hashType(hash, typedData.types)))
                    : [],
            };
        });
        return {
            typedData,
            builder: this.options.builder || "0x0000000000000000000000000000000000000000",
            typeHash: ethers_1.ethers.utils.hexlify(eth_sig_util_1.TypedDataUtils.hashType(typedData.primaryType, typedData.types)),
            sessionId,
            nameHash: (0, utils_1.id)(this.options.name || ""),
            mcall,
            variables: [],
            externalSigners: [],
        };
    }
    importFCT(fct) {
        // Here we import FCT and add all the data inside BatchMultiSigCall
        const options = (0, helpers_3.parseSessionID)(fct.sessionId, fct.builder);
        this.setOptions(options);
        const typedData = fct.typedData;
        for (const [index, call] of fct.mcall.entries()) {
            const dataTypes = typedData.types[`transaction${index + 1}`].slice(1);
            const { call: meta } = typedData.message[`transaction_${index + 1}`];
            const decodedParams = new utils_1.AbiCoder().decode(dataTypes.map((type) => `${type.type} ${type.name}`), call.data);
            const params = dataTypes.map((t) => ({
                name: t.name,
                type: t.type,
                value: ethers_1.BigNumber.isBigNumber(decodedParams[t.name]) ? decodedParams[t.name].toString() : decodedParams[t.name],
            }));
            const getFlow = () => {
                const flow = Object.entries(constants_1.flows).find(([, value]) => {
                    return value.text === meta.flow_control.toString();
                });
                return constants_1.Flow[flow[0]];
            };
            const callInput = {
                nodeId: `node${index + 1}`,
                to: call.to,
                from: call.from,
                value: call.value,
                method: meta.method_interface.split("(")[0],
                params,
                toENS: meta.to_ens,
                viewOnly: meta.view_only,
                options: {
                    gasLimit: meta.gas_limit,
                    jumpOnSuccess: meta.jump_on_success === 0 ? "" : `node${index + meta.jump_on_success}`,
                    jumpOnFail: meta.jump_on_fail === 0 ? "" : `node${index + meta.jump_on_fail}`,
                    flow: getFlow(),
                },
            };
            this.create(callInput);
        }
        return this.calls;
    }
    async importEncodedFCT(calldata) {
        const ABI = FCT_BatchMultiSigCall_abi_json_1.default;
        const iface = new ethers_1.ethers.utils.Interface(ABI);
        let chainId;
        if (this.chainId) {
            chainId = this.chainId.toString();
        }
        else {
            const data = await this.provider.getNetwork();
            chainId = data.chainId.toString();
        }
        const decoded = iface.decodeFunctionData("batchMultiSigCall", calldata);
        const arrayKeys = ["signatures", "mcall"];
        const objectKeys = ["tr"];
        const getFCT = (obj) => {
            return Object.entries(obj).reduce((acc, [key, value]) => {
                if (!isNaN(parseFloat(key))) {
                    return acc;
                }
                if (arrayKeys.includes(key)) {
                    return {
                        ...acc,
                        [key]: value.map((sign) => getFCT(sign)),
                    };
                }
                if (objectKeys.includes(key)) {
                    return {
                        ...acc,
                        [key]: getFCT(value),
                    };
                }
                if (key === "callId" || key === "sessionId") {
                    return {
                        ...acc,
                        [key]: "0x" + value.toHexString().slice(2).padStart(64, "0"),
                    };
                }
                if (key === "types") {
                    return {
                        ...acc,
                        [key]: value.map((type) => type.toString()),
                    };
                }
                return {
                    ...acc,
                    [key]: ethers_1.BigNumber.isBigNumber(value) ? value.toHexString() : value,
                };
            }, {});
        };
        const decodedFCT = getFCT(decoded);
        const FCTOptions = (0, helpers_3.parseSessionID)(decodedFCT.tr.sessionId, decodedFCT.tr.builder);
        this.setOptions(FCTOptions);
        for (const [index, call] of decodedFCT.tr.mcall.entries()) {
            try {
                const pluginData = (0, ki_eth_fct_provider_ts_1.getPlugin)({
                    address: call.to,
                    chainId,
                    signature: call.functionSignature,
                });
                const plugin = new pluginData.plugin({
                    chainId,
                });
                const params = plugin.methodParams;
                const decodedParams = params.length > 0
                    ? new utils_1.AbiCoder().decode(params.map((type) => `${type.type} ${type.name}`), call.data)
                    : [];
                plugin.input.set({
                    to: call.to,
                    value: parseInt(call.value, 16).toString(),
                    methodParams: params.reduce((acc, param) => {
                        const getValue = (value) => {
                            const variables = ["0xfb0", "0xfa0", "0xfc00000", "0xfd00000", "0xfdb000"];
                            if (ethers_1.BigNumber.isBigNumber(value)) {
                                const hexString = value.toHexString();
                                if (variables.some((v) => hexString.startsWith(v))) {
                                    return hexString;
                                }
                                return value.toString();
                            }
                            return value;
                        };
                        const value = getValue(decodedParams[param.name]);
                        return { ...acc, [param.name]: value };
                    }, {}),
                });
                const { options } = (0, helpers_3.parseCallID)(call.callId);
                const callInput = {
                    nodeId: `node${index + 1}`,
                    plugin,
                    from: call.from,
                    options,
                };
                await this.create(callInput);
            }
            catch (e) {
                if (e.message !== "Multiple plugins found for the same signature, can't determine which one to use") {
                    throw new Error(`Plugin error for call at index ${index} - ${e.message}`);
                }
                throw new Error(`Plugin not found for call at index ${index}`);
            }
        }
        return this.calls;
    }
    // End of main FCT functions
    //
    //
    // Helpers functions
    async createTypedData(salt, version) {
        // Creates messages from multiCalls array for EIP712 sign
        const typedDataMessage = this.calls.reduce((acc, call, index) => {
            // Update params if variables (FC) or references (FD) are used
            let paramsData = {};
            if (call.params) {
                this.verifyParams(call.params);
                paramsData = this.getParamsFromCall(call);
            }
            const options = call.options || {};
            const gasLimit = options.gasLimit ?? 0;
            const flow = options.flow ? constants_1.flows[options.flow].text : "continue on success, revert on fail";
            let jumpOnSuccess = 0;
            let jumpOnFail = 0;
            if (options.jumpOnSuccess) {
                const jumpOnSuccessIndex = this.calls.findIndex((c) => c.nodeId === options.jumpOnSuccess);
                if (jumpOnSuccessIndex === -1) {
                    throw new Error(`Jump on success node id ${options.jumpOnSuccess} not found`);
                }
                if (jumpOnSuccessIndex <= index) {
                    throw new Error(`Jump on success node id ${options.jumpOnSuccess} is current or before current node (${call.nodeId})`);
                }
                jumpOnSuccess = jumpOnSuccessIndex - index - 1;
            }
            if (options.jumpOnFail) {
                const jumpOnFailIndex = this.calls.findIndex((c) => c.nodeId === options.jumpOnFail);
                if (jumpOnFailIndex === -1) {
                    throw new Error(`Jump on fail node id ${options.jumpOnFail} not found`);
                }
                if (jumpOnFailIndex <= index) {
                    throw new Error(`Jump on fail node id ${options.jumpOnFail} is current or before current node (${call.nodeId})`);
                }
                jumpOnFail = jumpOnFailIndex - index - 1;
            }
            return {
                ...acc,
                [`transaction_${index + 1}`]: {
                    call: {
                        call_index: index + 1,
                        payer_index: index + 1,
                        from: typeof call.from === "string" ? call.from : this.getVariable(call.from, "address"),
                        to: this.handleTo(call),
                        to_ens: call.toENS || "",
                        eth_value: this.handleValue(call),
                        gas_limit: gasLimit,
                        view_only: call.viewOnly || false,
                        permissions: 0,
                        flow_control: flow,
                        returned_false_means_fail: options.falseMeansFail || false,
                        jump_on_success: jumpOnSuccess,
                        jump_on_fail: jumpOnFail,
                        method_interface: (0, helpers_3.handleMethodInterface)(call),
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
        const { structTypes, txTypes } = (0, helpers_3.getTxEIP712Types)(this.calls);
        const typedData = {
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
                Call: [
                    { name: "call_index", type: "uint16" },
                    { name: "payer_index", type: "uint16" },
                    { name: "from", type: "address" },
                    { name: "to", type: "address" },
                    { name: "to_ens", type: "string" },
                    { name: "eth_value", type: "uint256" },
                    { name: "gas_limit", type: "uint32" },
                    { name: "view_only", type: "bool" },
                    { name: "permissions", type: "uint16" },
                    { name: "flow_control", type: "string" },
                    { name: "returned_false_means_fail", type: "bool" },
                    { name: "jump_on_success", type: "uint16" },
                    { name: "jump_on_fail", type: "uint16" },
                    { name: "method_interface", type: "string" },
                ],
            },
            primaryType: "BatchMultiSigCall",
            domain: await (0, helpers_1.getTypedDataDomain)(this.FCT_Controller),
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
                ...typedDataMessage,
            },
        };
        return typedData;
    }
    getParamsFromCall(call) {
        // If call has parameters
        if (call.params) {
            // If mcall is a validation call
            if (call.validator) {
                Object.entries(call.validator.params).forEach(([key, value]) => {
                    if (typeof value !== "string") {
                        call.validator.params[key] = this.getVariable(value, "uint256");
                    }
                });
                return (0, helpers_1.createValidatorTxData)(call);
            }
            const getParams = (params) => {
                return {
                    ...params.reduce((acc, param) => {
                        let value;
                        // If parameter is a custom type (struct)
                        if (param.customType || param.type.includes("tuple")) {
                            // If parameter is an array of custom types
                            if (param.type.lastIndexOf("[") > 0) {
                                const valueArray = param.value;
                                value = valueArray.map((item) => getParams(item));
                            }
                            else {
                                // If parameter is a custom type
                                const valueArray = param.value;
                                value = getParams(valueArray);
                            }
                        }
                        else {
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
    verifyParams(params) {
        params.forEach((param) => {
            // If parameter is a variable
            if ((0, helpers_1.instanceOfVariable)(param.value)) {
                param.value = this.getVariable(param.value, param.type);
            }
            if (param.customType || param.type.includes("tuple")) {
                if (param.type.lastIndexOf("[") > 0) {
                    for (const parameter of param.value) {
                        this.verifyParams(parameter);
                    }
                }
                else {
                    this.verifyParams(param.value);
                }
            }
        });
    }
}
exports.BatchMultiSigCall = BatchMultiSigCall;
