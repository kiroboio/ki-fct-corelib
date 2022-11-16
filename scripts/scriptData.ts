import * as dotenv from "dotenv";

dotenv.config();

const data = {
  1: {
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    rpcUrl: process.env.RPC_URL_MAINNET as string,
  },
  5: {
    FCT_BatchMultiSig: "0xCcA37A30bF97909E76084cFf7B81869A4E9EBA53",
    FCT_Controller: "0xBc0349c383bCa324c965bA854EBc90A6aDe510E9",
    USDC: "0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557",
    KIRO: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
    PureValidator: "0xe46858eC0Aa402C9Ef70Aa597a085BCC2b25c1bF",
    PureSafeMath: "0x507D6c8C965A3802580520bB8310674172F1523A",
    Actuator: "0x4FA06BDF8c3e39e9278289d849fA7D0869D3AbE2",
    RecoveryWallet: "0x95dCa58d7e7b66DD8A33f1d79f4cb46B09bE0Ee4",
    RecoveryWalletCore: "0xdDFE0b8dF3cA09bABBa20e2D7D1Cdf43eFDf605f",
    RecoveryOracle: "0x64754348Aa0fb27Cce9c40214e240755bBBcb265",
    rpcUrl: "https://eth-goerli.public.blastapi.io",
  },
};

export default data;
