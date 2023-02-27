"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EIP712StructTypes = void 0;
// Create a function that checks if the param type last index of [ is greater than 0. If true - value is Param[][] else - value is Param[]
const isInstanceOfTupleArray = (value, param) => {
    return (param.customType ?? false) && param.type.lastIndexOf("[") > 0;
};
const isInstanceOfTuple = (value, param) => {
    return (param.customType ?? false) && param.type.lastIndexOf("[") === -1;
};
class EIP712StructTypes {
    constructor(calls) {
        this.transactionTypes = {};
        this.structTypes = {};
        this.getTypeCount = () => Object.values(this.structTypes).length + 1;
        this.getStructType = (param, index) => {
            const typeName = `Struct${this.getTypeCount()}`;
            let paramValue;
            if (isInstanceOfTupleArray(param.value, param)) {
                paramValue = param.value[0];
            }
            else if (isInstanceOfTuple(param.value, param)) {
                paramValue = param.value;
            }
            else {
                throw new Error(`Invalid param value: ${param.value} for param: ${param.name}`);
            }
            let customCount = 0;
            const eip712Type = paramValue.map((item) => {
                if (item.customType || item.type.includes("tuple")) {
                    ++customCount;
                    const innerTypeName = `Struct${this.getTypeCount() + customCount}`;
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
            this.structTypes[typeName] = eip712Type;
            if (param.type.lastIndexOf("[") > 0) {
                for (const parameter of param.value[0]) {
                    if (parameter.customType || parameter.type.includes("tuple")) {
                        this.getStructType(parameter, index);
                    }
                }
            }
            else {
                for (const parameter of param.value) {
                    if (parameter.customType || parameter.type.includes("tuple")) {
                        this.getStructType(parameter, index);
                    }
                }
            }
            return typeName;
        };
        calls.forEach((call, index) => {
            const values = call.params
                ? call.params.map((param) => {
                    if (param.customType || param.type === "tuple") {
                        const type = this.getStructType(param, index);
                        return { name: param.name, type: param.type.lastIndexOf("[") > 0 ? `${type}[]` : type };
                    }
                    return {
                        name: param.name,
                        type: param.type,
                    };
                })
                : [];
            this.transactionTypes[`transaction${index + 1}`] = [{ name: "call", type: "Call" }, ...values];
        });
    }
}
exports.EIP712StructTypes = EIP712StructTypes;
