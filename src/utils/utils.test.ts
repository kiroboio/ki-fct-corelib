import { expect } from "chai";

import FCT from "../../FCT_Test.json";
import { ethers, utils } from "../index";

const ACTIVATOR = "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30";

describe("Utility functions", () => {
  describe("FCT Utility functions", () => {
    it("Should recover address from EIP712", async () => {
      const address = utils.recoverAddressFromEIP712(FCT.typedData, FCT.signatures[0]);

      expect(ethers.utils.getAddress(address)).to.eq(ethers.utils.getAddress(ACTIVATOR));
    });

    it("Should get FCT Message hash", () => {
      const hash = utils.getFCTMessageHash(FCT.typedData);

      expect(hash).to.be.a("string");
    });

    it("Should validate FCT", () => {
      const validateFunctions = utils.validateFCT(FCT);

      expect(validateFunctions).to.be.a("object");
    });

    it("Should get variables as bytes32", () => {
      const randomAddress = "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30";
      const randomValue = "1000000000000000000";

      const variables = utils.getVariablesAsBytes32([randomAddress, randomValue]);

      const result = [
        "0x000000000000000000000000E911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
        "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000",
      ];

      expect(variables).to.deep.eq(result);
    });
  });
});
