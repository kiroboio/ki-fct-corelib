"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComputedVariableMessage = exports.getUsedStructTypes = exports.getTxEIP712Types = void 0;
const helpers_1 = require("../../helpers");
const getTxEIP712Types = (calls) => {
    const txTypes = {};
    const structTypes = {};
    const getTypeCount = () => Object.values(structTypes).length + 1;
    const getStructType = (param, index) => {
        const typeName = `Struct${getTypeCount()}`;
        let paramValue;
        if (param.type.lastIndexOf("[") > 0) {
            paramValue = param.value[0];
        }
        else {
            paramValue = param.value;
        }
        let customCount = 0;
        const eip712Type = paramValue.map((item) => {
            if (item.customType || item.type.includes("tuple")) {
                ++customCount;
                const innerTypeName = `Struct${getTypeCount() + customCount}`;
                return {
                    name: item.name,
                    type: innerTypeName,
                };
            }
            return {
                name: item.name,
                type: item.type,
            };
        });
        structTypes[typeName] = eip712Type;
        if (param.type.lastIndexOf("[") > 0) {
            for (const parameter of param.value[0]) {
                if (parameter.customType || parameter.type.includes("tuple")) {
                    getStructType(parameter, index);
                }
            }
        }
        else {
            for (const parameter of param.value) {
                if (parameter.customType || parameter.type.includes("tuple")) {
                    getStructType(parameter, index);
                }
            }
        }
        return typeName;
    };
    calls.forEach((call, index) => {
        if (call.validator) {
            txTypes[`transaction${index + 1}`] = [
                { name: "call", type: "Call" },
                ...(0, helpers_1.getValidatorFunctionData)(call.validator, call.params),
            ];
            return;
        }
        // If call consists of a single custom type, then do not create a struct type
        if (call.params.length === 1 && call.params[0].customType) {
            const params = call.params[0].value;
            // const allNativeTypes = params.every((param) => {
            //   const { type } = param;
            //   const nativeTypes = ["address", "uint", "int", "bytes32", "bool"];
            //   return nativeTypes.some((nativeType) => type.startsWith(nativeType));
            // });
            // if (allNativeTypes) {
            //   const values = params.map((param) => {
            //     return {
            //       name: param.name,
            //       type: param.type,
            //     };
            //   });
            //   txTypes[`transaction${index + 1}`] = [{ name: "call", type: "Call" }, ...values];
            //   return;
            // }
            const values = params.map((param) => {
                return {
                    name: param.name,
                    type: param.type,
                };
            });
            txTypes[`transaction${index + 1}`] = [{ name: "call", type: "Call" }, ...values];
            return;
        }
        const values = call.params.map((param) => {
            if (param.customType || param.type === "tuple") {
                const type = getStructType(param, index);
                return { name: param.name, type };
            }
            return {
                name: param.name,
                type: param.type,
            };
        });
        txTypes[`transaction${index + 1}`] = [{ name: "call", type: "Call" }, ...values];
    });
    return {
        txTypes,
        structTypes,
    };
};
exports.getTxEIP712Types = getTxEIP712Types;
const getUsedStructTypes = (typedData, typeName) => {
    const mainType = typedData.types[typeName];
    const usedStructTypes = mainType.reduce((acc, item) => {
        if (item.type.includes("Struct")) {
            return [...acc, item.type, ...(0, exports.getUsedStructTypes)(typedData, item.type)];
        }
        return acc;
    }, []);
    return usedStructTypes;
};
exports.getUsedStructTypes = getUsedStructTypes;
const getComputedVariableMessage = (computedVariables) => {
    return computedVariables.reduce((acc, item, i) => {
        return {
            ...acc,
            [`computed_${i + 1}`]: {
                index: (i + 1).toString(),
                var: item.variable,
                add: item.add,
                sub: item.sub,
                mul: item.mul,
                div: item.div,
            },
        };
    }, {});
};
exports.getComputedVariableMessage = getComputedVariableMessage;
