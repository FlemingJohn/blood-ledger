export interface InjectedPurse {
  isMetaMask?: boolean
  request(call: { method: string; params?: unknown[] }): Promise<unknown>
  on(event: string, listener: (...payload: unknown[]) => void): void
  removeListener(event: string, listener: (...payload: unknown[]) => void): void
}

declare global {
  interface Window {
    ethereum?: InjectedPurse
  }
}
