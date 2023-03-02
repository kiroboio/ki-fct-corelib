"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCTUtils = void 0;
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const utils_1 = require("batchMultiSigCall/utils");
const ethers_1 = require("ethers");
const graphlib_1 = require("graphlib");
const lodash_1 = __importDefault(require("lodash"));
const CallID_1 = require("../CallID");
const FCTBase_1 = require("../FCTBase");
const SessionID_1 = require("../SessionID");
class FCTUtils extends FCTBase_1.FCTBase {
    constructor(FCT) {
        super(FCT);
    }
    get FCTData() {
        return this.FCT.exportFCT();
    }
    getCalldataForActuator({ signatures, purgedFCT, investor, activator, }) {
        return (0, utils_1.getCalldataForActuator)({
            signedFCT: lodash_1.default.merge({}, this.FCTData, { signatures }),
            purgedFCT,
            investor,
            activator,
            version: this.FCT.version.slice(2),
        });
    }
    getAuthenticatorSignature() {
        return (0, utils_1.getAuthenticatorSignature)(this.FCT._eip712.getTypedData());
    }
    recoverAddress(signature) {
        try {
            const signatureString = ethers_1.utils.joinSignature(signature);
            return (0, eth_sig_util_1.recoverTypedSignature)({
                data: this.FCTData.typedData,
                version: eth_sig_util_1.SignTypedDataVersion.V4,
                signature: signatureString,
            });
        }
        catch (e) {
            return null;
        }
    }
    getOptions() {
        const parsedSessionID = SessionID_1.SessionID.asOptions({
            builder: this.FCTData.builder,
            sessionId: this.FCTData.sessionId,
            name: "",
        });
        return {
            valid_from: parsedSessionID.validFrom,
            expires_at: parsedSessionID.expiresAt,
            gas_price_limit: parsedSessionID.maxGasPrice,
            blockable: parsedSessionID.blockable,
            purgeable: parsedSessionID.purgeable,
            builder: parsedSessionID.builder,
            recurrency: parsedSessionID.recurrency,
            multisig: parsedSessionID.multisig,
            authEnabled: parsedSessionID.authEnabled,
        };
    }
    getMessageHash() {
        return ethers_1.ethers.utils.hexlify(eth_sig_util_1.TypedDataUtils.eip712Hash(this.FCTData.typedData, eth_sig_util_1.SignTypedDataVersion.V4));
    }
    isValid(softValidation = false) {
        const keys = Object.keys(this.FCTData);
        this.validateFCTKeys(keys);
        const limits = this.FCTData.typedData.message.limits;
        const fctData = this.FCTData.typedData.message.meta;
        const currentDate = new Date().getTime() / 1000;
        const validFrom = parseInt(limits.valid_from);
        const expiresAt = parseInt(limits.expires_at);
        const gasPriceLimit = limits.gas_price_limit;
        if (!softValidation && validFrom > currentDate) {
            throw new Error(`FCT is not valid yet. FCT is valid from ${validFrom}`);
        }
        if (expiresAt < currentDate) {
            throw new Error(`FCT has expired. FCT expired at ${expiresAt}`);
        }
        if (gasPriceLimit === "0") {
            throw new Error(`FCT gas price limit cannot be 0`);
        }
        if (!fctData.eip712) {
            throw new Error(`FCT must be type EIP712`);
        }
        return true;
    }
    getSigners() {
        return this.FCTData.mcall.reduce((acc, { from }) => {
            if (!acc.includes(from)) {
                acc.push(from);
            }
            return acc;
        }, []);
    }
    getAllPaths() {
        const FCT = this.FCTData;
        const g = new graphlib_1.Graph({ directed: true });
        FCT.mcall.forEach((_, index) => {
            g.setNode(index.toString());
        });
        for (let i = 0; i < FCT.mcall.length - 1; i++) {
            //   const callID = parseCallID(fct.mcall[i].callId, true);
            const callID = CallID_1.CallID.parseWithNumbers(FCT.mcall[i].callId);
            const jumpOnSuccess = callID.options.jumpOnSuccess;
            const jumpOnFail = callID.options.jumpOnFail;
            if (jumpOnSuccess === jumpOnFail) {
                g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
            }
            else {
                g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
                g.setEdge(i.toString(), (i + 1 + Number(jumpOnFail)).toString());
            }
        }
        const allPaths = [];
        const isVisited = {};
        const pathList = [];
        const start = "0";
        const end = (FCT.mcall.length - 1).toString();
        pathList.push(start);
        const printAllPathsUtil = (g, start, end, isVisited, localPathList) => {
            if (start === end) {
                const path = localPathList.slice();
                allPaths.push(path);
                return;
            }
            isVisited[start] = true;
            let successors = g.successors(start);
            if (successors === undefined) {
                successors = [];
            }
            for (const id of successors) {
                if (!isVisited[id]) {
                    // store current node
                    // in path[]
                    localPathList.push(id);
                    printAllPathsUtil(g, id, end, isVisited, localPathList);
                    // remove current node
                    // in path[]
                    localPathList.splice(localPathList.indexOf(id), 1);
                }
            }
            isVisited[start] = false;
        };
        printAllPathsUtil(g, start, end, isVisited, pathList);
        return allPaths;
    }
    validateFCTKeys(keys) {
        const validKeys = [
            "typeHash",
            "typedData",
            "sessionId",
            "nameHash",
            "mcall",
            "builder",
            "variables",
            "externalSigners",
            "computed",
            "signatures",
        ];
        validKeys.forEach((key) => {
            if (!keys.includes(key)) {
                throw new Error(`FCT missing key ${key}`);
            }
        });
    }
}
exports.FCTUtils = FCTUtils;
