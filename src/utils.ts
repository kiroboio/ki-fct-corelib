import Web3 from "web3";

const web3 = new Web3();

function verifyMessage(message: string, signature: string, address: string) {
  const messageAddress = web3.eth.accounts.recover(message, signature);
  return messageAddress.toLowerCase() === address.toLowerCase();
}

function decodeSessionId(sessionId: string) {
  sessionId = sessionId.replace("0x", "");

  return {
    group: parseInt(sessionId.substring(0, 6), 16),
    nonce: parseInt(sessionId.substring(6, 16), 16),
    afterTimestamp: parseInt(sessionId.substring(16, 26), 16),
    beforeTimestamp: parseInt(sessionId.substring(26, 36), 16),
    gasLimit: parseInt(sessionId.substring(36, 44), 16),
    maxGasPrice: parseInt(sessionId.substring(44, 60), 16),
    flags: sessionId.substring(60, 64),
  };
}

export default { verifyMessage, decodeSessionId };
