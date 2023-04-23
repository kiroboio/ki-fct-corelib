import { BatchMultiSigCall, ChainId, ERC20, ethers } from "../src";
import scriptData from "./scriptData";

const getERC20Plugin = ({ chainId }: { chainId: number }) =>
  new ERC20.actions.Transfer({
    chainId: chainId.toString() as ChainId,
    initParams: {
      to: scriptData[chainId as keyof typeof scriptData].USDC,
      methodParams: {
        recipient: ethers.constants.AddressZero,
        amount: ethers.utils.parseEther("1").toString(),
      },
    },
  });

// Create a function called "getRandomAddress" that generates random Ethereum address
// Hint: use ethers.utils.randomBytes(20)
function getRandomAddress() {
  return ethers.utils.getAddress(ethers.utils.hexlify(ethers.utils.randomBytes(20)));
}

async function main() {
  const FCT = new BatchMultiSigCall();

  const ethPriceInKIRO = BigInt("0x62eb71d53b26def2939").toString();

  const randomAddress1 = getRandomAddress();
  const randomAddress2 = getRandomAddress();

  console.log({
    randomAddress1,
    randomAddress2,
  });

  const plugin = getERC20Plugin({
    chainId: 5,
  });

  await FCT.createMultiple([
    {
      nodeId: "1",
      from: randomAddress1,
      plugin,
      options: {
        jumpOnSuccess: "3",
      },
    },
    {
      nodeId: "2",
      from: randomAddress1,
      plugin,
    },
    {
      nodeId: "3",
      from: randomAddress2,
      plugin,
    },
  ]);

  const paymentPerPayer = FCT.utils.getPaymentPerPayer({
    ethPriceInKIRO,
  });

  console.log(paymentPerPayer);
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
