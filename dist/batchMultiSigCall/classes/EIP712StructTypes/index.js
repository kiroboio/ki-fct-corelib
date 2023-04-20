"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EIP712StructTypes = void 0;
const helpers = __importStar(require("./helpers"));
class EIP712StructTypes {
    constructor(calls) {
        this.transactionTypes = {};
        this.structTypes = {};
        this.getTypeCount = () => Object.values(this.structTypes).length + 1;
        this.getStructType = (param, index) => {
            const typeName = `Struct${this.getTypeCount()}`;
            let paramValue;
            if (helpers.isInstanceOfTupleArray(param.value, param)) {
                paramValue = param.value[0];
            }
            else if (helpers.isInstanceOfTuple(param.value, param)) {
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
EIP712StructTypes.helpers = helpers;
