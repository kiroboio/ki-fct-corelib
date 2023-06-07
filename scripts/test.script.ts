import { BatchMultiSigCall } from "../src";

async function main() {
  const FCT = new BatchMultiSigCall();

  // const data = await FCT.create({
  //   from: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
  //   to: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
  //   value: "10",
  //   method: "balanceOf",
  // } as const);
  //
  // data.value;

  const data = await FCT.create({
    from: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
    to: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
    value: "10",
    method: "balanceOf",
  } as const);

  const data = await FCT.create({
    from: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
    to: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
  } as const);

  const options = FCT.setOptions({
    name: "Test",
  } as const);

  const callDefaults = FCT.setCallDefaults({
    from: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
  } as const);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
