"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchMultiSigCall = void 0;
const tslib_1 = require("tslib");
const deepMerge_1 = require("../helpers/deepMerge");
const cache_1 = require("./cache");
const classes_1 = require("./classes");
const constants_1 = require("./constants");
const methods_1 = require("./methods");
const utils = tslib_1.__importStar(require("./utils"));
class BatchMultiSigCall {
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
        options: constants_1.DEFAULT_CALL_OPTIONS,
    };
    constructor(input = {}) {
        this.utils = new classes_1.FCTUtils(this);
        this.variables = new classes_1.Variables(this);
        this.validation = new classes_1.Validation(this);
        this._options = new classes_1.Options();
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
            const domain = classes_1.EIP712.getTypedDataDomain(this.chainId);
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
        this._callDefault = (0, deepMerge_1.deepMerge)(this._callDefault, callDefault);
        return this._callDefault;
    }
    changeChainId = (chainId) => {
        this.chainId = chainId;
        const domain = classes_1.EIP712.getTypedDataDomain(this.chainId);
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
    getPlugin = methods_1.getPlugin;
    getPluginClass = methods_1.getPluginClass;
    getPluginData = methods_1.getPluginData;
    createPlugin = methods_1.createPlugin;
    // Add calls to FCT
    /**
     * This function adds a new Call instance and adds it to the _calls array.
     * If the input is already a Call instance, it is directly added to the _calls array.
     * Otherwise, a new Call instance is created from the input and then added to the _calls array.
     *
     * @param {FCTInputCall} call - The input call to create a Call instance from.
     * @returns {Promise<Call>} The created Call instance.
     */
    add = methods_1.create;
    /**
     * This function adds multiple new Call instances and adds them to the _calls array.
     * If the input is already a Call instance, it is directly added to the _calls array.
     * Otherwise, a new Call instance is created from the input and then added to the _calls array.
     *
     * @param {FCTInputCall[]} calls - The input calls to create Call instances from.
     * @returns {Promise<Call[]>} The created Call instances.
     */
    addMultiple = methods_1.createMultiple;
    // * @deprecated Please use `add` instead.
    /**
     * This function adds a new Call instance and adds it to the _calls array.
     * If the input is already a Call instance, it is directly added to the _calls array.
     * Otherwise, a new Call instance is created from the input and then added to the _calls array.
     *
     * @param {FCTInputCall} call - The input call to create a Call instance from.
     * @returns {Promise<Call>} The created Call instance.
     */
    create = methods_1.create;
    //  * @deprecated Please use `addMultiple` instead.
    /**
     * This function adds multiple new Call instances and adds them to the _calls array.
     * If the input is already a Call instance, it is directly added to the _calls array.
     * Otherwise, a new Call instance is created from the input and then added to the _calls array.
     *
     * @param {FCTInputCall[]} calls - The input calls to create Call instances from.
     * @returns {Promise<Call[]>} The created Call instances.
     */
    createMultiple = methods_1.createMultiple;
    // Specific to BatchMultiSigCall
    addAtIndex = methods_1.addAtIndex;
    // Export FCT
    export = methods_1.exportFCT;
    exportFCT = methods_1.exportFCT;
    exportNotification = methods_1.exportNotificationFCT;
    exportNotificationFCT = methods_1.exportNotificationFCT;
    exportWithApprovals = methods_1.exportWithApprovals;
    exportWithPayment = methods_1.exportWithPayment;
    // Export minimal FCT
    exportEfficientFCT = methods_1.exportEfficientFCT;
    // Export mapping
    exportMap = methods_1.exportMap;
    // Import FCT
    importFCT = methods_1.importFCT;
    importFCTWithMap = methods_1.importFCTWithMap;
    // FCT Call getters
    getCall = methods_1.getCall;
    getCallByNodeId = methods_1.getCallByNodeId;
    getIndexByNodeId = methods_1.getIndexByNodeId;
    _setOptionsWithoutValidation(options) {
        return this._options.set(options, false);
    }
    // Static functions
    static utils = utils;
    static from = (input, messageHash) => {
        if (messageHash && messageHash.length === 66) {
            const cached = cache_1.FCT_Cache.get(messageHash.toLowerCase());
            if (cached)
                return cached;
        }
        const FCT = new BatchMultiSigCall();
        FCT.importFCT(input);
        if (messageHash && messageHash.length === 66)
            cache_1.FCT_Cache.set(messageHash.toLowerCase(), FCT);
        return FCT;
    };
    static fromMap = (input, map, messageHash) => {
        if (messageHash && messageHash.length === 66) {
            const cached = cache_1.FCT_Cache.get(`map:${messageHash}`.toLowerCase());
            if (cached)
                return cached;
        }
        const FCT = new BatchMultiSigCall();
        FCT.importFCTWithMap(input, map);
        if (messageHash && messageHash.length === 66)
            cache_1.FCT_Cache.set(`map:${messageHash}`.toLowerCase(), FCT);
        return FCT;
    };
    static getTransacitonTrace = async ({ fct, map, txHash, tenderlyRpcUrl, }) => {
        const FCT = BatchMultiSigCall.fromMap(fct, map);
        return await FCT.utils.getTransactionTrace({ txHash, tenderlyRpcUrl });
    };
}
exports.BatchMultiSigCall = BatchMultiSigCall;
//# sourceMappingURL=batchMultiSigCall.js.map