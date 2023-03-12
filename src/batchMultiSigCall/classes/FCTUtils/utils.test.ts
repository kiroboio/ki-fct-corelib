import { expect } from "chai";
import { getAddress } from "ethers/lib/utils";

import FCTData from "../../../../FCTExample.json";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { FCTUtils } from ".";

// const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("BatchMultiSigCall EIP712", () => {
  let FCT: BatchMultiSigCall;
  let utils: FCTUtils;
  before(async () => {
    FCT = BatchMultiSigCall.from(FCTData);
    utils = FCT.utils;
  });

  it("Should be able to get all required approvals", async () => {
    const approvals = await utils.getAllRequiredApprovals();

    expect(approvals).to.be.an("array");
    expect(approvals).to.have.lengthOf(3);
    expect(approvals[0]).to.deep.eq({
      token: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
      method: "approve",
      from: "0x62e3a53a947d34c4ddcd67b49fadc30b643e2586",
      protocol: "ERC20",
      params: {
        spender: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
        amount: "1000000000000000000",
      },
    });
    expect(approvals[1]).to.deep.eq({
      token: "0x39Ec448b891c476e166b3C3242A90830DB556661",
      method: "approve",
      from: "0xDF9c06D1A927D8945fA5b05840A3A385Eaa14D98",
      protocol: "ERC721",
      params: {
        spender: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
        tokenId: "1",
      },
    });
  });

  it("Should get calldata for actuator", async () => {
    const calldata = utils.getCalldataForActuator({
      signatures: FCTData.signatures,
      purgedFCT: "0x".padEnd(66, "0"),
      investor: ZERO_ADDRESS,
      activator: "0x62e3A53A947D34C4DdCD67B49fAdc30b643e2586",
    });

    expect(calldata).to.be.an("string");
  });

  it("Should get authenticator signature", () => {
    const signature = utils.getAuthenticatorSignature();

    expect(signature).to.be.an("object");
    expect(signature).to.have.property("r");
    expect(signature).to.have.property("s");
    expect(signature).to.have.property("v");
  });

  it("Should recover address from signature", () => {
    const signature = utils.getAuthenticatorSignature();
    const recovered = utils.recoverAddress(signature);

    if (!recovered) {
      throw new Error("Recovered address is null");
    }

    expect(recovered).to.be.an("string");
    expect(getAddress(recovered)).to.eq(getAddress("0x991e5E72D9aCC110B1D8D2AA06C26931eE8CF330"));
  });

  it("Should get options", () => {
    const options = utils.getOptions();

    expect(options).to.be.an("object");
    expect(options).to.have.property("valid_from");
    expect(options).to.have.property("expires_at");
    expect(options).to.have.property("gas_price_limit");
    expect(options).to.have.property("blockable");
    expect(options).to.have.property("purgeable");
    expect(options).to.have.property("builder");
    expect(options).to.have.property("recurrency");
    expect(options).to.have.property("multisig");
    expect(options).to.have.property("authEnabled");
  });

  it("Should get message hash", () => {
    const hash = utils.getMessageHash();

    expect(hash).to.be.an("string");
  });

  it("Should check if FCT is valid", () => {
    const valid = utils.isValid();

    expect(valid).to.be.a("boolean");
    expect(valid).to.be.true;
  });

  it("Should get signers", () => {
    const signers = utils.getSigners();

    expect(signers).to.be.an("array");
  });

  it("Should get all paths", () => {
    const paths = utils.getAllPaths();

    expect(paths).to.be.an("array");
    expect(paths).to.have.lengthOf(1);
    expect(paths).to.deep.eq([["0", "1", "2"]]);
  });
});
