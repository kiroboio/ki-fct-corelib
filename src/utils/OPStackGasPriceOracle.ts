// TODO: Need to create a function that returns

import { ethers } from "ethers";
import OPStackGasOracleABI from "../abi/OPGasPriceOracle.abi.json";

const OP_GAS_PRICE_ORACLE = "0x420000000000000000000000000000000000000F" as const;

const IOPGasPriceOracle = new ethers.utils.Interface(OPStackGasOracleABI);

interface OPStackGasOracleRequest {
  provider?: ethers.providers.Provider;
  rpcUrl?: string;
  gasPriceOracle?: string;
}

interface OPStackGasOracleData {
  baseFeeScalar: bigint;
  l1BaseFee: bigint;
  blobBaseFeeScalar: bigint;
  blobBaseFee: bigint;
}

type EthBigNumber = ethers.BigNumber;

export async function getGasOracleData({
  provider,
  rpcUrl,
  gasPriceOracle = OP_GAS_PRICE_ORACLE,
}: OPStackGasOracleRequest): Promise<OPStackGasOracleData> {
  let _provider: ethers.providers.Provider;
  if (!provider) {
    if (!rpcUrl) {
      throw new Error("No provider or RPC url is provided");
    }
    _provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  } else {
    _provider = provider;
  }

  const GasOracle = new ethers.Contract(gasPriceOracle, IOPGasPriceOracle, _provider);

  const [baseFeeScalar, l1BaseFee, blobBaseFeeScalar, blobBaseFee] = await Promise.all<
    [number, EthBigNumber, number, EthBigNumber]
  >([GasOracle.baseFeeScalar(), GasOracle.l1BaseFee(), GasOracle.blobBaseFeeScalar(), GasOracle.blobBaseFee()]);

  return {
    baseFeeScalar: BigInt(baseFeeScalar),
    l1BaseFee: l1BaseFee.toBigInt(),
    blobBaseFeeScalar: BigInt(blobBaseFeeScalar),
    blobBaseFee: blobBaseFee.toBigInt(),
  };
}
