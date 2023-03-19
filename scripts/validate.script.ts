import { BatchMultiSigCall, ERC20 } from "../src";
// import FCTData from "./FCT_Failed.json";

const chainId = 5;

async function main() {
  // const FCT = BatchMultiSigCall.from(FCTData);
  const FCT = new BatchMultiSigCall();

  const transferFrom = new ERC20.actions.TransferFrom({
    chainId: "5",
    initParams: {
      to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
      methodParams: {
        from: "0x4e9b2f5b4f9a4b4e9b2f5b4f9a4b4e9b2f5b4f9a",
        to: "0x4e9b2f5b4f9a4b4e9b2f5b4f9a4b4e9b2f5b4f9a",
        amount: "1000000000000000000",
      },
    },
  });

  await FCT.createMultiple([
    {
      from: "0x4e9b2f5b4f9a4b4e9b2f5b4f9a4b4e9b2f5b4f9a",
      plugin: transferFrom,
    },
    {
      from: "0x4e9b2f5b4f9a4b4e9b2f5b4f9a4b4e9b2f5b4f9a",
      plugin: transferFrom,
    },
    {
      from: "0x4e9b2f5b4f9a4b4e9b2f5b4f9a4b4e9b2f5b4f9a",
      plugin: transferFrom,
    },
  ]);

  const requiredApprovals = await FCT.utils.getAllRequiredApprovals();
  console.log(requiredApprovals);
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
