export const getGroupId = (group: number): string => group.toString(16).padStart(6, "0");
export const getNonce = (nonce: number): string => nonce.toString(16).padStart(10, "0");
export const getAfterTimestamp = (epochDate: number): string => epochDate.toString(16).padStart(10, "0");
export const getBeforeTimestamp = (infinity: boolean, epochDate?: number): string =>
  infinity ? "ffffffffff" : epochDate.toString(16).padStart(10, "0");
export const getMaxGas = (maxGas: number): string => maxGas.toString(16).padStart(8, "0");
export const getMaxGasPrice = (gasPrice: number): string => gasPrice.toString(16).padStart(16, "0");

export const getFlags = () => {
  // Function that helps to replace letter at X position
  // dasd.substring(0, 3) + "k" + dasd.substring(3 + 1)
  return;
};

export const manageCallFlags = (flags) => {
  const array = ["0", "x", "0", "0"];
  if (flags.onFailContinue && flags.onFailStop) {
    throw new Error("Both flags onFailContinue and onFailStop can't be enabled at once");
  }
  if (flags.onSuccessRevert && flags.onSuccessStop) {
    throw new Error("Both flags onSuccessRevert and onSuccessStop can't be enabled at once");
  }
  array[2] = flags.onSuccessRevert ? "2" : flags.onSuccessRevert ? "1" : "0";
  array[3] = flags.onFailContinue ? "2" : flags.onFailStop ? "1" : "0";

  return array.join("");
};
