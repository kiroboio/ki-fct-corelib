export function deepMerge(target: any, ...sources: any[]) {
  const output = Object.assign({}, target || {});
  sources.forEach((source) => {
    if (isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (isObject(source[key])) {
          if (!(key in target)) Object.assign(output, { [key]: source[key] });
          else output[key] = deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
  });
  return output;
}

export function isObject(item: any) {
  return item && typeof item === "object" && !Array.isArray(item);
}
