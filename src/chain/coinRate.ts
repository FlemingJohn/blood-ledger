export const coinsPerEther = 100_000

const weiPerEther = 10n ** 18n

export function coinsFromEther(amount: string): number {
  return Math.round(Number(amount) * coinsPerEther)
}

export function coinsFromWei(wei: bigint | number | string): number {
  const held = typeof wei === 'bigint' ? wei : BigInt(String(wei))
  const perCoin = weiPerEther / BigInt(coinsPerEther)

  return Number(held / perCoin)
}

export function weiFromCoins(coins: number): bigint {
  const whole = BigInt(Math.max(0, Math.round(coins)))
  return (whole * weiPerEther) / BigInt(coinsPerEther)
}
