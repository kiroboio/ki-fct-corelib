"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObject = exports.deepMerge = void 0;
function deepMerge(target, ...sources) {
    const output = Object.assign({}, target || {});
    sources.forEach((source) => {
        if (isObject(source)) {
            Object.keys(source).forEach((key) => {
                if (isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = isObject(output[key]) ? deepMerge(target[key], source[key]) : source[key];
                }
                else {
                    // If the value is undefined, it will be ignored
                    if (source[key] !== undefined) {
                        Object.assign(output, { [key]: source[key] });
                    }
                }
            });
        }
    });
    return output;
}
exports.deepMerge = deepMerge;
function isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
}
exports.isObject = isObject;
//# sourceMappingURL=deepMerge.js.map