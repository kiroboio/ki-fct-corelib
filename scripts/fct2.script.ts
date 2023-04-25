import { Utility } from "@kiroboio/fct-plugins";
import { signTypedData, SignTypedDataVersion, TypedMessage } from "@metamask/eth-sig-util";
import * as dotenv from "dotenv";

// import util from "util";
import { BatchMultiSigCall, ethers, TypedDataTypes } from "../src";

// import util from "util";

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
    maxGasPrice: "150" + "0".repeat(9),
    expiresAt: getDate(1000000),
    validFrom: "0",
    builder: wallet,
    recurrency: {
      accumetable: true,
      maxRepeats: "500",
      chillTime: "0",
    },
  });

  // Create an FCT where a ETH Transfer is made
  const ethTransfer = new Utility.actions.SendETH({
    chainId,
    initParams: {
      to: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
      value: "300",
    },
  });

  await FCT.create({
    plugin: ethTransfer,
    from: vault,
    nodeId: "0",
  });

  const FCTData = FCT.exportFCT();

  const signature = signTypedData({
    data: FCTData.typedData as unknown as TypedMessage<TypedDataTypes>,
    privateKey: Buffer.from(key, "hex"),
    version: SignTypedDataVersion.V4,
  });

  const splitSignature = ethers.utils.splitSignature(signature);

  const signedFCT = {
    ...FCTData,
    signatures: [FCTData.signatures[0], splitSignature],
    variables: [],
    externalSigners: [],
  };

  // writeFileSync("FCT2.json", JSON.stringify(signedFCT, null, 2));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
