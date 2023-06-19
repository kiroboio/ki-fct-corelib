import { ethers } from "ethers";
import util from "util";

import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { Validation } from "./index";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

describe("Validation", () => {
  let FCT: BatchMultiSigCall;
  let validations: Validation;

  beforeEach(async () => {
    FCT = new BatchMultiSigCall({
      chainId: "1",
    });
    validations = FCT.validation;
  });

  it("Should add a validation", async () => {
    const validationVariable = validations.add({
      id: "compare",
      value1: { type: "output", id: { nodeId: "transfer", innerIndex: 0 } },
      operator: "equal",
      value2: "20",
    });

    const validationVariable2 = validations.add({
      id: "compare2",
      value1: validationVariable,
      operator: "greater than",
      value2: "10",
    });

    await FCT.add({
      nodeId: "transfer",
      from: createRandomAddress(),
      to: createRandomAddress(),
      method: "transfer",
      options: {
        validation: validationVariable2.id,
      },
    });

    const fct = FCT.exportFCT();

    console.log(util.inspect(fct, false, null, true /* enable colors */));
  });
});
