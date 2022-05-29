export const getGroupId = (group: number): string => group.toString(16).padStart(6, "0");
export const getNonce = (nonce: number): string => nonce.toString(16).padStart(10, "0");
export const getMaxGasPrice = (gasPrice: number): string => gasPrice.toString(16).padStart(16, "0");
