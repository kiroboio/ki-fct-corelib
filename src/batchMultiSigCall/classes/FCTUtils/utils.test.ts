import { expect } from "chai";
import { getAddress } from "ethers/lib/utils";
import util from "util";

import { BatchMultiSigCall } from "../../batchMultiSigCall";
import FCTData from "../../test/FCTExample.json";
import { buildTestFCT } from "../../test/helpers";
import { FCTUtils } from ".";

// const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("BatchMultiSigCall FCTUtils", () => {
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
        spender: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
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

  it("Should deep validate FCT", async () => {
    const { FCT, FCTJson } = buildTestFCT();

    // // Takes around 11.691s
    const tx = await FCT.utils.deepValidateFCT({
      signatures: FCTJson.signatures,
      actuatorAddress: "0xC434b739d2DaC17279f8fA1B66C0C7381df4909b",
      rpcUrl: "https://goerli.infura.io/v3/99229ae47ba74d21abc557bdc503a5d9",
    });

    console.log(util.inspect(tx, false, null, true));

    // // // Find in events "FCTE_Activated" and log it
    // const activatedEvent = tx.txReceipt.events.find((e: any) => e.event === "FCTE_CallPayment");
    // console.log("kiro paid", activatedEvent.args.totalKiroFees.toString());

    // const gasPrice = tx.txReceipt.effectiveGasPrice.toString();
    // // KIRO Paid 92_579140834272517888
    // //            92.57914083427251

    const gasPrice = 2000000000;

    // const kiroPriceInETH = await getKIROPrice({
    //   chainId: 5,
    //   rpcUrl: "https://goerli.infura.io/v3/99229ae47ba74d21abc557bdc503a5d9",
    // });
    // console.log("kiroPriceInETH", kiroPriceInETH);
    // const kiroPriceInETH = "34276716077137";
    const kiroPriceInETH = "29174339261661309654809";

    const payments = FCT.utils.getPaymentPerPayer({
      signatures: FCTJson.signatures,
      kiroPriceInETH,
      gasPrice,
    });

    console.log(payments);
  });
});

// FCT_Tokenomics.sol - reduce only sequential calls

// 1. totalCalls - how many times payment is requested
// If payer == address(0) - activator pays

// by: '0xC434b739d2DaC17279f8fA1B66C0C7381df4909b',
// activator: '0xC434b739d2DaC17279f8fA1B66C0C7381df4909b',
// id: '0xf6407ddd01010100000000000000000000000000000000000000000000000166',
// builder: '0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30',
// total: [
//   BigNumber { value: "15209430279916199367" },
//   BigNumber { value: "15209430279916199366" },
//   BigNumber { value: "62160280274440119153" },
//   BigNumber { value: "16531989434691521051" },
//   BigNumber { value: "76047151399580996837" },
//   BigNumber { value: "203950" },
//   BigNumber { value: "79380" },
//   BigNumber { value: "0" },
//   BigNumber { value: "0" },
//   kiroboPayment: BigNumber { value: "15209430279916199367" },
//   builderPayment: BigNumber { value: "15209430279916199366" },
//   activatorPayment: BigNumber { value: "62160280274440119153" },
//   base: BigNumber { value: "16531989434691521051" },
//   fees: BigNumber { value: "76047151399580996837" },
//   commonGas: BigNumber { value: "203950" },
//   userGas: BigNumber { value: "79380" },
//   missingKiro: BigNumber { value: "0" },
//   availableEth: BigNumber { value: "0" }
// ],
// gasPrice: BigNumber { value: "2000000000" },
// timestamp: BigNumber { value: "1681817846" }
