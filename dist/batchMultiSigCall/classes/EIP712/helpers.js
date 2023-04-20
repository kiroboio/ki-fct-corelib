"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParams = void 0;
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
