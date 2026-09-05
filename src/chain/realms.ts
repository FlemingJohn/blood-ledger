import type { Realm } from '../types/realm'

export const creditcoinTestnet: Realm = {
  name: 'Creditcoin CC3 Testnet',
  chainNumber: 102031,
  rpcAddress: 'https://rpc.cc3-testnet.creditcoin.network',
  explorerAddress: 'https://creditcoin-testnet.blockscout.com',
  coinName: 'Testnet Creditcoin',
  coinSymbol: 'tCTC',
  coinDecimals: 18
}

export const ethereumSepolia: Realm = {
  name: 'Ethereum Sepolia',
  chainNumber: 11155111,
  rpcAddress: 'https://rpc.sepolia.org',
  explorerAddress: 'https://sepolia.etherscan.io',
  coinName: 'Sepolia Ether',
  coinSymbol: 'ETH',
  coinDecimals: 18
}

export const homeRealm = creditcoinTestnet

export const realmWherePatronsPay = ethereumSepolia

export function chainNumberAsHex(realm: Realm): string {
  return `0x${realm.chainNumber.toString(16)}`
}
