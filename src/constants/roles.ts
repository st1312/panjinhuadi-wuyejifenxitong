import { USER_ROLE } from './enums'
import {
  adminMenus,
  coordinatorMenus,
  courierMenus,
  individualLeaderMenus,
  merchantMenus,
  sectorLeaderMenus,
  type Menu
} from './menus'

export const ADMIN_ROLES = [USER_ROLE.PLATFORM_ADMIN, USER_ROLE.PROPERTY_ADMIN] as const

const ROLE_MENUS: Record<string, Menu[]> = {
  [USER_ROLE.PLATFORM_ADMIN]: adminMenus,
  [USER_ROLE.PROPERTY_ADMIN]: adminMenus,
  [USER_ROLE.MERCHANT]: merchantMenus,
  [USER_ROLE.COURIER]: courierMenus,
  [USER_ROLE.COORDINATOR]: coordinatorMenus,
  [USER_ROLE.SECTOR_LEADER]: sectorLeaderMenus,
  [USER_ROLE.INDIVIDUAL_LEADER]: individualLeaderMenus
}

const PORTAL_SUBTITLE: Record<string, string> = {
  [USER_ROLE.PLATFORM_ADMIN]: '管理后台',
  [USER_ROLE.PROPERTY_ADMIN]: '管理后台',
  [USER_ROLE.MERCHANT]: '商家工作台',
  [USER_ROLE.COURIER]: '配送工作台',
  [USER_ROLE.COORDINATOR]: '统筹工作台',
  [USER_ROLE.SECTOR_LEADER]: '板块工作台',
  [USER_ROLE.INDIVIDUAL_LEADER]: '个体工作台'
}

export function getRoleHomeRoute(role?: string | null): string {
  switch (role) {
    case USER_ROLE.MERCHANT:
      return 'merchant-overview'
    case USER_ROLE.COURIER:
      return 'courier-available'
    case USER_ROLE.COORDINATOR:
      return 'coordinator-overview'
    case USER_ROLE.SECTOR_LEADER:
      return 'sector-leader-overview'
    case USER_ROLE.INDIVIDUAL_LEADER:
      return 'individual-leader-overview'
    case USER_ROLE.PLATFORM_ADMIN:
    case USER_ROLE.PROPERTY_ADMIN:
    default:
      return 'dashboard'
  }
}

export function getMenusForRole(role?: string | null): Menu[] {
  if (!role) return adminMenus
  return ROLE_MENUS[role] || adminMenus
}

export function getPortalSubtitle(role?: string | null): string {
  if (!role) return '管理后台'
  return PORTAL_SUBTITLE[role] || '工作台'
}

export function canAccessRoute(role: string | undefined | null, allowedRoles?: string[]): boolean {
  if (!allowedRoles?.length) return true
  if (!role) return false
  return allowedRoles.includes(role)
}

export function isAdminRole(role?: string | null): boolean {
  return role === USER_ROLE.PLATFORM_ADMIN || role === USER_ROLE.PROPERTY_ADMIN
}

/** GET /auth/profile 仅以下角色可调用 */
export const PROFILE_API_ROLES = [
  USER_ROLE.RESIDENT,
  USER_ROLE.PROPERTY_ADMIN,
  USER_ROLE.PLATFORM_ADMIN
] as const

export function canUseProfileApi(role?: string | null): boolean {
  if (!role) return false
  return (PROFILE_API_ROLES as readonly string[]).includes(role)
}
