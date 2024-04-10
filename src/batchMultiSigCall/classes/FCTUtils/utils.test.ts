import { expect } from "chai";
import { ethers } from "ethers";

import { BatchMultiSigCall } from "../../batchMultiSigCall";
// import { SessionID } from ".";

const getRandomAddress = () => ethers.Wallet.createRandom().address;

describe("BatchMultiSigCall utils", () => {
  it("Should return true on usesExternalVariables", async () => {
    const FCTWithExternalVariable = new BatchMultiSigCall({
      chainId: "1",
    });

    await FCTWithExternalVariable.add({
      from: getRandomAddress(),
      to: getRandomAddress(),
      value: { type: "external", id: 0 },
    });

    expect(FCTWithExternalVariable.utils.usesExternalVariables()).to.be.true;

    const exportedFCT = FCTWithExternalVariable.exportFCT();
    const importedFCT = BatchMultiSigCall.from(exportedFCT);

    expect(importedFCT.utils.usesExternalVariables()).to.be.true;
  });

  it("Should return false on usesExternalVariables", async () => {
    const FCTWithExternalVariable = new BatchMultiSigCall({
      chainId: "1",
    });

    await FCTWithExternalVariable.add({
      from: getRandomAddress(),
      to: getRandomAddress(),
      value: "123",
    });

    expect(FCTWithExternalVariable.utils.usesExternalVariables()).to.be.false;

    const exportedFCT = FCTWithExternalVariable.exportFCT();
    const importedFCT = BatchMultiSigCall.from(exportedFCT);

    expect(importedFCT.utils.usesExternalVariables()).to.be.false;
  });

  it("Should return true on usesExternalVariables when used in computed", async () => {
    const FCT = new BatchMultiSigCall({
      chainId: "1",
    });

    await FCT.add({
      from: getRandomAddress(),
      to: getRandomAddress(),
      value: "123",
    });

    FCT.addComputed({
      id: "123",
      value1: { type: "external", id: 0 },
      operator1: "+",
      value2: { type: "external", id: 1 },
    });

    expect(FCT.utils.usesExternalVariables()).to.be.true;
  });

  it("Should return true on usesExternalVariables when used in validation", async () => {
    const FCT = new BatchMultiSigCall({
      chainId: "1",
    });

    await FCT.add({
      nodeId: "123",
      from: getRandomAddress(),
      to: getRandomAddress(),
      value: "123",
    });

    FCT.addValidation({
      nodeId: "123",
      validation: {
        value1: { type: "external", id: 0 },
        operator: "equal",
        value2: "20",
      },
    });

    expect(FCT.utils.usesExternalVariables()).to.be.true;
  });

  it("Should return calldata with externalSigners and variables", async () => {
    const FCT = new BatchMultiSigCall({
      chainId: "1",
    });

    await FCT.add({
      nodeId: "123",
      from: getRandomAddress(),
      to: getRandomAddress(),
      value: "123",
    });

    const varValue = ethers.utils.defaultAbiCoder.encode(["uint256"], [123]);

    const calldata = FCT.utils.getCalldataForActuator({
      signatures: [],
      externalSigners: [getRandomAddress()],
      variables: [varValue],
      activator: getRandomAddress(),
    });

    // Expect calldata to be string
    expect(typeof calldata).to.be.eq("string");
  });
});
