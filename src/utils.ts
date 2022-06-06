import Web3 from "web3";

const web3 = new Web3();

function verifyMessage(message: string, signature: string, address: string) {
  const messageAddress = web3.eth.accounts.recover(message, signature);
  return messageAddress.toLowerCase() === address.toLowerCase();
}

export default { verifyMessage };
