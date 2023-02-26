interface Computed {
  value: string;
  add: string;
  sub: string;
  pow: string;
  mul: string;
  div: string;
  mod: string;
}

const add = (comp: Computed) => ({
  add: (add: string) => ({ comp: { ...comp, add }, ...sub({ ...comp, add }) }),
  ...sub(comp),
});
const sub = (comp: Computed) => ({
  sub: (sub: string) => ({ comp: { ...comp, sub }, ...pow({ ...comp, sub }) }),
  ...pow(comp),
});
const pow = (comp: Computed) => ({
  pow: (pow: string) => ({ comp: { ...comp, pow }, ...mul({ ...comp, pow }) }),
  ...mul(comp),
});
const mul = (comp: Computed) => ({
  mul: (mul: string) => ({ comp: { ...comp, mul }, ...div({ ...comp, mul }) }),
  ...div(comp),
});
const div = (comp: Computed) => ({
  div: (div: string) => ({ comp: { ...comp, div }, ...mod({ ...comp, div }) }),
  ...mod(comp),
});
const mod = (comp: Computed) => ({
  mod: (mod: string) => ({ comp: { ...comp, mod }, ...res({ ...comp, mod }) }),
  ...res(comp),
});

const res = (comp: Computed) => ({
  toJSON: () => JSON.stringify(comp),
  toValue: () => {
    let res =
      ((BigInt(comp.value) + BigInt(comp.add) - BigInt(comp.sub)) ** BigInt(comp.pow) * BigInt(comp.mul)) /
      BigInt(comp.div);
    if (BigInt(comp.mod) > 0) {
      res %= BigInt(comp.mod);
    }
    return res.toString();
  },
});

export const comp = (value: string) => {
  const comp: Computed = {
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
