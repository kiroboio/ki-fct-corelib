"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComputedVariableMessage = exports.getUsedStructTypes = exports.getTxEIP712Types = void 0;
// Create a function that checks if the param type last index of [ is greater than 0. If true - value is Param[][] else - value is Param[]
const isInstanceOfTupleArray = (value, param) => {
    return (param.customType ?? false) && param.type.lastIndexOf("[") > 0;
};
const isInstanceOfTuple = (value, param) => {
    return (param.customType ?? false) && param.type.lastIndexOf("[") === -1;
};
const getTxEIP712Types = (calls) => {
    const txTypes = {};
    const structTypes = {};
    const getTypeCount = () => Object.values(structTypes).length + 1;
    const getStructType = (param, index) => {
        const typeName = `Struct${getTypeCount()}`;
        let paramValue;
        if (isInstanceOfTupleArray(param.value, param)) {
            paramValue = param.value[0];
        }
        else if (isInstanceOfTuple(param.value, param)) {
            paramValue = param.value;
        }
        else {
            throw new Error("Invalid param value");
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
        const values = call.params
            ? call.params.map((param) => {
                if (param.customType || param.type === "tuple") {
                    const type = getStructType(param, index);
                    return { name: param.name, type };
                }
                return {
                    name: param.name,
                    type: param.type,
                };
            })
            : [];
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
