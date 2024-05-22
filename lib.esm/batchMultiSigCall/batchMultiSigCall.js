import { deepMerge } from "../helpers/deepMerge";
import { FCTCache } from "./cache";
import { EIP712, FCTUtils, Options, Validation, Variables } from "./classes";
import { DEFAULT_CALL_OPTIONS } from "./constants";
import { addAtIndex, create, createMultiple, createPlugin, exportEfficientFCT, exportFCT, exportMap, exportNotificationFCT, exportWithApprovals, exportWithPayment, getCall, getCallByNodeId, getIndexByNodeId, getPlugin, getPluginClass, getPluginData, importFCT, importFCTWithMap, } from "./methods";
import * as utils from "./utils";
export class BatchMultiSigCall {
    batchMultiSigSelector = "0x7d971612";
    version = "0x020201";
    chainId;
    domain;
    randomId = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    // Utils
    utils;
    variables;
    validation;
    _options;
    _calls = [];
    _callDefault = {
        value: "0",
        options: DEFAULT_CALL_OPTIONS,
    };
    constructor(input = {}) {
        this.utils = new FCTUtils(this);
        this.variables = new Variables(this);
        this.validation = new Validation(this);
        this._options = new Options();
        if (input.chainId) {
            if (typeof input.chainId === "number") {
                this.chainId = input.chainId.toString();
            }
            else {
                this.chainId = input.chainId;
            }
        }
        else {
            this.chainId = "1";
        }
        if (input.domain) {
            this.domain = input.domain;
        }
        else {
            const domain = EIP712.getTypedDataDomain(this.chainId);
            if (!domain)
                throw new Error(`ChainId ${this.chainId} is not supported. Please provide a custom EIP712 domain.`);
            this.domain = domain;
        }
        if (input.version)
            this.version = input.version;
        if (input.options)
            this.setOptions(input.options);
        if (input.defaults)
            this.setCallDefaults(input.defaults);
    }
    // Getters
    get options() {
        return this._options.get();
    }
    get calls() {
        return this._calls;
    }
    get callsAsObjects() {
        return this._calls.map((call) => call.get());
    }
    get decodedCalls() {
        return this._calls.map((call) => call.getDecoded());
    }
    get callDefault() {
        return this._callDefault;
    }
    get computed() {
        return this.variables.computed;
    }
    get computedAsData() {
        return this.variables.computedAsData;
    }
    get validations() {
        return this.validation.get();
    }
    // Setters
    /**
     * Set the options for the FCT.
     */
    setOptions(options) {
        return this._options.set(options);
    }
    setCallDefaults(callDefault) {
        this._callDefault = deepMerge(this._callDefault, callDefault);
        return this._callDefault;
    }
    changeChainId = (chainId) => {
        this.chainId = chainId;
        const domain = EIP712.getTypedDataDomain(this.chainId);
        if (!domain)
            throw new Error(`ChainId ${this.chainId} is not supported. Please provide a custom EIP712 domain.`);
        this.domain = domain;
    };
    // Variables
    addComputed = (computed) => {
        return this.variables.addComputed(computed);
    };
    addValidation = (validation) => {
        return this.validation.add(validation);
    };
    // Plugin functions
    getPlugin = getPlugin;
    getPluginClass = getPluginClass;
    getPluginData = getPluginData;
    createPlugin = createPlugin;
    // Add calls to FCT
    /**
     * This function adds a new Call instance and adds it to the _calls array.
     * If the input is already a Call instance, it is directly added to the _calls array.
     * Otherwise, a new Call instance is created from the input and then added to the _calls array.
     *
     * @param {FCTInputCall} call - The input call to create a Call instance from.
     * @returns {Promise<Call>} The created Call instance.
     */
    add = create;
    /**
     * This function adds multiple new Call instances and adds them to the _calls array.
     * If the input is already a Call instance, it is directly added to the _calls array.
     * Otherwise, a new Call instance is created from the input and then added to the _calls array.
     *
     * @param {FCTInputCall[]} calls - The input calls to create Call instances from.
     * @returns {Promise<Call[]>} The created Call instances.
     */
    addMultiple = createMultiple;
    // * @deprecated Please use `add` instead.
    /**
     * This function adds a new Call instance and adds it to the _calls array.
     * If the input is already a Call instance, it is directly added to the _calls array.
     * Otherwise, a new Call instance is created from the input and then added to the _calls array.
     *
     * @param {FCTInputCall} call - The input call to create a Call instance from.
     * @returns {Promise<Call>} The created Call instance.
     */
    create = create;
    //  * @deprecated Please use `addMultiple` instead.
    /**
     * This function adds multiple new Call instances and adds them to the _calls array.
     * If the input is already a Call instance, it is directly added to the _calls array.
     * Otherwise, a new Call instance is created from the input and then added to the _calls array.
     *
     * @param {FCTInputCall[]} calls - The input calls to create Call instances from.
     * @returns {Promise<Call[]>} The created Call instances.
     */
    createMultiple = createMultiple;
    // Specific to BatchMultiSigCall
    addAtIndex = addAtIndex;
    // Export FCT
    export = exportFCT;
    exportFCT = exportFCT;
    exportNotification = exportNotificationFCT;
    exportNotificationFCT = exportNotificationFCT;
    exportWithApprovals = exportWithApprovals;
    exportWithPayment = exportWithPayment;
    // Export minimal FCT
    exportEfficientFCT = exportEfficientFCT;
    // Export mapping
    exportMap = exportMap;
    // Import FCT
    importFCT = importFCT;
    importFCTWithMap = importFCTWithMap;
    // FCT Call getters
    getCall = getCall;
    getCallByNodeId = getCallByNodeId;
    getIndexByNodeId = getIndexByNodeId;
    _setOptionsWithoutValidation(options) {
        return this._options.set(options, false);
    }
    // Static functions
    static utils = utils;
    static from = (input, messageHash) => {
        if (messageHash && messageHash.length === 66) {
            const cached = FCTCache.get(messageHash.toLowerCase());
            if (cached)
                return cached;
        }
        const FCT = new BatchMultiSigCall();
        FCT.importFCT(input);
        if (messageHash && messageHash.length === 66)
            FCTCache.set(messageHash.toLowerCase(), FCT);
        return FCT;
    };
    static fromMap = (input, map, messageHash) => {
        if (messageHash && messageHash.length === 66) {
            const cached = FCTCache.get(`map:${messageHash}`.toLowerCase());
            if (cached)
                return cached;
        }
        const FCT = new BatchMultiSigCall();
        FCT.importFCTWithMap(input, map);
        if (messageHash && messageHash.length === 66)
            FCTCache.set(`map:${messageHash}`.toLowerCase(), FCT);
        return FCT;
    };
    static getTransacitonTrace = async ({ fct, map, txHash, tenderlyRpcUrl, }) => {
        const FCT = BatchMultiSigCall.fromMap(fct, map);
        return await FCT.utils.getTransactionTrace({ txHash, tenderlyRpcUrl });
    };
}
//# sourceMappingURL=batchMultiSigCall.js.map