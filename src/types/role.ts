export type Role = 'patron' | 'raider'

export type RoleAnswer = string | null

export interface RoleSwitchPart {
  element: HTMLElement
  showRole(role: Role): void
  showBarred(barred: boolean, why: string | null): void
  showTrouble(why: string | null): void
  whenAsked(listener: (role: Role) => Promise<RoleAnswer> | RoleAnswer): void
  teardown(): void
}
