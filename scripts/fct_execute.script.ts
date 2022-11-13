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
    FCT_BatchMultiSig: "0x181a2cE3c36086FBa461c45b3ed699507a085eDB",
    FCT_Controller: "0x11990Fa73a472f78e6B7aFd0416AcC9899bA3f11",
    USDC: "0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557",
    KIRO: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
    PureValidator: "0xD8d95c30874DfBD9981272c5d0F0729BA523D475",
    PureSafeMath: "0x598a1d820a17c597429BB6Ff7BC8AB906Bb31419",
    Actuator: "0xf839E99C7d8E28AE787B1d478565f51fE0e99Ba2",
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
    activator: "0xe911180acde75bfbacfc8bbfd484768b6aa3bd30",
    investor: ZERO_ADDRESS,
    purgedFCT: bytes,
  });

  console.log("Got Calldata");

  const txData = await utils.transactionValidator({
    rpcUrl: data[chainId].rpcUrl,
    callData: calldata,
    actuatorPrivateKey: "1ebb74678c5b06bba2e15d588bc50ebfb4eed652ed93e1b93c8d33cc2c7aff6f",
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
