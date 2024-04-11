## Add new network

1. Add FCT system addresses to `src/constants/address.ts` file.
2. Add domain typed data to EIP712 class. Use `scripts/getDomainData.ts` script to get the domain data easily.
3. Add multicall address of the network to `src/constants/misc.ts` file.
4. Set gas precentiles in `src/utils/gas.ts` file.
