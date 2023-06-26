import { expect } from "chai";
import { ethers } from "ethers";

import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { Call } from "../Call";

const createRandomAddress = () => ethers.Wallet.createRandom().address;

describe("Variables", () => {
  let FCT: BatchMultiSigCall;
  let Call: Call;

  beforeEach(async () => {
    FCT = new BatchMultiSigCall({
      chainId: "1",
    });

    Call = (await FCT.add({
      nodeId: "balanceOf",
      from: createRandomAddress(),
      to: createRandomAddress(),
      method: "balanceOf",
      options: {
        callType: "VIEW_ONLY",
      },
      params: [
        {
          name: "owner",
          type: "address",
          value: createRandomAddress(),
        },
      ],
    })) as Call;
  });

  describe("computed variables", () => {
    it("Should add a computed variable and use it in a Call", async () => {
      const computedVariable = FCT.addComputed({
        id: "balanceCalculation",
        value1: Call.getOutputVariable(),
        operator1: "/",
        value2: "2",
      });

      await FCT.add({
        nodeId: "transfer",
        from: createRandomAddress(),
        to: Call.get.to,
        method: "transfer",
        params: [
          {
            name: "recipient",
            type: "address",
            value: createRandomAddress(),
          },
          {
            name: "amount",
            type: "uint256",
            value: computedVariable,
          },
        ],
      });

      const fct = await FCT.exportFCT();

      expect(fct.typedData.types).to.include.keys("Computed");

      expect(fct.typedData.message.transaction_2.amount).to.equal("0xFE00000000000000000000000000000000000001");

      expect(fct.computed[0].values).to.deep.eq(["0xFD00000000000000000000000000000000000001", "2", "0", "0"]);
      expect(fct.computed[0].operators).to.deep.eq([ethers.utils.id("/"), ethers.utils.id("+"), ethers.utils.id("+")]);
      expect(fct.computed[0].overflowProtection).to.deep.eq(true);
    });
  });
});
