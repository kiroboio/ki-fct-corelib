import { expect } from "chai";

import { utils } from "..";
import { FetchUtility } from "./fetch";

describe("Utility functions", () => {
  describe("Fetch functions", () => {
    const fetch = new FetchUtility({
      rpcUrl: "https://eth-goerli.public.blastapi.io",
      chainId: 5,
    });

    it("Should fetch current approvals", async () => {
      const approvals = await fetch.fetchCurrentApprovals([
        {
          token: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
          method: "approve",
          from: "0x62e3a53a947d34c4ddcd67b49fadc30b643e2586",
          protocol: "ERC20",
          params: {
            spender: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
            amount: "1",
          },
        },
        {
          token: "0x39Ec448b891c476e166b3C3242A90830DB556661",
          method: "approve",
          from: "0xDF9c06D1A927D8945fA5b05840A3A385Eaa14D98",
          protocol: "ERC721",
          params: {
            spender: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
            tokenId: "1",
          },
        },
      ]);

      const approval = approvals[0] as {
        protocol: "ERC20";
        method: "approve";
        params: {
          spender: string;
          amount: string;
        };
        from: string;
        token: string;
      };

      expect(approval.from).to.eq("0x62e3a53a947d34c4ddcd67b49fadc30b643e2586");
      expect(approval.params.spender).to.eq("0x03357338Ea477FF139170cf85C9A4063dFc03FC9");
    });
  });

  it("Should get gas prices", async () => {
    const gasPrices = await utils.getGasPrices({
      rpcUrl: "https://optimism.drpc.org",
      chainId: 10,
    });

    expect(gasPrices).to.be.a("object");
    expect(gasPrices.slow.maxFeePerGas).to.be.a("string");
    expect(gasPrices.slow.maxPriorityFeePerGas).to.be.a("string");

    expect(gasPrices.average.maxFeePerGas).to.be.a("string");
    expect(gasPrices.average.maxPriorityFeePerGas).to.be.a("string");

    expect(gasPrices.fast.maxFeePerGas).to.be.a("string");
    expect(gasPrices.fast.maxPriorityFeePerGas).to.be.a("string");

    expect(gasPrices.fastest.maxFeePerGas).to.be.a("string");
    expect(gasPrices.fastest.maxPriorityFeePerGas).to.be.a("string");
  });
});
