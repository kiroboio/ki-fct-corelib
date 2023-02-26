import * as dotenv from "dotenv";

import FCTData from "../FCT.json";
// import { BatchMultiSigCall } from "../src";

const encoded =
  "0x0000000000000000000000009650578ebd1b08f98af81a84372ece4b448d7526000000000000000000000000fc00000000000000000000000000000000000002000000000000000000000000fc00000000000000000000000000000000000003";

const typedData = FCTData.typedData;

dotenv.config();
const key = process.env.PRIVATE_KEY as string;

async function main() {
  // const FCT = new BatchMultiSigCall();
  // FCT.importFCT(FCTData);

  // const exportFCT = FCT.exportFCT();
  // console.log(util.inspect(exportFCT, false, null, true /* enable colors */));

  const signature = "transfer((address,uint256,(address)))";

  // Create a function that converts signature
  // Into [["address", "uint256", ["address"]]]
  const signatureToTypes = (signature: string) => {
    // Check what is first ( or ,
    const firstParen = signature.indexOf("(");
    const firstComma = signature.indexOf(",");
  };

  console.log(signatureToTypes(signature));

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
