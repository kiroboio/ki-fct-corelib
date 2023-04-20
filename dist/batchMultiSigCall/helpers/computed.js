"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComputedVariableMessage = exports.comp = void 0;
const add = (comp) => ({
    add: (add) => ({ comp: { ...comp, add }, ...sub({ ...comp, add }) }),
    ...sub(comp),
});
const sub = (comp) => ({
    sub: (sub) => ({ comp: { ...comp, sub }, ...pow({ ...comp, sub }) }),
    ...pow(comp),
});
const pow = (comp) => ({
    pow: (pow) => ({ comp: { ...comp, pow }, ...mul({ ...comp, pow }) }),
    ...mul(comp),
});
const mul = (comp) => ({
    mul: (mul) => ({ comp: { ...comp, mul }, ...div({ ...comp, mul }) }),
    ...div(comp),
});
const div = (comp) => ({
    div: (div) => ({ comp: { ...comp, div }, ...mod({ ...comp, div }) }),
    ...mod(comp),
});
const mod = (comp) => ({
    mod: (mod) => ({ comp: { ...comp, mod }, ...res({ ...comp, mod }) }),
    ...res(comp),
});
const res = (comp) => ({
    toJSON: () => JSON.stringify(comp),
    toValue: () => {
        let res = ((BigInt(comp.value) + BigInt(comp.add) - BigInt(comp.sub)) ** BigInt(comp.pow) * BigInt(comp.mul)) /
            BigInt(comp.div);
        if (BigInt(comp.mod) > 0) {
            res %= BigInt(comp.mod);
        }
        return res.toString();
    },
});
const comp = (value) => {
    const comp = {
        value,
        add: "0",
        sub: "0",
        mul: "1",
        pow: "1",
        div: "1",
        mod: "0",
    };
    return {
        comp,
        ...add(comp),
    };
};
exports.comp = comp;
const getComputedVariableMessage = (computedVariables) => {
    return computedVariables.reduce((acc, item, i) => {
        return {
            ...acc,
            [`computed_${i + 1}`]: item,
        };
    }, {});
};
exports.getComputedVariableMessage = getComputedVariableMessage;
