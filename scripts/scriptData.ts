import * as dotenv from "dotenv";

dotenv.config();

const data = {
  1: {
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    KIRO: "0xB1191F691A355b43542Bea9B8847bc73e7Abb137",
    rpcUrl: process.env.RPC_URL_MAINNET as string,
    FCT_BatchMultiSig: "0x5b97307aa2CeE069A3999e9FD1236D0C5693322D",
    FCT_Controller: "0xBc0ED9A150D9b50BaA2dC3d350D0d59E69daeBD9",
  },
  5: {
    FCT_BatchMultiSig: "0x241B9305dB33A92987ee34D8bE866a70F0D86311",
    FCT_Controller: "0xa36457BCa36Ac0eED36f1b25bd9144B029600982",
    USDC: "0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557",
    KIRO: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
    PureValidator: "0x9AeF40a815bEF44c41fb018749CfE7adBd1E2EDd",
    PureSafeMath: "0x48F969e8c73A55cfC709bd4be8a90343CC02B9e5",
    Actuator: "0x26E74D92CE4D3Cb06A3cC00089aD25CA38fBa4A0",
    RecoveryWallet: "0x38e5Bec4f5401AF5C35990BED8D4153113EDa743",
    RecoveryWalletCore: "0xD2FA1cbd47ff29F462342a5d6f445aCDA852FD6A",
    RecoveryOracle: "0x9034f5225C76B09750c0dA9Ef5B4BBaf0d455A1C",
    rpcUrl: "https://goerli.infura.io/v3/99229ae47ba74d21abc557bdc503a5d9",
  },
};

export default data;
