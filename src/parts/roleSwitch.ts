import type { Role, RoleAnswer, RoleSwitchPart } from '../types/role'
import { drawMark } from './marks'
import '../styles/roleSwitch.css'

const roles: { role: Role; said: string; mark: 'scales' | 'blade'; where: string }[] = [
  { role: 'patron', said: 'Patron', mark: 'scales', where: 'you put up the coin' },
  { role: 'raider', said: 'Raider', mark: 'blade', where: 'you go down' }
]

export function hangTheRoleSwitch(): RoleSwitchPart {
  const swap = document.createElement('div')
  swap.className = 'roles'
  swap.setAttribute('role', 'group')
  swap.setAttribute('aria-label', 'which side you are playing')

  const listeners = new Set<(role: Role) => Promise<RoleAnswer> | RoleAnswer>()
  let asking = false

  const tabs = roles.map((one) => {
    const tab = document.createElement('button')
    tab.type = 'button'
    tab.className = 'roles__tab'
    tab.title = one.where

    tab.append(drawMark({ name: one.mark, size: 15 }))

    const said = document.createElement('span')
    said.textContent = one.said
    tab.append(said)

    tab.addEventListener('click', () => {
      if (asking) {
        return
      }
      asking = true
      barred.hidden = true

      const answers = [...listeners].map((listener) => listener(one.role))

      void Promise.all(answers)
        .then((given) => {
          const trouble = given.find((one) => typeof one === 'string')
          if (trouble) {
            barred.hidden = false
            barred.textContent = trouble
          }
        })
        .finally(() => {
          asking = false
        })
    })

    swap.append(tab)
    return { role: one.role, tab }
  })

  const barred = document.createElement('p')
  barred.className = 'roles__barred'
  barred.hidden = true

  const holder = document.createElement('div')
  holder.className = 'roles__holder'
  holder.append(swap, barred)

  return {
    element: holder,

    showRole(role: Role): void {
      tabs.forEach((one) => {
        one.tab.setAttribute('aria-pressed', one.role === role ? 'true' : 'false')
      })
    },

    showBarred(isBarred: boolean, why: string | null): void {
      tabs.forEach((one) => {
        one.tab.disabled = isBarred
      })
      swap.classList.toggle('roles--barred', isBarred)
      barred.hidden = !isBarred || why === null
      barred.textContent = why ?? ''
    },

    showTrouble(why: string | null): void {
      barred.hidden = why === null
      barred.textContent = why ?? ''
    },

    whenAsked(listener: (role: Role) => Promise<RoleAnswer> | RoleAnswer): void {
      listeners.add(listener)
    },

    teardown(): void {
      listeners.clear()
      holder.remove()
    }
  }
}
