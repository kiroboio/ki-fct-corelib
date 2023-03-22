// 0x95f9f186cbff60cecdecef460c442b82d938973becca0015d1376596daa6b574

import { ethers } from "ethers";

export const getExecutedPath = async ({
  //   chainId,
  rpcUrl,
  txHash,
}: {
  //   chainId: string | number;
  rpcUrl: string;
  txHash: string;
}) => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  // Get the tx receipt
  const txReceipt = await provider.getTransactionReceipt(txHash);

  console.log("txReceipt", txReceipt);
};
