"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTxType = exports.getTypedDataDomain = void 0;
const validator_1 = require("./validator");
// Get typehash from typedData
// export const getTypeHash = (
//   typedData: TypedMessage<Record<"EIP712Domain" & string, MessageTypeProperty[]>>
// ): string => {
//   const m2 = TypedDataUtils.hashType(typedData.primaryType, typedData.types);
//   return utils.hexZeroPad(utils.hexlify(m2), 32);
// };
// Get Typed Data domain for EIP712
const getTypedDataDomain = async (factoryProxy) => {
    const chainId = await factoryProxy.CHAIN_ID();
    return {
        name: await factoryProxy.NAME(),
        version: await factoryProxy.VERSION(),
        chainId: chainId.toNumber(),
        verifyingContract: factoryProxy.address,
        salt: await factoryProxy.UID(),
    };
};
exports.getTypedDataDomain = getTypedDataDomain;
const generateTxType = (item) => {
    const defaults = [{ name: "details", type: "Transaction_" }];
    if (item.params) {
        if (item.validator) {
            return [{ name: "details", type: "Transaction_" }, ...(0, validator_1.getValidatorFunctionData)(item.validator, item.params)];
        }
        const types = item.params.reduce((acc, param) => {
            return [...acc, { name: param.name, type: param.type }];
        }, []);
        return [...defaults, ...types];
    }
    return [{ name: "details", type: "Transaction_" }];
};
exports.generateTxType = generateTxType;
