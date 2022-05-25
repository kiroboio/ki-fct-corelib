import { BatchTransfer } from "../src";
import { expect } from "chai";
import "mocha";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const RANDOM_ADDRESS = "0xd2c82f2e5fa236e114a81173e375a73664610998";

describe("BatchTransfer", () => {
  it("Add tx to batchTransfer calls array", () => {
    const batchTransfer = new BatchTransfer();
    batchTransfer.addTx({
      token: ZERO_ADDRESS,
      tokenEnsHash: "",
      to: ZERO_ADDRESS,
      toEnsHash: "",
      value: "1",
      signer: RANDOM_ADDRESS,
      cancelable: false,
      payable: true,
    });

    expect(batchTransfer.calls.length).to.eq(1);
  });
});
