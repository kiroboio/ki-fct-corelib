import { Call } from "../../../classes";

export function getVariableArgsForCallId(call: Call) {
  const emptyVariableArgs = {
    variableArgsStart: "00000000",
    variableArgsEnd: "00000000",
  };

  const callObject = call.call;

  if (callObject.method === "solver") {
    return emptyVariableArgs;
  }

  const areVariablesUsed = call.isAnyVariableUsed();

  return {
    variableArgsStart: "00000000",
    // If variables are used, 1,000,000,000 (exact number), else 0
    variableArgsEnd: areVariablesUsed ? "3b9aca00" : "00000000",
  };
}

export function getVariableArgsForEIP712(call: Call) {
  const data = getVariableArgsForCallId(call);

  return {
    variable_arguments_start: parseInt(data.variableArgsStart, 16).toString(),
    variable_arguments_end: parseInt(data.variableArgsEnd, 16).toString(),
  };
}
