import { utils } from "ethers";

export const getVariablesAsBytes32 = (variables: string[]) => {
  return variables.map((v) => {
    if (isNaN(Number(v)) || utils.isAddress(v)) {
      return `0x${String(v).replace("0x", "").padStart(64, "0")}`;
    }

    return `0x${Number(v).toString(16).padStart(64, "0")}`;
  });
};
