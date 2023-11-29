// Init dotenv
import console from "console";
import * as dotenv from "dotenv";

// https://testapi.kirobo.me/v1/eth/goerli/fct/getfct/<message hash>?key=process.env.LIOR_SERVICE_KEY
import { BatchMultiSigCall, ethers } from "../src";
import FCTdata from "./pathFCT.json";

dotenv.config();

const activator = "0x4c508dc4a3aacbecbf13c1d543b4936274033110";
const receiver = ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTdata);

  const tenderlyRpcUrl = process.env.TENDERLY_RPC_URL as string;
  const txHash = "0x5158732687eaee51d18dc552d49b0e780cda1ab9f5c85eace72419a3d05bfe4f";

  const data = await FCT.utils.getExecutionResult({
    txHash: txHash,
    tenderlyRpcUrl,
  });

  console.log(data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
