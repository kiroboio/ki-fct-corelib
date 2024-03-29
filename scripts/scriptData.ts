import * as dotenv from "dotenv";

dotenv.config();

export const scriptData = {
  1: {
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    KIRO: "0xB1191F691A355b43542Bea9B8847bc73e7Abb137",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    rpcUrl: process.env.RPC_URL_MAINNET as string,
    FCT_BatchMultiSig: "0x74fe4729c31002c817a2c57cbe67fa37e62cf2f0",
    FCT_Controller: "0x0A0ea58E6504aA7bfFf6F3d069Bd175AbAb638ee",
    PureValidator: "0x9AeF40a815bEF44c41fb018749CfE7adBd1E2EDd", // Not updated
    PureSafeMath: "0x48F969e8c73A55cfC709bd4be8a90343CC02B9e5", // Not up
    Actuator: "0x78b3e89ec2F4D4f1689332059E488835E05045DD",
    // RecoveryWallet: "0x38e5Bec4f5401AF5C35990BED8D4153113EDa743",
    // RecoveryWalletCore: "0xD2FA1cbd47ff29F462342a5d6f445aCDA852FD6A",
    // RecoveryOracle: "0x9034f5225C76B09750c0dA9Ef5B4BBaf0d455A1C",
    flashbots: "https://relay.flashbots.net",
    activator: "0x1332e1A702DaC73523708F95827E6b706DAE5fD9",
  },
  5: {
    USDC: "0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557",
    KIRO: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
    FCT_BatchMultiSig: "0x067D176d13651c8AfF7964a4bB9dF3107F893e88",
    FCT_Controller: "0x087550a787B2720AAC06351065afC1F413D82572",
    PureValidator: "0x9AeF40a815bEF44c41fb018749CfE7adBd1E2EDd",
    PureSafeMath: "0x48F969e8c73A55cfC709bd4be8a90343CC02B9e5",
    Actuator: "0x6B271aEa169B4804D1d709B2687c17c3Cc8E2e56",
    RecoveryWallet: "0x38e5Bec4f5401AF5C35990BED8D4153113EDa743",
    RecoveryWalletCore: "0xD2FA1cbd47ff29F462342a5d6f445aCDA852FD6A",
    RecoveryOracle: "0x9034f5225C76B09750c0dA9Ef5B4BBaf0d455A1C",
    rpcUrl: "https://goerli.infura.io/v3/99229ae47ba74d21abc557bdc503a5d9",
    flashbots: "https://relay-goerli.flashbots.net",
  },
  42161: {
    rpcUrl: "https://rpc.ankr.com/arbitrum",
  },
  421613: {
    rpcUrl: "https://arb-goerli.g.alchemy.com/v2/wjZQ8R9YDxyzIa9USq-lHXDUiVjWrk2y",
  },
  11155111: {
    rpcUrl: "https://1rpc.io/sepolia",
    flashbotsRelay: "https://relay-sepolia.flashbots.net",
    flashbotsRpc: "https://rpc-sepolia.flashbots.net",
    activator: "0x3A8D62A3E8e8b9ABB663a6733bf9CD2057365f3e",
  },
};

export default scriptData;
