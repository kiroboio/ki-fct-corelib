import { expect } from "chai";

import FCT from "../../FCT_TransferERC20.json";
import { ethers, utils } from "../index";

const ACTIVATOR = "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30";

describe("Utility functions", () => {
  describe("FCT Utility functions", () => {
    it("Should recover address from EIP712", async () => {
      const address = utils.recoverAddressFromEIP712(FCT.typedData, FCT.signatures[0]);

      expect(ethers.utils.getAddress(address as string)).to.eq(ethers.utils.getAddress(ACTIVATOR));
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
  describe("Fetch functions", () => {
    it("Should fetch current approvals", async () => {
      const approvals = await utils.fetchCurrentApprovals({
        rpcUrl: "https://eth-goerli.public.blastapi.io",
        data: [
          {
            token: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
            from: "0xB252A554217d614Fb2968cf8f87b02e3D9DBd63C",
            spender: "0x9034f5225C76B09750c0dA9Ef5B4BBaf0d455A1C",
          },
        ],
      });

      expect(approvals).to.be.a("array");

      // expect(approvals[0].amount).to.be.a("string");
      expect(approvals[0].from).to.eq("0xB252A554217d614Fb2968cf8f87b02e3D9DBd63C");
      expect(approvals[0].spender).to.eq("0x9034f5225C76B09750c0dA9Ef5B4BBaf0d455A1C");
      expect(approvals[0].token).to.eq("0xba232b47a7ddfccc221916cf08da03a4973d3a1d");
    });
  });
  describe("Gas functions", () => {
    it("Should get gas prices", async () => {
      const gasPrices = await utils.getGasPrices({
        rpcUrl: "https://eth-goerli.public.blastapi.io",
      });

      expect(gasPrices).to.be.a("object");
      expect(gasPrices.slow.maxFeePerGas).to.be.a("number");
      expect(gasPrices.slow.maxPriorityFeePerGas).to.be.a("number");

      expect(gasPrices.average.maxFeePerGas).to.be.a("number");
      expect(gasPrices.average.maxPriorityFeePerGas).to.be.a("number");

      expect(gasPrices.fast.maxFeePerGas).to.be.a("number");
      expect(gasPrices.fast.maxPriorityFeePerGas).to.be.a("number");

      expect(gasPrices.fastest.maxFeePerGas).to.be.a("number");
      expect(gasPrices.fastest.maxPriorityFeePerGas).to.be.a("number");
    });

    it("Should get KIRO cost of FCT", async () => {
      const fctCost = await utils.getKIROPayment({
        fct: FCT,
        kiroPriceInETH: "38270821632831754769812",
        gasPrice: 1580000096,
        gas: 462109,
      });

      // expect(fctCost.amount).to.eq("43.29359365495305");
      expect(fctCost.vault).to.eq("0x03357338Ea477FF139170cf85C9A4063dFc03FC9");
    });
  });
});
