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
    Actuator: "0x1332e1A702DaC73523708F95827E6b706DAE5fD9",
    flashbots: "https://relay.flashbots.net",
    activator: "0x1332e1A702DaC73523708F95827E6b706DAE5fD9",
  },
  10: {
    KIRO: "0xa82a423671379fD93f78eA4A37ABA73C019C6D3C",
    FCT_BatchMultiSig: "0xCeEf951d0A3756A97c35df068C43aD5D7c11bf23",
    FCT_Controller: "0x574F4cDAB7ec20E3A37BDE025260F0A2359503d6",
    Actuator: "0x9872fC91F45Aed06F967C27DF270fB4f671C3D78",
    rpcUrl: "https://optimism.drpc.org",
    // Tokens
    USDC: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
  },
  8453: {
    KIRO: "0xba232b47a7dDFCCc221916cf08Da03a4973D3A1D",
    FCT_BatchMultiSig: "0x4171ef9EB2CF074ECaA058Bd8e0F109C0ad4C6d1",
    FCT_Controller: "0xE8572102FA6AE172df00634d5262E56ee283C134",
    Actuator: "0x633e1Fc62084A2b98639147bAec75169dEcfe234",
    rpcUrl: "https://base-rpc.publicnode.com",
    // Tokens
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  42161: {
    rpcUrl: process.env.RPC_URL_ARB || "https://rpc.ankr.com/arbitrum",
    Actuator: "0x4171ef9EB2CF074ECaA058Bd8e0F109C0ad4C6d1",
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
