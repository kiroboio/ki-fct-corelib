// Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall } from "../src";
import { SessionID } from "../src/batchMultiSigCall/classes";
import FCTData from "./Failing.json";

dotenv.config();

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const parsedSessionId = SessionID.parse("0x46c66700020101000000000000009fc545c0000000000000000006fc23ac001c");
  const parsedSessionId2 = SessionID.parse("0x46c66700020101006400000005009fc545c40000000000000000174876e8001b");

  console.log(parsedSessionId);
  console.log(parsedSessionId2);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
