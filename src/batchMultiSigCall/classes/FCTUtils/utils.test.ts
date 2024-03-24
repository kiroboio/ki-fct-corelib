import { expect } from "chai";
import { ethers } from "ethers";

import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { freshTestFCT } from "../../test/helpers";
// import { SessionID } from ".";

const getRandomAddress = () => ethers.Wallet.createRandom().address;

describe("BatchMultiSigCall utils", () => {
  const FCT = freshTestFCT({ chainId: "1" });

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
});
