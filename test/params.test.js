const { defaultAbiCoder } = require("ethers/lib/utils");

describe("Params test", function () {
  it("Params", async () => {
    const encode = defaultAbiCoder.encode(
      ["transfer(address,uint256)"],
      [["0xf88c0381D3a276e90725f46Cb9CB3A6cEaAEA500", "5"]]
    );
    console.log(encode);
    const decoded = defaultAbiCoder.decode(["address", "uint256"], encode);
  });
});
