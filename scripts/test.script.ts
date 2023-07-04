import { BatchMultiSigCall } from "../src";
// import FailingFCT from "./Failing.json";

async function main() {
  // const FCT = BatchMultiSigCall.from(FailingFCT);
  const FCT = new BatchMultiSigCall();

  await FCT.create({
    value: "0",
    to: "0x23D560eF20B57A87489D3Ec72D3789E73DF90424",
    method: "multiBalance",
    from: "0x23D560eF20B57A87489D3Ec72D3789E73DF90424",
    params: [
      {
        name: "multiBalance",
        type: "tuple[]",
        customType: true,
        value: [
          [
            { name: "token", type: "address", value: "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60" },
            { name: "account", type: "address", value: "0xBAadCAe3C0a98b42efc3B206A4dd19eAB956E40D" },
          ],
          [
            { name: "token", type: "address", value: "0xdc31ee1784292379fbb2964b3b9c4124d8f89c60" },
            { name: "account", type: "address", value: "0x2dFf96721a29D532508863e168e8e9e8A3dE9ED2" },
          ],
        ],
      },
    ],
    toENS: "@lib:multicall",
    options: { gasLimit: "153768", falseMeansFail: false, callType: "LIBRARY" },
  });

  const fctData = FCT.exportFCT();

  console.log(JSON.stringify(fctData, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
