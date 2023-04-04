import { ERC721, ERC1155 } from "@kirobo/ki-eth-fct-provider-ts";
import * as dotenv from "dotenv";

// import util from "util";
import { BatchMultiSigCall } from "../src";

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

  const FCT = new BatchMultiSigCall({
    chainId,
  });

  FCT.setOptions({
    maxGasPrice: "20000000000",
    expiresAt: getDate(1000000),
    builder: wallet,
    recurrency: {
      accumetable: true,
      maxRepeats: "500",
      chillTime: "0",
    },
  });

  const erc721TransferFrom = new ERC721.actions.SafeTransferFrom({
    chainId,
    initParams: {
      to: "0x39Ec448b891c476e166b3C3242A90830DB556661",
      methodParams: {
        from: vault,
        to: "0x39Ec448b891c476e166b3C3242A90830DB556661",
        tokenId: "1",
      },
    },
  });

  const erc1155TransferFrom = new ERC1155.actions.SafeTransferFrom({
    chainId,
    initParams: {
      to: "0x39Ec448b891c476e166b3C3242A90830DB556661",
      methodParams: {
        from: vault,
        to: "0x39Ec448b891c476e166b3C3242A90830DB556661",
        amount: "1",
        id: "1",
      },
    },
  });

  await FCT.createMultiple([
    {
      from: vault,
      plugin: erc721TransferFrom,
    },
    {
      from: vault,
      plugin: erc1155TransferFrom,
    },
  ]);

  const requiredApprovals = await FCT.utils.getAllRequiredApprovals();

  console.log("requiredApprovals", requiredApprovals);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
