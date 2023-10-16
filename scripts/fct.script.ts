import { AaveV2, ERC20, ERC721 } from "@kiroboio/fct-plugins";
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

  // Get address from private key
  const address = ethers.utils.computeAddress("0x" + key);
  console.log("address", address);

  const batchMultiSigCall = new BatchMultiSigCall({
    chainId,
  });

  batchMultiSigCall.setOptions({
    maxGasPrice: "150" + "0".repeat(9),
    expiresAt: getDate(1000000),
    recurrency: {
      accumetable: true,
      maxRepeats: "500",
      chillTime: "0",
    },
    multisig: {
      externalSigners: ["0x9650578ebd1b08f98af81a84372ece4b448d7526"],
      minimumApprovals: "1",
    },
  });

  const approve = new ERC20.actions.Approve({
    chainId,
    initParams: {
      to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
      methodParams: {
        amount: "1" + "0".repeat(18),
        spender: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
      },
    },
  });

  const transfer = new ERC20.actions.TransferFrom({
    chainId,
  });

  transfer.input.set({
    to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
    methodParams: {
      amount: "1" + "0".repeat(18),
      from: vault,
      // from: "0x62e3a53a947d34c4ddcd67b49fadc30b643e2586",
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
    { plugin: approve, nodeId: "1" },
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
    {
      value: "0",
      to: "0x23D560eF20B57A87489D3Ec72D3789E73DF90424",
      method: "multiBalance",
      params: [
        {
          name: "Balances",
          type: "tuple[]",
          customType: true,
          value: [
            [
              { name: "token", type: "address", value: "0x75ab5ab1eef154c0352fc31d2428cef80c7f8b33" },
              { name: "account", type: "address", value: "0xD4a0281cEeebA1CEeFB4eAbF63ca6A608E143Fdc" },
            ],
            [
              { name: "token", type: "address", value: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6" },
              { name: "account", type: "address", value: "0x014aEbA4e0f1a9B6942f1d43F1cC5af17fe8253D" },
            ],
          ],
        },
      ],
      options: { gasLimit: "153768", falseMeansFail: false, callType: "LIBRARY_VIEW_ONLY" },
    },
  ]);

  const call = await batchMultiSigCall.add({
    from: "0x9650578ebd1b08f98af81a84372ece4b448d7526" as const,
    to: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
    method: "balanceOf",
  } as const);

  const data = call.from;

  const FCT = batchMultiSigCall.exportFCT();

  const requiredApprovals = await batchMultiSigCall.utils.getAllRequiredApprovals();

  console.log("requiredApprovals", requiredApprovals);

  const signature = signTypedData({
    data: FCT.typedData as unknown as TypedMessage<TypedDataTypes>,
    privateKey: Buffer.from(key, "hex"),
    version: SignTypedDataVersion.V4,
  });

  const splitSignature = ethers.utils.splitSignature(signature);

  const signedFCT = {
    ...FCT,
    signatures: [...FCT.signatures, splitSignature],
    variables: [],
    externalSigners: [],
  };

  fs.writeFileSync("./scripts/FCT.json", JSON.stringify(signedFCT, null, 2));

  const test = BatchMultiSigCall.from(FCT).utils.recoverAddress(splitSignature);
  console.log("test", test);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
