const { defaultAbiCoder } = require("ethers/lib/utils");

describe("PArams", function () {
  it("Should get length", async () => {
    const encodedData = defaultAbiCoder.encode(["string"], ["uri"]);

    const paramsLength = defaultAbiCoder.encode(["bytes"], [encodedData]).slice(66, 66 + 64);
    console.log(`0x${paramsLength}`);
  });
  it("Should get offset", async () => {
    const dad =
      "0x" +
      defaultAbiCoder
        .encode(
          ["bytes32", "bytes32", "bytes"],
          ["0x" + "0".repeat(64), "0x" + "0".repeat(64), defaultAbiCoder.encode(["string"], ["data"])]
        )
        .slice(128 + 2, 128 + 64 + 2)
        .toString(16);

    console.log(dad);
  });
});
