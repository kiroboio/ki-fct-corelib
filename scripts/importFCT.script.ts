import * as dotenv from "dotenv";

import { parseSessionID } from "../src/batchMultiSigCall/helpers";

dotenv.config();
const key = process.env.PRIVATE_KEY as string;

async function main() {
  const data = parseSessionID(
    "0xb1abd30001010100000000000000640510df0063fa84e000000001dbcb06a80c",
    "0x0000000000000000000000000000000000000000"
  );

  console.log(data);
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
