import { realmWherePatronsPay } from './realms'

const vaultLivesAt = import.meta.env.VITE_PATRON_VAULT_ADDRESS ?? ''
const nobody = '0x0000000000000000000000000000000000000000'

export const theVaultIsDeployed = /^0x[0-9a-fA-F]{40}$/.test(vaultLivesAt)

const whatWeAsk = [
  'function nextPactId() view returns (uint256)',
  'function stakes(uint256 pactId) view returns (address patron, address raider, uint256 coinsStaked, uint16 patronShare, uint64 stakedAt, bool reclaimed)'
]

interface VaultAnswers {
  nextPactId(): Promise<bigint>
  stakes(pactId: number): Promise<{
    patron: string
    raider: string
    coinsStaked: bigint
    patronShare: bigint
    stakedAt: bigint
    reclaimed: boolean
  }>
}

let reaching: Promise<VaultAnswers | null> | null = null

async function reachTheVault(): Promise<VaultAnswers | null> {
  if (!theVaultIsDeployed) {
    return null
  }

  try {
    const { JsonRpcProvider, Contract } = await import('ethers')
    const ethereum = new JsonRpcProvider(realmWherePatronsPay.rpcAddress)
    const vault = new Contract(vaultLivesAt, whatWeAsk, ethereum)

    return vault as unknown as VaultAnswers
  } catch {
    return null
  }
}

function held(): Promise<VaultAnswers | null> {
  if (!reaching) {
    reaching = reachTheVault()
  }
  return reaching
}

export interface StakeOnEthereum {
  pactId: number
  patronAddress: string
  raiderAddress: string
  coinsStaked: string
  patronShare: number
  stakedAt: number
  reclaimed: boolean
}

export async function readTheLastStakes(mostWeShow: number): Promise<StakeOnEthereum[]> {
  const vault = await held()

  if (!vault) {
    return []
  }

  try {
    const { formatEther } = await import('ethers')

    const next = Number(await vault.nextPactId())
    const newest = next - 1

    if (newest < 1) {
      return []
    }

    const oldest = Math.max(1, newest - mostWeShow + 1)
    const wanted: number[] = []

    for (let pactId = newest; pactId >= oldest; pactId -= 1) {
      wanted.push(pactId)
    }

    const read = await Promise.all(
      wanted.map(async (pactId) => {
        const stake = await vault.stakes(pactId)

        return {
          pactId,
          patronAddress: stake.patron,
          raiderAddress: stake.raider,
          coinsStaked: formatEther(stake.coinsStaked),
          patronShare: Number(stake.patronShare),
          stakedAt: Number(stake.stakedAt) * 1000,
          reclaimed: stake.reclaimed
        }
      })
    )

    return read.filter((stake) => stake.raiderAddress !== nobody)
  } catch {
    return []
  }
}
