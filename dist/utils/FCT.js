"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFCTPaths = exports.getVariablesAsBytes32 = exports.validateFCT = exports.getFCTMessageHash = exports.recoverAddressFromEIP712 = void 0;
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const ethers_1 = require("ethers");
const graphlib_1 = require("graphlib");
const helpers_1 = require("../batchMultiSigCall/helpers");
function isFCTKeyType(keyInput) {
    return [
        "typeHash",
        "typedData",
        "sessionId",
        "nameHash",
        "mcall",
        "builder",
        "variables",
        "externalSigners",
        "computed",
    ].includes(keyInput);
}
const recoverAddressFromEIP712 = (typedData, signature) => {
    try {
        const signatureString = ethers_1.utils.joinSignature(signature);
        const address = (0, eth_sig_util_1.recoverTypedSignature)({
            data: typedData,
            version: eth_sig_util_1.SignTypedDataVersion.V4,
            signature: signatureString,
        });
        return address;
    }
    catch (e) {
        return null;
    }
};
exports.recoverAddressFromEIP712 = recoverAddressFromEIP712;
const getFCTMessageHash = (typedData) => {
    return ethers_1.ethers.utils.hexlify(eth_sig_util_1.TypedDataUtils.eip712Hash(typedData, eth_sig_util_1.SignTypedDataVersion.V4));
};
exports.getFCTMessageHash = getFCTMessageHash;
const validateFCT = (FCT, softValidation = false) => {
    const keys = Object.keys(FCT);
    if (!keys.every(isFCTKeyType)) {
        throw new Error(`FCT has invalid keys`);
    }
    const limits = FCT.typedData.message.limits;
    const fctData = FCT.typedData.message.meta;
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
    return {
        getOptions: () => {
            const parsedSessionID = (0, helpers_1.parseSessionID)(FCT.sessionId, fctData.builder);
            return {
                valid_from: parsedSessionID.validFrom,
                expires_at: parsedSessionID.expiresAt,
                gas_price_limit: parsedSessionID.maxGasPrice,
                blockable: parsedSessionID.blockable,
                purgeable: parsedSessionID.purgeable,
                builder: parsedSessionID.builder,
                recurrency: parsedSessionID.recurrency,
                multisig: parsedSessionID.multisig,
            };
        },
        getFCTMessageHash: () => (0, exports.getFCTMessageHash)(FCT.typedData),
        getSigners: () => {
            return FCT.mcall.reduce((acc, { from }) => {
                if (!acc.includes(from)) {
                    acc.push(from);
                }
                return acc;
            }, []);
        },
    };
};
exports.validateFCT = validateFCT;
const getVariablesAsBytes32 = (variables) => {
    return variables.map((v) => {
        if (isNaN(Number(v)) || ethers_1.utils.isAddress(v)) {
            return `0x${String(v).replace("0x", "").padStart(64, "0")}`;
        }
        return `0x${Number(v).toString(16).padStart(64, "0")}`;
    });
};
exports.getVariablesAsBytes32 = getVariablesAsBytes32;
const getAllFCTPaths = (fct) => {
    const g = new graphlib_1.Graph({ directed: true });
    fct.mcall.forEach((_, index) => {
        g.setNode(index.toString());
    });
    for (let i = 0; i < fct.mcall.length - 1; i++) {
        const callID = (0, helpers_1.parseCallID)(fct.mcall[i].callId, true);
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
    const end = (fct.mcall.length - 1).toString();
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
};
exports.getAllFCTPaths = getAllFCTPaths;
