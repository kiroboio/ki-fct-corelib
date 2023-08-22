class Parameter<N extends string = string, T extends string = string> {
  readonly name: N;
  readonly type: T;

  constructor(args: { name: N; type: T }) {
    this.name = args.name;
    this.type = args.type;
  }
}

class PluginInput<P extends Parameter> {
  public readonly parameters: readonly P[] = [];
  public readonly data: Record<string, unknown> = {};

  constructor(args: { parameters: readonly P[] }) {
    this.parameters = args.parameters;
  }

  public set(key: (typeof this.parameters)[number]["name"], value: unknown): void {
    this.data[key] = value;
  }
}

const parameters = [
  new Parameter({
    name: "foo",
    type: "bar",
  }),
  new Parameter({
    name: "foo2",
    type: "bar2",
  }),
];

const pluginInput = new PluginInput({
  parameters,
});

pluginInput.set("foo", "bar");
