import { expect } from "chai";
import { ethers } from "ethers";

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

    const Call = await FCT.add({
      nodeId: "transfer",
      from: createRandomAddress(),
      to: createRandomAddress(),
      method: "transfer",
    });

    Call.setOptions({
      validation: validationVariable2.id,
    });

    const fct = FCT.exportFCT();

    expect(fct.typedData.types).to.contain.keys("Validation");

    expect(fct.typedData.message.transaction_1.call.validation).to.equal(2);

    const validation1 = fct.validations[0];
    expect(validation1.value1).to.equal("0xFD00000000000000000000000000000000000001");
    expect(validation1.operator).to.equal(ethers.utils.id("equal"));
    expect(validation1.value2).to.equal("20");

    const validation2 = fct.validations[1];
    expect(validation2.value1).to.equal("0xE900000000000000000000000000000000000000000000000000000000000002");
    expect(validation2.operator).to.equal(ethers.utils.id("greater than"));
    expect(validation2.value2).to.equal("10");
  });

  it("Should add a validation with addAndSetForCall", async () => {
    await FCT.add({
      nodeId: "transfer",
      from: createRandomAddress(),
      to: createRandomAddress(),
      method: "transfer",
    });

    validations.addAndSetForCall({
      nodeId: "transfer",
      validation: {
        id: "compare",
        value1: { type: "output", id: { nodeId: "transfer", innerIndex: 0 } },
        operator: "equal",
        value2: "20",
      },
    });

    const fct = FCT.exportFCT();

    expect(fct.typedData.types).to.contain.keys("Validation");

    expect(fct.typedData.message.transaction_1.call.validation).to.equal(1);

    const validation1 = fct.validations[0];
    expect(validation1.value1).to.equal("0xFD00000000000000000000000000000000000001");
    expect(validation1.operator).to.equal(ethers.utils.id("equal"));
    expect(validation1.value2).to.equal("20");
  });
});
