// Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall } from "../src";

dotenv.config();

const activator = "0x4c508dc4a3aacbecbf13c1d543b4936274033110";

async function main() {
  const FCT = new BatchMultiSigCall({});

  await FCT.add({
    from: activator,
    to: "0x4c508dc4a3aacbecbf13c1d543b4936274033110",
    nodeId: "bd44c4ef-7165-4027-af33-dd05d24c8ab0",
    method: "balanceOf",
    params: [
      {
        name: "account",
        type: "address",
        value: "0x4c508dc4a3aacbecbf13c1d543b4936274033110",
        customType: false,
        hashed: false,
      },
    ],
  });

  console.log("Adding 2nd");

  await FCT.add({
    value: {
      type: "output",
      id: {
        innerIndex: 0,
        nodeId: "bd44c4ef-7165-4027-af33-dd05d24c8ab0",
      },
    },
    to: "0xA96A65c051bF88B4095Ee1f2451C2A9d43F53Ae2",
    method: "add_liquidity",
    params: [
      {
        name: "amounts",
        type: "uint256[2]",
        value: [
          {
            type: "output",
            id: {
              innerIndex: 0,
              nodeId: "bd44c4ef-7165-4027-af33-dd05d24c8ab0",
            },
          },
          {
            type: "output",
            id: {
              innerIndex: 0,
              nodeId: "bd44c4ef-7165-4027-af33-dd05d24c8ab0",
            },
          },
        ],
        customType: false,
        hashed: false,
      },
      {
        name: "minMintAmount",
        type: "uint256",
        value: "0",
        customType: false,
        hashed: false,
      },
    ],
  });

  console.log("Both addded. Now exporting");

  const data = FCT.export();

  console.log(JSON.stringify(data, null, 2));

  // const callDefault = {
  //   value: "0",
  //   options: {
  //     permissions: "0000",
  //     gasLimit: "0",
  //     flow: "OK_CONT_FAIL_REVERT",
  //     jumpOnSuccess: "NO_JUMP",
  //     jumpOnFail: "NO_JUMP",
  //     falseMeansFail: false,
  //     callType: "ACTION",
  //     validation: "",
  //   },
  // };

  // const options = { options: { payerIndex: 2 } };

  // const data = {
  //   value: {
  //     type: "output",
  //     id: { innerIndex: 0, nodeId: "bd44c4ef-7165-4027-af33-dd05d24c8ab0" },
  //   },
  //   to: "0xA96A65c051bF88B4095Ee1f2451C2A9d43F53Ae2",
  //   method: "add_liquidity",
  //   params: [
  //     {
  //       name: "amounts",
  //       type: "uint256[2]",
  //       value: [
  //         {
  //           type: "output",
  //           id: {
  //             innerIndex: 0,
  //             nodeId: "bd44c4ef-7165-4027-af33-dd05d24c8ab0",
  //           },
  //         },
  //         {
  //           type: "output",
  //           id: {
  //             innerIndex: 0,
  //             nodeId: "bd44c4ef-7165-4027-af33-dd05d24c8ab0",
  //           },
  //         },
  //       ],
  //       customType: false,
  //       hashed: false,
  //     },
  //     {
  //       name: "minMintAmount",
  //       type: "uint256",
  //       value: "0",
  //       customType: false,
  //       hashed: false,
  //     },
  //   ],
  //   nodeId: "6afbb8fab415cb8ad430",
  // };

  // deepMerge(callDefault, options, data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
