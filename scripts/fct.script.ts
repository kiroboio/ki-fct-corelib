import { BatchMultiSigCall } from "../src/batchMultiSigCall";
import fs from "fs";
import { ethers } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
import * as dotenv from "dotenv";
import { ERC20 } from "@kirobo/ki-eth-fct-provider-ts";
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

// now - 1d
// 1h - 1d
// 1d - 3d

const FCT_Controller_Rinkeby = "0x5a59026F30Df81F482816350E50b27285D84E9c8";
const Rinkeby_USDT = "0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02";
const Mainnet_USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

async function main() {
  const batchMultiSigCall = new BatchMultiSigCall({
    provider: new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"),
    contractAddress: FCT_Controller_Rinkeby,
    options: {
      // validFrom: addHours(1), // UNIX timestamp
      expiresAt: getDate(20), // UNIX timestamp
      recurrency: {
        accumetable: true,
        maxRepeats: "1000",
        chillTime: "1",
      },
    },
  });

  const vault = process.env.VAULT as string;
  const key = process.env.PRIVATE_KEY as string;

  await batchMultiSigCall.create({
    nodeId: "node0",
    to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
    from: vault,
    value: "5000000000000",
  });

  await batchMultiSigCall.create({
    nodeId: "node1",
    to: Rinkeby_USDT,
    from: vault,
    method: "balanceOf",
    params: [
      {
        name: "account",
        type: "address",
        value: "0x4f631612941F710db646B8290dB097bFB8657dC2",
      },
    ],
  });

  await batchMultiSigCall.create({
    nodeId: "node2",
    to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
    from: vault,
    value: "5000000000000",
  });

  const transfer = new ERC20.actions.Transfer({
    initParams: {
      to: Mainnet_USDC,
      methodParams: {
        amount: "1000000000000000000",
        recipient: "0x4f631612941F710db646B8290dB097bFB8657dC2",
      },
    },
  });

  // All possible options for Transfer plugin
  const options = transfer.input.params.to.options;

  // await batchMultiSigCall.create({
  //   nodeId: "node1",
  //   plugin: transfer,
  //   from: vault,
  // });

  // const balanceOf = new ERC721.getters.IsApprovedForAll({
  //   initParams: {
  //     to: "0x4119c1268Ae527d068907B3D23c6a97b71a19084", // BadgeToken (BTO) (NFT)
  //     methodParams: {
  //       owner: "0x4f631612941F710db646B8290dB097bFB8657dC2",
  //       operator: vault,
  //     },
  //   },
  // });

  // await batchMultiSigCall.create({
  //   nodeId: "node2",
  //   plugin: balanceOf,
  //   from: vault,
  // });

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

  fs.writeFileSync("FCT_Expires20d.json", JSON.stringify(signedFCT, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
