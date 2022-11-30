import * as dotenv from "dotenv";

dotenv.config();

const data = {
  1: {
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    rpcUrl: process.env.RPC_URL_MAINNET as string,
  },
  5: {
    FCT_BatchMultiSig: "0x5b97307aa2CeE069A3999e9FD1236D0C5693322D",
    FCT_Controller: "0xBc0ED9A150D9b50BaA2dC3d350D0d59E69daeBD9",
    USDC: "0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557",
    KIRO: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
    PureValidator: "0x57Acb5935ea72F8CC0ff5dB3Ef8d386D1D709FDd",
    PureSafeMath: "0xc1993306041109671475d6B8ECFd3B78Eb603996",
    Actuator: "0x8106e63cf691Bc9f84be70D938143B04D642D06B",
    RecoveryWallet: "0x38e5Bec4f5401AF5C35990BED8D4153113EDa743",
    RecoveryWalletCore: "0xD2FA1cbd47ff29F462342a5d6f445aCDA852FD6A",
    RecoveryOracle: "0x9034f5225C76B09750c0dA9Ef5B4BBaf0d455A1C",
    rpcUrl: "https://eth-goerli.public.blastapi.io",
  },
};

export default data;
