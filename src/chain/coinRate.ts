export const coinsPerEther = 100_000

const weiPerEther = 10n ** 18n

export function coinsFromEther(amount: string): number {
  return Math.round(Number(amount) * coinsPerEther)
}

export function weiFromCoins(coins: number): bigint {
  const whole = BigInt(Math.max(0, Math.round(coins)))
  return (whole * weiPerEther) / BigInt(coinsPerEther)
}
