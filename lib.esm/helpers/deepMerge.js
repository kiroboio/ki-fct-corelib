export function deepMerge(target, ...sources) {
    const output = { ...target };
    sources.forEach((source) => {
        if (isObject(source)) {
            Object.keys(source).forEach((key) => {
                mergeProperty(output, target, source, key);
            });
        }
    });
    return output;
}
function mergeProperty(output, target, source, key) {
    if (isObject(source[key])) {
        if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
        }
        else {
            output[key] = isObject(output[key]) ? deepMerge(target[key], source[key]) : source[key];
        }
    }
    else if (source[key] !== undefined) {
        // If the value is undefined, it will be ignored
        Object.assign(output, { [key]: source[key] });
    }
}
export function isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
}
//# sourceMappingURL=deepMerge.js.map