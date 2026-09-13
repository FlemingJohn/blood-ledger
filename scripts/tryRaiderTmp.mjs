import { JsonRpcProvider, Wallet, formatEther } from 'ethers'

const site = 'https://blood-ledger-rosy.vercel.app'
const raider = Wallet.createRandom()

const creditcoin = new JsonRpcProvider('https://rpc.cc3-testnet.creditcoin.network')

console.log(`a brand new raider: ${raider.address}`)
console.log(`   holds ${formatEther(await creditcoin.getBalance(raider.address))} tCTC`)
console.log('')

async function knock(way, body) {
  const answer = await fetch(site + way, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })
  return { code: answer.status, held: await answer.json() }
}

console.log('1. the house backs them as patron')
const backed = await knock('/api/house/patron', { raider: raider.address })

if (backed.code !== 200) {
  console.log(`   REFUSED ${backed.code}: ${JSON.stringify(backed.held).slice(0, 200)}`)
} else {
  console.log(`   staked ${backed.held.backed.coinsStaked} ETH at ${backed.held.backed.patronShare}%`)
  console.log(`   ${backed.held.backed.txHash}`)
}

console.log('')
console.log('2. the house fills their purse for the bond')
const poured = await knock('/api/house/purse', { address: raider.address })

if (poured.code !== 200) {
  console.log(`   REFUSED ${poured.code}: ${JSON.stringify(poured.held).slice(0, 200)}`)
} else {
  poured.held.given.forEach((one) => {
    console.log(`   poured ${one.coins} ${one.coinSymbol} on ${one.shortName}`)
  })
}

console.log('')
console.log(`   raider now holds ${formatEther(await creditcoin.getBalance(raider.address))} tCTC`)
console.log('')
console.log('3. is that enough for the bond?')

const ledger = new (await import('ethers')).Contract(
  '0xBd02a6a9f452217dE9d67B945CB995a6991D1cDD',
  ['function bondFor(address) view returns (uint256)'],
  creditcoin
)

const bond = await ledger.bondFor(raider.address)
const held = await creditcoin.getBalance(raider.address)

console.log(`   bond wanted ${formatEther(bond)} tCTC`)
console.log(`   they hold   ${formatEther(held)} tCTC`)
console.log(`   can post the bond: ${held > bond}`)

console.log('')
console.log('4. asking the seal endpoint to carry the proof')
const sealed = await fetch(site + '/api/seal', { method: 'POST' })
console.log('   ' + JSON.stringify(await sealed.json()).slice(0, 300))
