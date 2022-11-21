import * as dotenv from "dotenv";

dotenv.config();

const data = {
  1: {
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    rpcUrl: process.env.RPC_URL_MAINNET as string,
  },
  5: {
    FCT_BatchMultiSig: "0xe5C8d6b2eF245bb76071F030D2D78bbd7ADeF019",
    FCT_Controller: "0x4dEe9936B9E90cD8851134b760054f4a0df482aE",
    USDC: "0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557",
    KIRO: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
    PureValidator: "0x1DCFEa92Aa1b127daD7dEa2ca179051Ea997c43a",
    PureSafeMath: "0x68385D3acd1009D920CCCf7Ad42D2518FC29e9c8",
    Actuator: "0xFB69f04D286151cE0139C0344a646E9f8e73E193",
    RecoveryWallet: "0x95dCa58d7e7b66DD8A33f1d79f4cb46B09bE0Ee4",
    RecoveryWalletCore: "0xdDFE0b8dF3cA09bABBa20e2D7D1Cdf43eFDf605f",
    RecoveryOracle: "0x64754348Aa0fb27Cce9c40214e240755bBBcb265",
    rpcUrl: "https://eth-goerli.public.blastapi.io",
  },
};

export default data;
