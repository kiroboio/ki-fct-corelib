import * as dotenv from "dotenv";

import FCTControllerABI from "../src/abi/FCT_Controller.abi.json";
import { ethers, utils } from "../src/index";
import scriptData from "./scriptData";

dotenv.config();

const chainId = 5;

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(scriptData[chainId].rpcUrl);

  const FCTController = new ethers.Contract("0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7", FCTControllerABI, provider);

  const data = {
    name: await FCTController.NAME(),
    version: await FCTController.VERSION(),
    chainId: 5,
    verifyingContract: FCTController.address,
    salt: await FCTController.UID(),
  };

  console.log(data);

  const fetchUtil = new utils.FetchUtility({
    rpcUrl: scriptData[5].rpcUrl,
    provider: new ethers.providers.JsonRpcProvider(scriptData[5].rpcUrl),
    chainId: 5,
  });

  const totalSupplies = await fetchUtil.getTokensTotalSupply([]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
