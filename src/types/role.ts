export type Role = 'patron' | 'raider'

export type RoleAnswer = string | null

export type SeatState = 'here' | 'open' | 'quiet' | 'barred'

export interface SeatReading {
  count: number
  why: string
  state: SeatState
}

export interface RoleSwitchPart {
  element: HTMLElement
  showRole(role: Role): void
  showSeats(seats: Record<Role, SeatReading>): void
  showBarred(barred: boolean, why: string | null): void
  showTrouble(why: string | null): void
  whenAsked(listener: (role: Role) => Promise<RoleAnswer> | RoleAnswer): void
  teardown(): void
}
