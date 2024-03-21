"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSimpleParams = exports.getParamsFromTypedData = exports.getParamsFromInputs = exports.getParams = exports.manageValue = exports.variableStarts = void 0;
const ethers_1 = require("ethers");
const ParamType = ethers_1.ethers.utils.ParamType;
exports.variableStarts = ["0xfb0", "0xfa0", "0xfc00000", "0xfd00000", "0xfdb000", "0xfe000"];
const manageValue = (value) => {
    if (ethers_1.BigNumber.isBigNumber(value)) {
        const hexString = value.toHexString().toLowerCase();
        if (exports.variableStarts.some((v) => hexString.startsWith(v))) {
            value = hexString;
        }
        return value.toString();
    }
    if (typeof value === "number") {
        return value.toString();
    }
    return value;
};
exports.manageValue = manageValue;
const getParams = (params) => {
    return {
        ...params.reduce((acc, param) => {
            let value;
            if (param.customType || param.type.includes("tuple")) {
                if (param.type.lastIndexOf("[") > 0) {
                    const valueArray = param.value;
                    value = valueArray.map((item) => (0, exports.getParams)(item));
                }
                else {
                    const valueArray = param.value;
                    value = (0, exports.getParams)(valueArray);
                }
            }
            else {
                value = param.value;
            }
            return {
                ...acc,
                [param.name]: value,
            };
        }, {}),
    };
};
exports.getParams = getParams;
const getParamsFromInputs = (inputs, values) => {
    return inputs.map((input, i) => {
        if (input.type === "tuple") {
            return {
                name: input.name,
                type: input.type,
                customType: true,
                value: (0, exports.getParamsFromInputs)(input.components, values[i]),
            };
        }
        if (input.type === "tuple[]") {
            return {
                name: input.name,
                type: input.type,
                customType: true,
                value: values[i].map((tuple) => (0, exports.getParamsFromInputs)(input.components, tuple)),
            };
        }
        let value = values[i];
        // Check if value isn't a variable
        value = (0, exports.manageValue)(value);
        return {
            name: input.name,
            type: input.type,
            value,
        };
    });
};
exports.getParamsFromInputs = getParamsFromInputs;
const getParamsFromTypedData = ({ coreParamTypes, parameters, types, primaryType, }) => {
    const generateTypedDataTypes = (types, primaryType) => {
        let type = types[primaryType];
        // If the type[0] name is call and type is Call, then slice the first element
        if (type[0].name === "call" && type[0].type === "Call") {
            type = type.slice(1);
        }
        const params = [];
        for (const { name, type: paramType } of type) {
            // Remove [] from the end of the type
            const typeWithoutArray = paramType.replace(/\[\]$/, "");
            if (types[typeWithoutArray]) {
                const components = generateTypedDataTypes(types, typeWithoutArray);
                params.push(ParamType.from({ name, type: typeWithoutArray, components }));
            }
            else {
                params.push(ParamType.from({ name, type: paramType }));
            }
        }
        return params;
    };
    const getParams = (typedDataTypes, coreParamTypes, parameters) => {
        return typedDataTypes.map((typedDataInput, i) => {
            const coreInput = coreParamTypes[i];
            if (typedDataInput.baseType === "tuple") {
                return {
                    name: typedDataInput.name,
                    type: typedDataInput.type,
                    customType: true,
                    value: getParams(typedDataInput.components, coreInput.components, parameters[typedDataInput.name]),
                };
            }
            if (typedDataInput.baseType === "tuple[]") {
                return {
                    name: typedDataInput.name,
                    type: typedDataInput.type,
                    customType: true,
                    value: parameters[typedDataInput.name].map((tuple) => getParams(typedDataInput.components, coreInput.components, tuple)),
                };
            }
            let value = parameters[typedDataInput.name];
            // Check if value isn't a variable
            value = (0, exports.manageValue)(value);
            return {
                name: typedDataInput.name,
                type: coreInput.type,
                customType: false,
                messageType: typedDataInput.type,
                value,
            };
        });
    };
    return getParams(generateTypedDataTypes(types, primaryType), coreParamTypes, parameters);
};
exports.getParamsFromTypedData = getParamsFromTypedData;
const getAllSimpleParams = (params) => {
    return params.reduce((acc, param) => {
        if (param.customType || param.type.lastIndexOf("[") > 0) {
            if (param.type.lastIndexOf("[") > 0) {
                const valueArray = param.value;
                const data = valueArray.map((item) => (0, exports.getAllSimpleParams)(item)).flat();
                return [...acc, ...data];
            }
            else {
                const valueArray = param.value;
                return [...acc, ...(0, exports.getAllSimpleParams)(valueArray)];
            }
        }
        else {
            return [...acc, param.value];
        }
    }, []);
};
exports.getAllSimpleParams = getAllSimpleParams;
//# sourceMappingURL=params.js.map