"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTxType = exports.getTypedDataDomain = void 0;
// const getSaltBuffer = (salt: string) => new Uint8Array(Buffer.from(salt.slice(2), "hex"));
// TODO: Change salt to be a buffer
const TYPED_DATA_DOMAIN = {
    "1": {
        name: "FCT Controller",
        version: "1",
        chainId: 1,
        verifyingContract: "0x087550a787B2720AAC06351065afC1F413D82572",
        // salt: getSaltBuffer("0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572"),
        salt: "0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572",
    },
    "5": {
        name: "FCT Controller",
        version: "1",
        chainId: 5,
        verifyingContract: "0x087550a787B2720AAC06351065afC1F413D82572",
        // salt: getSaltBuffer("0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572"),
        salt: "0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572",
    },
};
const getTypedDataDomain = (chainId) => {
    return TYPED_DATA_DOMAIN[chainId];
};
exports.getTypedDataDomain = getTypedDataDomain;
const generateTxType = (item) => {
    const defaults = [{ name: "details", type: "Transaction_" }];
    if (item.params) {
        const types = item.params.reduce((acc, param) => {
            return [...acc, { name: param.name, type: param.type }];
        }, []);
        return [...defaults, ...types];
    }
    return [{ name: "details", type: "Transaction_" }];
};
exports.generateTxType = generateTxType;
