import FCTData from "../FCT_Mainnet.json";
import { BatchMultiSigCall } from "../src";
import scriptData from "./scriptData";

const chainId = 1;
async function main() {
  const rpcUrl = scriptData[chainId].rpcUrl;

  const FCT = BatchMultiSigCall.from(FCTData);

  const data = await FCT.utils.getExecutedPath({
    rpcUrl,
    txHash: "0x95f9f186cbff60cecdecef460c442b82d938973becca0015d1376596daa6b574",
  });

  console.log(data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
