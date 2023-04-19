import { AaveV2, ERC20, ERC721 } from "@kirobo/ki-eth-fct-provider-ts";
import { signTypedData, SignTypedDataVersion, TypedMessage } from "@metamask/eth-sig-util";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";

// import util from "util";
import { BatchMultiSigCall, TypedDataTypes } from "../src";

dotenv.config();
// eslint-disable-next-line
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function getDate(days = 0) {
  const result = new Date();
  result.setDate(result.getDate() + days);
  return Number(result.getTime() / 1000).toFixed();
}
// eslint-disable-next-line
function addHours(numOfHours: number, date = new Date()) {
  date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);

  return Number(date.getTime() / 1000).toFixed();
}

const chainId = "5";
const wallet = process.env.WALLET as string;
async function main() {
  const vault = process.env.VAULT as string;
  const key = process.env.PRIVATE_KEY as string;

  const batchMultiSigCall = new BatchMultiSigCall({
    chainId,
  });

  batchMultiSigCall.setOptions({
    maxGasPrice: "150" + "0".repeat(9),
    expiresAt: getDate(1000000),
    builder: wallet,
    recurrency: {
      accumetable: true,
      maxRepeats: "500",
      chillTime: "0",
    },
  });

  const transfer = new ERC20.actions.TransferFrom({
    chainId,
  });

  transfer.input.set({
    to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
    methodParams: {
      amount: "1" + "0".repeat(18),
      // from: vault,
      from: "0x62e3a53a947d34c4ddcd67b49fadc30b643e2586",
      to: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
    },
  });

  const erc721TransferFrom = new ERC721.actions.SafeTransferFrom({
    chainId,
    initParams: {
      to: "0x39Ec448b891c476e166b3C3242A90830DB556661",
      methodParams: {
        // from: vault,
        from: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
        to: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
        tokenId: "1",
      },
    },
  });

  const aaveDeposit = new AaveV2.actions.Deposit({
    chainId,
    initParams: {
      methodParams: {
        amount: "1",
        onBehalfOf: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
        asset: "0x6b175474e89094c44da98b954eedeac495271d0f",
      },
    },
  });

  batchMultiSigCall.setCallDefaults({
    from: vault,
  });

  await batchMultiSigCall.createMultiple([
    { plugin: transfer, nodeId: "3" },
    {
      plugin: erc721TransferFrom,
      nodeId: "4",
      options: {
        jumpOnFail: "",
      },
    },
    {
      plugin: aaveDeposit,
      nodeId: "5",
    },
  ]);

  const FCT = batchMultiSigCall.exportFCT();
  // console.log(util.inspect(batchMultiSigCall.decodedCalls, false, null, true /* enable colors */));

  // console.log(util.inspect(FCT, false, null, true /* enable colors */));

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
    externalSigners: [],
  };

  const requireApprovals = await batchMultiSigCall.utils.getAllRequiredApprovals();
  console.log(requireApprovals, requireApprovals.length);

  fs.writeFileSync("FCT.json", JSON.stringify(signedFCT, null, 2));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
