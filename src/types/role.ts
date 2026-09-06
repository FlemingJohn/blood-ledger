export type Role = 'patron' | 'raider'

export interface RoleSwitchPart {
  element: HTMLElement
  showRole(role: Role): void
  showBarred(barred: boolean, why: string | null): void
  whenAsked(listener: (role: Role) => void): void
  teardown(): void
}
