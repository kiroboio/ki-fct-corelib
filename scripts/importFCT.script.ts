import * as dotenv from "dotenv";
import util from "util";

import { BatchMultiSigCall, ethers, utils } from "../src";
import scriptData from "./scriptData";

const ABI = [
  {
    inputs: [
      { internalType: "address", name: "operator", type: "address" },
      {
        components: [
          { internalType: "bool", name: "activate", type: "bool" },
          { internalType: "bool", name: "activateBatch", type: "bool" },
          { internalType: "bool", name: "activateForFree", type: "bool" },
          { internalType: "bool", name: "activateForFreeBatch", type: "bool" },
        ],
        internalType: "struct IFCT_ActuatorStorage.Approvals",
        name: "approvals",
        type: "tuple",
      },
    ],
    name: "setActivationApproval",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// const ABI = [
//   // Constructor
//   "constructor(string symbol, string name)",

//   // State mutating method
//   "function transferFrom(address from, address to, uint amount)",

//   // State mutating method, which is payable
//   "function mint(uint amount) payable",

//   // Constant method (i.e. "view" or "pure")
//   "function balanceOf(address owner) view returns (uint)",

//   // An Event
//   "event Transfer(address indexed from, address indexed to, uint256 amount)",

//   // A Custom Solidity Error
//   "error AccountLocked(address owner, uint256 balance)",

//   // Examples with structured types
//   "function addUser(tuple(string name, address addr) user) returns (uint id)",
//   "function addUsers(tuple(string name, address addr)[] user) returns (uint[] id)",
//   "function getUser(uint id) view returns (tuple(string name, address addr) user)",
// ];

dotenv.config();
const key = process.env.PRIVATE_KEY as string;

async function main() {
  const gasPrices = await utils.getGasPrices({
    rpcUrl: scriptData[5].rpcUrl,
  });

  const FCT = new BatchMultiSigCall({
    chainId: "5",
  });

  const iface = new ethers.utils.Interface(ABI);

  const encodedData = iface.encodeFunctionData("setActivationApproval", [
    "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    [true, true, true, true],
  ]);

  console.log(encodedData);

  await FCT.create({
    abi: ABI,
    encodedData: encodedData,
    to: "0x00ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c",
  });

  // const data =
  //   "0x23b872dd0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c0000000000000000000000000000000000000000000000000de0b6b3a7640000";
  // const value = parseEther("1.0");

  // const tx = iface.parseTransaction({ data, value });
  // console.log(tx.args);
  // // Transfor tx.args into a JSON object
  // console.log(
  //   Object.entries(tx.args)
  //     .filter(([key]) => {
  //       // Check if key is a number. If it is number, return false
  //       return !Number.isInteger(Number(key));
  //     })
  //     .reduce((acc, [key, value]) => {
  //       acc[key] = value.toString();
  //       return acc;
  //     }, {} as any)
  // );

  // console.log(tx.functionFragment.inputs);

  const functionFragment = iface.getFunction("setActivationApproval");

  const tx = iface.parseTransaction({ data: encodedData });

  console.log(JSON.stringify(functionFragment.inputs, null, 2));
  console.log(tx.args.map((arg) => arg));

  await FCT.create({
    abi: ABI,
    encodedData: encodedData,
    from: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    to: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  });

  console.log(util.inspect(FCT.calls, false, null, true));

  const fct = FCT.exportFCT();
  console.log(util.inspect(fct, false, null, true));
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

// TransactionDescription {
//   args: [
//     '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//     '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C',
//     { BigNumber: "1000000000000000000" },
//     amount: { BigNumber: "1000000000000000000" },
//     from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//     to: '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C'
//   ],
//   functionFragment: [class FunctionFragment],
//   name: 'transferFrom',
//   sighash: '0x23b872dd',
//   signature: 'transferFrom(address,address,uint256)',
//   value: { BigNumber: "1000000000000000000" }
// }
