import { BatchMultiSigCall } from "../src/batchMultiSigCall";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "fs";
import data from "./scriptData";
import { signTypedData, SignTypedDataVersion, TypedMessage } from "@metamask/eth-sig-util";
import { TypedDataTypes } from "../src/batchMultiSigCall/interfaces";
import { utils } from "../src/index";

dotenv.config();

function getDate(days: number = 0) {
  const result = new Date();
  result.setDate(result.getDate() + days);
  return Number(result.getTime() / 1000).toFixed();
}

const chainId = 5;

async function main() {
  const gases = await utils.getGasPriceEstimations({
    rpcUrl: process.env.RPC_URL_MAINNET as string,
    historicalBlocks: 20,
  });

  console.log(gases);

  const vault = process.env.VAULT as string;
  const key = process.env.PRIVATE_KEY as string;

  const batchMultiSigCall = new BatchMultiSigCall({
    provider: new ethers.providers.JsonRpcProvider(data[chainId].rpcUrl),
    contractAddress: data[chainId].FCT_Controller,
  });

  batchMultiSigCall.setOptions({
    maxGasPrice: "3000000000",
    expiresAt: getDate(10),
    recurrency: {
      accumetable: true,
      maxRepeats: "1000",
      chillTime: "1",
    },
  });

  await batchMultiSigCall.createMultiple([
    {
      from: vault,
      nodeId: "1",
      method: "transfer",
      to: data[chainId].KIRO,
      params: [
        {
          name: "data",
          type: "tuple",
          value: [
            {
              name: "firstname",
              type: "string",
              value: "John",
            },
            {
              name: "lastname",
              type: "string",
              value: "Doe",
            },
            {
              name: "dateOfBirth",
              type: "tuple",
              value: [
                {
                  name: "year",
                  type: "uint256",
                  value: "1990",
                },
                {
                  name: "month",
                  type: "uint256",
                  value: "1",
                },
                {
                  name: "day",
                  type: "uint256",
                  value: "1",
                },
                {
                  name: "random",
                  type: "tuple",
                  value: [
                    {
                      name: "random1",
                      type: "tuple",
                      value: [
                        {
                          name: "random122",
                          type: "uint256",
                          value: "1",
                        },
                        {
                          name: "random123",
                          type: "uint256",
                          value: "2",
                        },
                      ],
                    },
                    {
                      name: "random2",
                      type: "uint256",
                      value: "2",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "otherData",
          type: "tuple",
          value: [
            {
              name: "firstname",
              type: "string",
              value: "John",
            },
            {
              name: "lastname",
              type: "string",
              value: "Doe",
            },
            {
              name: "middleName",
              type: "string",
              value: "Doe",
            },
            {
              name: "nationality",
              type: "tuple",
              value: [
                {
                  name: "country",
                  type: "string",
                  value: "Sweden",
                },
                {
                  name: "city",
                  type: "string",
                  value: "Stockholm",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      from: vault,
      nodeId: "2",
      method: "transfer",
      to: data[chainId].KIRO,
      params: [
        {
          name: "data",
          type: "tuple",
          value: [
            {
              name: "firstname",
              type: "string",
              value: "John",
            },
            {
              name: "lastname",
              type: "string",
              value: "Doe",
            },
            {
              name: "dateOfBirth",
              type: "tuple",
              value: [
                {
                  name: "year",
                  type: "uint256",
                  value: "1990",
                },
                {
                  name: "month",
                  type: "uint256",
                  value: "1",
                },
                {
                  name: "day",
                  type: "uint256",
                  value: "1",
                },
                {
                  name: "random",
                  type: "tuple",
                  value: [
                    {
                      name: "random1",
                      type: "uint256",
                      value: "1",
                    },
                    {
                      name: "random2",
                      type: "uint256",
                      value: "2",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "otherData",
          type: "tuple",
          value: [
            {
              name: "firstname",
              type: "string",
              value: "John",
            },
            {
              name: "lastname",
              type: "string",
              value: "Doe",
            },
            {
              name: "middleName",
              type: "string",
              value: "Doe",
            },
            {
              name: "nationality",
              type: "tuple",
              value: [
                {
                  name: "country",
                  type: "string",
                  value: "Sweden",
                },
                {
                  name: "city",
                  type: "string",
                  value: "Stockholm",
                },
              ],
            },
          ],
        },
      ],
    },
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
    externalSigners: [],
  };

  fs.writeFileSync("FCT_Struct.json", JSON.stringify(signedFCT, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
