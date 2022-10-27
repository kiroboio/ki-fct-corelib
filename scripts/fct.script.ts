import { BatchMultiSigCall } from "../src/batchMultiSigCall";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "fs";
import { ERC20, PureValidator } from "@kirobo/ki-eth-fct-provider-ts";
import { Flow } from "../src/constants";
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
const wallet = "0x62e3A53A947D34C4DdCD67B49fAdc30b643e2586";

const data = {
  1: {
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
  5: {
    FCT_BatchMultiSig: "0x146787DB1cA71dd4000dF2B3a7F6835f5F860Fd6",
    FCT_Controller: "0x4543Ef757d245A45118EafBD13e8df9cD56Db4c2",
    USDC: "0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557",
    KIRO: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
    PureValidator: "0x1716898d72BE098F4828B435a3918cBFda562Efc",
    PureSafeMath: "0x850c7E3eBf05d0A617DAe4beE14A4A5C03CAb9da",
    Actuator: "0x04540d48AB0817e65679788507cc1AECf1d20C6a",
    RecoveryWallet: "0x55A75186a5D54Ec9918d5b979F458ffb1Fdaa365",
    RecoveryWalletCore: "0x7aD7C72b34b5Fa67eE9737537E8ecF0e5a5750Cc",
    RecoveryOracle: "0xCa292B5770FDD9d2D6A89334A93346584AE5af14",
    rpcUrl: "https://eth-goerli.public.blastapi.io",
  },
};

async function main() {
  const batchMultiSigCall = new BatchMultiSigCall({
    provider: new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl),
    contractAddress: data[chainId].FCT_Controller,
    options: {
      // validFrom: addHours(0.66),
      expiresAt: getDate(10),
      recurrency: {
        accumetable: true,
        maxRepeats: "1000",
        chillTime: "1",
      },
    },
  });

  const vault = process.env.VAULT as string;
  const key = process.env.PRIVATE_KEY as string;

  const balanceOf = new ERC20.getters.BalanceOf({
    chainId: 1,
    initParams: {
      to: data[chainId].KIRO,
      methodParams: {
        owner: vault,
      },
    },
  });

  const greaterThan = new PureValidator.actions.GreaterThan({
    chainId: 1,
    initParams: {
      to: data[chainId].PureValidator,
      methodParams: {
        value1: balanceOf.output.params.balance.getOutputVariable("1"),
        value2: ethers.utils.parseUnits("10", 18).toString(),
      },
    },
  });

  const transfer = new ERC20.actions.Transfer({
    chainId: 1,
    initParams: {
      to: data[chainId].KIRO,
      methodParams: {
        recipient: wallet,
        amount: ethers.utils.parseUnits("6", 18).toString(),
      },
    },
  });

  await batchMultiSigCall.createMultiple([
    { plugin: balanceOf, from: vault, nodeId: "1" },
    {
      plugin: greaterThan,
      from: vault,
      nodeId: "2",
      options: {
        flow: Flow.OK_CONT_FAIL_REVERT,
      },
    },
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
    builder: ZERO_ADDRESS,
    externalSigners: [],
  };

  fs.writeFileSync("FCT_TransferERC20.json", JSON.stringify(signedFCT, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
