import { SignTypedDataVersion, TypedDataUtils } from "@metamask/eth-sig-util";
import { defaultAbiCoder } from "ethers/lib/utils";

import { BatchMultiSigCall, ethers } from "../src";
import FCTData from "./FailingFCTExport.json";

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const address = FCT.utils.recoverAddress(FCTData.signatures[0]);
  console.log(address, "0x991e5E72D9aCC110B1D8D2AA06C26931eE8CF330");

  // TypeHash + keccak256(metaData)
  // 0x770643388109cd4689d1ca6ec1d9953ff528ad26cf49bbac8525e00cb4253c84bad293675eb502d22ed3e8df2e1e64c9aa2020646e6fad75bbb7e6a70f2618c2
  // 0x770643388109cd4689d1ca6ec1d9953ff528ad26cf49bbac8525e00cb4253c84d77880d74a9dfc3f7ec89dc22332b57a8659419afe49bb829ea521b9c6321a61
  const metaData = TypedDataUtils.encodeData(
    "Meta",
    FCTData.typedData.message.meta,
    FCTData.typedData.types,
    SignTypedDataVersion.V4
  );

  // EncodePacked typehash and metaData
  const data = defaultAbiCoder.encode(["bytes32", "bytes32"], [FCTData.typeHash, ethers.utils.keccak256(metaData)]);

  console.log(data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
