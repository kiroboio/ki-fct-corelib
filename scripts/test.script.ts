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

  const params = [
    [
      [
        {
          name: "token",
          value: "0x...",
          type: "address",
        },
        {
          name: "account",
          value: "0x...",
          type: "address",
        },
      ],
    ],
    {
      name: "randomAddress",
      value: "0x...",
      type: "address",
    },
  ];
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
