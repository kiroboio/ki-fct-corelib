export const secureStorageAddresses = [
  { address: "0x039987486206d32aB55BE53c2748121a6559aAdE", chainId: "1" },
  { address: "0x4FEe9fc300DFF6221e5911f296c4CaA3d23A7830", chainId: "5" },
  { address: "0xF71396c6F168Dc1c213AA9433cB0E7C1e4B07964", chainId: "11155111" },
  { address: "0x5fbFd001C9571BDFd8995f3ABb385C07E7A53150", chainId: "1" },
  { address: "0xA17aC61C3888c15D09d641Be62DdEA0809108A6f", chainId: "42161" },
  { address: "0xB2017BA31D3dC97910b8F44d3F5BfaCeE0BD2a6B", chainId: "10" },
  { address: "0x30B25912faeb6E9B70c1FD9F395D2fF2083C966C", chainId: "8453" },
  { address: "0xCb1788C494EAa23A89836d977066d3016C8E14fC", chainId: "11155111" },
] as const;

export const SecureStorageAddressesSet = new Set(
  secureStorageAddresses.map((address) => address.address.toLowerCase()),
);
