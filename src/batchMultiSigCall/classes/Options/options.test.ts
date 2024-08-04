import { expect } from "chai";
import { ethers } from "ethers";

import { Options } from ".";

describe("BatchMultiSigCall Options", () => {
  const options = new Options();

  afterEach(() => {
    options.reset();
  });

  it("Should set options", () => {
    const data = {
      name: "Test",
      id: "120",
      validFrom: "0",
      expiresAt: "2680505796", // Far away in the future
      maxGasPrice: "100" + "0".repeat(9), // 100 Gwei
      payableGasLimit: "0",
      blockable: false,
      purgeable: true,
      authEnabled: true,
      dryRun: false,
      forceDryRun: false,
      verifier: "",
      domain: "",
      app: {
        name: "Test",
        version: "",
      },
      builder: {
        name: "",
        address: ethers.constants.AddressZero,
      },
      recurrency: {
        maxRepeats: "100",
        chillTime: "5",
        accumetable: true,
      },
      multisig: {
        externalSigners: [],
        minimumApprovals: "0",
      },
    };
    options.set(data);

    expect(options.get()).to.deep.equal(data);
  });
});
