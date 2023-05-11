async function main() {
  const pluginsData = getPluginsFromABI({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    abi: ABI,
    protocol: "curve",
    chainId: "1",
    contractAddress: "0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7", // DAI/USDC/USDT pool
  });

  // Find a plugin with name "calc_token_amount"
  const calcTokenAmountData = pluginsData.plugins.find((plugin) => plugin.name === "calc_token_amount");

  if (!calcTokenAmountData) {
    throw new Error("Plugin not found");
  }

  const CalcTokenAmount = new calcTokenAmountData.plugin({
    chainId: "1",
  });

  CalcTokenAmount.input.set({});
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
