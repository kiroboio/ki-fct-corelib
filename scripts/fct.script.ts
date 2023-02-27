import { AaveV2, ERC20, ERC721 } from "@kirobo/ki-eth-fct-provider-ts";
import { signTypedData, SignTypedDataVersion, TypedMessage } from "@metamask/eth-sig-util";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";
import util from "util";

// import util from "util"
import { BatchMultiSigCall, TypedDataTypes, utils } from "../src";
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

  const batchMultiSigCall = new BatchMultiSigCall({
    chainId,
  });

  batchMultiSigCall.setOptions({
    maxGasPrice: "20000000000",
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
      amount: "1",
      from: "0x62e3a53a947d34c4ddcd67b49fadc30b643e2586",
      to: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
    },
  });

  const erc721TransferFrom = new ERC721.actions.SafeTransferFrom({
    chainId,
    initParams: {
      to: "0x39Ec448b891c476e166b3C3242A90830DB556661",
      methodParams: {
        from: "0xDF9c06D1A927D8945fA5b05840A3A385Eaa14D98",
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

  await batchMultiSigCall.createMultiple([
    { plugin: transfer, from: vault, nodeId: "3" },
    {
      plugin: erc721TransferFrom,
      from: vault,
      nodeId: "4",
      options: {
        jumpOnFail: "",
      },
    },
    {
      from: vault,
      method: "transfer",
      to: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
      params: [
        {
          name: "data",
          type: "tuple",
          customType: true,
          value: [
            {
              name: "to",
              type: "address",
              value: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
            },
            {
              name: "value",
              type: "uint256",
              value: { type: "external", id: 1 },
            },
            {
              name: "value2",
              type: "tuple",
              customType: true,
              value: [
                {
                  name: "to",
                  type: "address",
                  value: { type: "external", id: 2 },
                },
              ],
            },
          ],
        },
      ],
      nodeId: "5",
    },
  ]);

  const FCT = batchMultiSigCall.exportFCT();
  console.log(util.inspect(batchMultiSigCall.decodedCalls, false, null, true /* enable colors */));

  console.log(util.inspect(FCT, false, null, true /* enable colors */));

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

  // const version = "010101";

  // const callData = batchMultiSigCall.getCalldataForActuator({
  //   signedFCT,
  //   activator: process.env.ACTIVATOR as string,
  //   investor: ZERO_ADDRESS,
  //   purgedFCT: "0x".padEnd(66, "0"),
  //   version,
  // });

  // const gasEstimation = await utils.estimateFCTGasCost({
  //   fct: signedFCT,
  //   callData,
  //   rpcUrl: data[chainId].rpcUrl,
  //   batchMultiSigCallAddress: data[chainId].FCT_BatchMultiSig,
  // });

  // console.log("gasEstimation", gasEstimation);

  const kiroPayment = utils.getKIROPayment({
    fct: signedFCT,
    kiroPriceInETH: "38270821632831754769812",
    gasPrice: 1580000096,
    gas: 462109,
  });

  const requireApprovals = batchMultiSigCall.getAllRequiredApprovals();
  console.log(requireApprovals);

  console.log(batchMultiSigCall._options);

  // const fees = utils.getPaymentPerPayer({
  //   fct: signedFCT,
  //   kiroPriceInETH: "34149170958632548614943",
  // });

  // console.log(fees);

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

// 0x
// 00000000000000000000000000000000000000000000000000000000000f4240
// 0000000000000000000000000000000000000000000000000000000000000060
// 00000000000000000000000000000000000000000000000000000000000000a0
// 0000000000000000000000000000000000000000000000000000000000000020
// 73776170203c616d6f756e743e2045544820666f72203c583e20546f6b656e73
// 0000000000000000000000000000000000000000000000000000000000000002
// 000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d6
// 0000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984

// 0x
// 00000000000000000000000000000000000000000000000000000000000f4240 amount
// 466cc669f6960e4421e91695071448f897ff8b24896d7be50c3dfd35763c11bc method bytes32
// 0000000000000000000000000000000000000000000000000000000000000060 path position
// 0000000000000000000000000000000000000000000000000000000000000002 path length
// 000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d6 path[0]
// 0000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984 path[1]
