import * as dotenv from "dotenv";
import { BatchMultiSigCall, ethers, utils } from "../src/index";
import FCT from "../FCT_TransferERC20.json";

dotenv.config();

const chainId = 5;
const wallet = process.env.WALLET as string;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const data = {
  1: {
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
  5: {
    FCT_BatchMultiSig: "0xCcA37A30bF97909E76084cFf7B81869A4E9EBA53",
    FCT_Controller: "0xBc0349c383bCa324c965bA854EBc90A6aDe510E9",
    USDC: "0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557",
    KIRO: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
    PureValidator: "0xe46858eC0Aa402C9Ef70Aa597a085BCC2b25c1bF",
    PureSafeMath: "0x507D6c8C965A3802580520bB8310674172F1523A",
    Actuator: "0x5a59026F30Df81F482816350E50b27285D84E9c8",
    RecoveryWallet: "0x95dCa58d7e7b66DD8A33f1d79f4cb46B09bE0Ee4",
    RecoveryWalletCore: "0xdDFE0b8dF3cA09bABBa20e2D7D1Cdf43eFDf605f",
    RecoveryOracle: "0x64754348Aa0fb27Cce9c40214e240755bBBcb265",
    rpcUrl: "https://eth-goerli.public.blastapi.io",
  },
};

async function main() {
  const batchMultiSigCall = new BatchMultiSigCall({
    provider: new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl),
    contractAddress: data[chainId].FCT_Controller,
  });

  const decodeAddress = utils.recoverAddressFromEIP712(FCT.typedData, FCT.signatures[0]);

  console.log(decodeAddress);

  // Zero bytes
  const bytes = "0x0000000000000000000000000000000000000000000000000000000000000000";

  const calldata = await batchMultiSigCall.getCalldataForActuator({
    actuatorAddress: data[chainId].Actuator,
    signedFCT: FCT,
    activator: process.env.ACTIVATOR as string,
    investor: ZERO_ADDRESS,
    purgedFCT: bytes,
  });

  const txData = await utils.transactionValidator({
    rpcUrl: data[chainId].rpcUrl,
    callData: calldata,
    actuatorPrivateKey: process.env.ACTIVATOR_PRIVATE_KEY as string,
    actuatorContractAddress: data[chainId].Actuator,
    activateForFree: false,
  });

  // const txData = await utils.feeCalculator({
  //   rpcUrl: data[chainId].rpcUrl,
  //   callData: calldata,
  //   actuatorPrivateKey: "fe7d0547123be12cb66193dc2ed4b6f8aa49a4d68bbaba1a607fbbdaa695a6e5",
  //   actuatorContractAddress: data[chainId].Actuator,
  //   activateForFree: false,
  // });

  console.log(txData);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
