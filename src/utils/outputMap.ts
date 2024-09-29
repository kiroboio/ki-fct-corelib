interface ABIParam {
  type: string;
  name: string;
  components?: ABIParam[];
}

function getArray(type: string) {
  const matches = type.match(/^(.*)\[(\d+)?\]$/);

  return matches
    ? // Return `null` if the array is dynamic.
      [matches[2] ? Number(matches[2]) : null, matches[1]]
    : undefined;
}

function prepareParam(param: ABIParam) {
  const isArray = getArray(param.type);
  if (isArray) {
    const [length] = isArray;
    if (!param.components) {
      throw Error("Should not happen");
    }

    const components = param.components.map((p) => ({ ...p, name: `${param.name}.${p.name}` }));

    const dynamic = length === null;
    let data: string[];
    if (dynamic) {
      data = encodeAsArray(components);
    } else {
      data = components
        .map(prepareParam)
        .map((p) => p.data)
        .flat();
    }
    return {
      dynamic,
      data: data,
    };
  }

  if (param.type === "address") {
    return {
      dynamic: false,
      data: [`VALUE: Address (${param.name})`],
    };
  }
  if (param.type === "bool") {
    return {
      dynamic: false,
      data: [`VALUE: Bool (${param.name})`],
    };
  }
  if (param.type.startsWith("uint") || param.type.startsWith("int")) {
    return {
      dynamic: false,
      data: [`VALUE: Number (${param.name})`],
    };
  }
  if (param.type === "bytes") {
    if (!param.components) {
      throw Error("Should not happen");
    }
    const components = param.components.map((p) => ({ ...p, name: `${param.name}.${p.name}` }));
    const data = ["Offset of " + param.name, "Length of " + param.name, ...encodeAsArray(components)];

    return {
      dynamic: true,
      data: data,
    };
  }

  return {
    dynamic: false,
    data: [],
  };
}

function encodeAsArray(params: ABIParam[]) {
  const staticData: string[] = [];
  const dynamicData: string[] = [];
  for (const param of params) {
    const { dynamic, data } = prepareParam(param);
    if (dynamic) {
      staticData.push("Offset of " + param.name);
      dynamicData.push("Length of " + param.name);
      dynamicData.push(...data);
    } else {
      staticData.push(...data);
    }
  }
  return [...staticData, ...dynamicData];
}

export function getOutputMap(params: ABIParam[]) {
  const data = encodeAsArray(params);

  // We want to return a map of the output values and the index of the output value
  const outputMap: { [key: string]: number } = {};
  for (let i = 0; i < data.length; i++) {
    // If output data doesnt have a VALUE: prefix, we skip it
    if (!data[i].startsWith("VALUE: ")) {
      continue;
    }
    outputMap[data[i]] = i;
  }
  return outputMap;
}
