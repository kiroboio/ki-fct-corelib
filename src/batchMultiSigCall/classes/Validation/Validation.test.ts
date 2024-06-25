import { expect } from "chai";
import { ethers } from "ethers";

import { variables } from "../../..";
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
    await FCT.add({
      nodeId: "transfer",
      from: createRandomAddress(),
      to: createRandomAddress(),
      method: "transfer",
    });

    validations.add({
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
    // expect(validation1.value1).to.equal("0xFD00000000000000000000000000000000000000000000000000000000000001");
    expect(validation1.value1).to.equal(variables.getOutputVariable({ index: 0, offset: 0 }));
    expect(validation1.operator).to.equal(ethers.utils.id("equal"));
    expect(validation1.value2).to.equal("20");
  });

  it("Should add a validation with a validation as value1", async () => {
    await FCT.add({
      nodeId: "transfer",
      from: createRandomAddress(),
      to: createRandomAddress(),
      method: "balanceOf",
    });

    validations.add({
      nodeId: "transfer",
      validation: {
        id: "eitherValue1OrValue2",
        value1: {
          id: "compare",
          value1: { type: "output", id: { nodeId: "transfer", innerIndex: 0 } },
          operator: "greater equal than",
          value2: "10" + "0".repeat(18),
        },
        operator: "equal",
        value2: {
          id: "compare2",
          value1: "30",
          operator: "greater than",
          value2: "10",
        },
      },
    });

    const fctData = FCT.exportFCT();

    const fctValidations = fctData.validations;
    expect(fctValidations.length).to.equal(3);
  });

  it("Should expect an error when adding a validation with invalid value", async () => {
    await FCT.add({
      nodeId: "transfer",
      from: createRandomAddress(),
      to: createRandomAddress(),
      method: "transfer",
    });

    expect(() => {
      validations.add({
        nodeId: "transfer",
        validation: {
          id: "compare",
          value1: "hhhhhh", // String not allowed
          operator: "equal",
          value2: "20",
        },
      });
    }).to.throw("Invalid value1 for validation compare");
  });
});
