import { BatchMultiSigCall } from "../src/batchMultiSigCall";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "fs";
import { ERC20 } from "@kirobo/ki-eth-fct-provider-ts";
import { signTypedData, SignTypedDataVersion, TypedMessage } from "@metamask/eth-sig-util";
import { TypedDataTypes } from "../src/batchMultiSigCall/interfaces";

dotenv.config();
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function getDate(days: number = 0) {
  const result = new Date();
  result.setDate(result.getDate() + days);
  return Number(result.getTime() / 1000).toFixed();
}

function addHours(numOfHours: number, date = new Date()) {
  date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);

  return Number(date.getTime() / 1000).toFixed();
}

const chainId = 5;
const wallet = process.env.WALLET as string;

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
    Actuator: "0x009224863d3F3C7fDb6EDAD9092755c4027C845D",
    RecoveryWallet: "0x95dCa58d7e7b66DD8A33f1d79f4cb46B09bE0Ee4",
    RecoveryWalletCore: "0xdDFE0b8dF3cA09bABBa20e2D7D1Cdf43eFDf605f",
    RecoveryOracle: "0x64754348Aa0fb27Cce9c40214e240755bBBcb265",
    rpcUrl: "https://eth-goerli.public.blastapi.io",
  },
};

async function main() {
  const vault = process.env.VAULT as string;
  const key = process.env.PRIVATE_KEY as string;

  const batchMultiSigCall = new BatchMultiSigCall({
    provider: new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl),
    contractAddress: data[chainId].FCT_Controller,
    options: {
      builder: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
      // validFrom: addHours(0.66),
      maxGasPrice: "3000000000",
      expiresAt: getDate(10),
      // recurrency: {
      //   accumetable: true,
      //   maxRepeats: "1000",
      //   chillTime: "1",
      // },
    },
  });

  // const balanceOf = new ERC20.getters.BalanceOf({
  //   chainId: 1,
  //   initParams: {
  //     to: data[chainId].KIRO,
  //     methodParams: {
  //       owner: vault,
  //     },
  //   },
  // });

  // const greaterThan = new PureValidator.actions.GreaterThan({
  //   chainId: 1,
  //   initParams: {
  //     to: data[chainId].PureValidator,
  //     methodParams: {
  //       value1: balanceOf.output.params.balance.getOutputVariable("1"),
  //       value2: ethers.utils.parseUnits("10", 18).toString(),
  //     },
  //   },
  // });

  const transfer = new ERC20.actions.Transfer({
    chainId: 1,
    initParams: {
      to: data[chainId].KIRO,
      methodParams: {
        recipient: wallet,
        amount: ethers.utils.parseUnits("1", 18).toString(),
      },
    },
  });

  await batchMultiSigCall.createMultiple([
    // {
    //   plugin: balanceOf,
    //   from: vault,
    //   nodeId: "1",
    //   // options: {
    //   // jumpOnSuccess: "3",
    //   // jumpOnFail: "2",
    //   // },
    // },
    // {
    //   plugin: greaterThan,
    //   from: vault,
    //   nodeId: "2",
    //   options: {
    //     flow: Flow.OK_CONT_FAIL_REVERT,
    //     falseMeansFail: true,
    //   },
    // },
    { plugin: transfer, from: vault, nodeId: "3" },
  ]);

  const FCT = await batchMultiSigCall.exportFCT();

  const signature = signTypedData({
    data: FCT.typedData as unknown as TypedMessage<TypedDataTypes>,
    privateKey: Buffer.from(key, "hex"),
    version: SignTypedDataVersion.V4,
  });

  const splitSignature = ethers.utils.splitSignature(signature);

  const signedFCT = {
    ...FCT,
    signatures: [splitSignature],
    variables: [],
    // builder: ZERO_ADDRESS,
    builder: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
    externalSigners: [],
  };

  fs.writeFileSync("FCT_TransferERC20.json", JSON.stringify(signedFCT, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
