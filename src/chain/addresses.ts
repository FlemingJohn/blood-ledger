export function shortAddress(address: string): string {
  if (address.length <= 12) {
    return address
  }
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function countCoins(amount: number): string {
  return amount.toLocaleString('en-GB')
}

export function signedCoins(amount: number): string {
  const sign = amount < 0 ? '−' : '+'
  return `${sign}${countCoins(Math.abs(amount))}`
}
