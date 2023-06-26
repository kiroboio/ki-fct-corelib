import { recoverTypedSignature, SignTypedDataVersion } from "@metamask/eth-sig-util";
import { utils } from "ethers";

import FCTData from "../Fail.json";
import { CallID } from "../src/batchMultiSigCall/classes";

async function main() {
  const parse = CallID.parse("0x0000000000000000000000000000000000000000000000000100010000000000");
  console.log(parse);

  const address = recoverTypedSignature({
    data: FCTData.typedData as any,
    signature: utils.joinSignature(FCTData.signatures[0]),
    version: SignTypedDataVersion.V4,
  });

  console.log(address);
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
