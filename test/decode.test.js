const { ethers } = require("ethers");

function chunkSubstr(str, size) {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
}

describe("Decode test", () => {
  it("Should decode", async () => {
    const abiCoder = new ethers.utils.AbiCoder();

    const data = abiCoder.encode(["string"], ["this is string"]);

    console.log(
      "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e7468697320697320737472696e67000000000000000000000000000000000000"
        .length
    );

    console.log(chunkSubstr(data.substring(2), 64));

    console.log(data);
  });
});
