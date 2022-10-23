import { BatchMultiSigCall } from "../src/batchMultiSigCall";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { TypedDataUtils } from "ethers-eip712";
import fs from "fs";
import { ERC20, PureValidator } from "@kirobo/ki-eth-fct-provider-ts";
import { Flow } from "../src/constants";

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

// function addMinutes(numOfMinutes: number, date = new Date()) {
//   date.setTime(date.getTime() + numOfMinutes * 60 * 1000);

//   return Number(date.getTime() / 1000).toFixed();
// }

const FCT_Controller_Rinkeby = "0x5a59026F30Df81F482816350E50b27285D84E9c8";
const FCT_Controller_Goerli = "0xE215Fe5f574593A034c7E6e9BE280A254D02F4dd";
const Rinkeby_USDT = "0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02";
const Mainnet_USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const Goerli_USDC = "0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557";

const data = {
  KIRO_GOERLI: "0xba232b47a7dDFCCc221916cf08Da03a4973D3A1D",
  PUREVALIDATOR_GOERLI: "0x1716898d72BE098F4828B435a3918cBFda562Efc",
  PURESAFEMATH_GOERLI: "0x850c7E3eBf05d0A617DAe4beE14A4A5C03CAb9da",
};

const wallet = "0x62e3A53A947D34C4DdCD67B49fAdc30b643e2586";

// GOERLI RPC URL - https://eth-goerli.public.blastapi.io

async function main() {
  const batchMultiSigCall = new BatchMultiSigCall({
    provider: new ethers.providers.JsonRpcProvider("https://eth-goerli.public.blastapi.io"),
    contractAddress: FCT_Controller_Goerli,
    options: {
      // validFrom: addHours(0.66), // UNIX timestamp
      expiresAt: getDate(10), // UNIX timestamp
    },
  });

  const vault = process.env.VAULT as string;
  const key = process.env.PRIVATE_KEY as string;

  const balanceOf = new ERC20.getters.BalanceOf({
    chainId: 1,
    initParams: {
      to: data.KIRO_GOERLI,
      methodParams: {
        owner: vault,
      },
    },
  });

  const greaterThan = new PureValidator.validate.GreaterThan({
    chainId: 1,
    initParams: {
      to: data.PUREVALIDATOR_GOERLI,
      methodParams: {
        value1: balanceOf.output.params.balance.getOutputVariable("1"),
        value2: "10",
      },
    },
  });

  const transfer = new ERC20.actions.Transfer({
    chainId: 1,
    initParams: {
      to: data.KIRO_GOERLI,
      methodParams: {
        recipient: wallet,
        amount: "10",
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

  const messageDigest = TypedDataUtils.encodeDigest(FCT.typedData);
  const signingKey = new ethers.utils.SigningKey("0x" + key);
  const signature = signingKey.signDigest(messageDigest);
  signature.v = parseInt(`0x${signature.v.toString(16)}`);

  const signedFCT = {
    ...FCT,
    signatures: [signature],
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
