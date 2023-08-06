import { ethers } from "ethers";

import FCTData from "../fct.json";
import { BatchMultiSigCall } from "../src";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);
  const authenticatorSignature = FCT.utils.getAuthenticatorSignature();

  const exportFCT = FCT.exportFCT();

  const FCT2 = BatchMultiSigCall.from(exportFCT);
  const recoverAddress = FCT2.utils.recoverAddress(authenticatorSignature);
  console.log(recoverAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

const data = {
  id: "EnoughFunds",
  value1: {
    id: "USDTValidation",
    value1: { type: "output", id: { nodeId: "USDT_balanceof", innerIndex: 0 } },
    operator: "greater equal than",
    value2: "100" + "0".repeat(18),
  },
  operator: "or",
  value2: {
    id: "USDCValidation",
    value1: { type: "output", id: { nodeId: "USDC_balanceof", innerIndex: 0 } },
    operator: "greater equal than",
    value2: "100" + "0".repeat(6),
  },
};
