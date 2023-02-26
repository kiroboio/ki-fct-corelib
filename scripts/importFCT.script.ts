import * as dotenv from "dotenv";

import FCTData from "../FCT.json";
import { BatchMultiSigCall } from "../src";

const encoded =
  "0x0000000000000000000000009650578ebd1b08f98af81a84372ece4b448d7526000000000000000000000000fc00000000000000000000000000000000000002000000000000000000000000fc00000000000000000000000000000000000003";

const typedData = FCTData.typedData;

dotenv.config();
const key = process.env.PRIVATE_KEY as string;

async function main() {
  const FCT = new BatchMultiSigCall();
  FCT.importFCT(FCTData);

  // const exportFCT = FCT.exportFCT();
  // console.log(util.inspect(exportFCT, false, null, true /* enable colors */));

  // Deconstruct type

  // const type = "Struct1";
  // const getTypeStruct = (type: string): any => {
  //   const typeStruct = typedData.types[type as keyof (typeof typedData)["types"]] as { name: string; type: string }[];

  //   if (!typeStruct) {
  //     return type;
  //   }
  //   return typeStruct.reduce((acc, { name, type }) => {
  //     if (typedData.types[type as keyof (typeof typedData)["types"]]) {
  //       return {
  //         ...acc,
  //         [name]: getTypeStruct(type),
  //       };
  //     }
  //     return {
  //       ...acc,
  //       [name]: type,
  //     };
  //   }, {} as Record<string, string>);
  // };

  // const typeStructObject = getTypeStruct(type);

  // // Genarate tuple string from typeStructObject

  // const decoded = ethers.utils.defaultAbiCoder.decode(["tuple(address,uint256,tuple(address))"], encoded);

  // console.log(decoded);
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
