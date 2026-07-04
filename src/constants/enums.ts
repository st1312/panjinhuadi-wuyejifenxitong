/** 与后端枚举值保持一致，前端仅做展示映射 */

export const MERCHANT_LEVEL = {
  OFFICIAL_CERTIFIED: 'official_certified',
  PROPERTY_CERTIFIED: 'property_certified',
  NORMAL: 'normal'
} as const

export const MERCHANT_LEVEL_LABEL: Record<string, string> = {
  official_certified: '官方认证',
  property_certified: '物业认证',
  normal: '普通商家'
}

export const MERCHANT_AUDIT_STATUS = {
  PENDING: 'pending_audit',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

export const MERCHANT_AUDIT_STATUS_LABEL: Record<string, string> = {
  pending_audit: '待审核',
  approved: '已通过',
  rejected: '已拒绝'
}

export const ANNOUNCEMENT_TYPE = {
  PROPERTY: 'property_announcement',
  COMMUNITY: 'community_announcement',
  PLATFORM: 'platform_announcement',
  SYSTEM: 'system_announcement',
  MERCHANT: 'merchant_announcement',
  ACTIVITY: 'activity_announcement'
} as const

export const ANNOUNCEMENT_TYPE_LABEL: Record<string, string> = {
  property_announcement: '物业公告',
  community_announcement: '社区公告',
  platform_announcement: '统筹公告',
  system_announcement: '系统公告',
  merchant_announcement: '商家公告',
  activity_announcement: '活动组公告'
}

export const ANNOUNCEMENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const

export const ANNOUNCEMENT_STATUS_LABEL: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档'
}

export const USER_ROLE = {
  RESIDENT: 'resident',
  PROPERTY_ADMIN: 'property_admin',
  PLATFORM_ADMIN: 'platform_admin',
  MERCHANT: 'merchant',
  COURIER: 'courier'
} as const

export const RESIDENT_USER_TYPE = {
  OWNER: 'owner',
  TENANT: 'tenant'
} as const

export const RESIDENT_USER_TYPE_LABEL: Record<string, string> = {
  owner: '业主',
  tenant: '租住人员'
}

export const RESIDENT_USER_TYPE_OPTIONS = [
  { value: '', label: '全部身份' },
  { value: RESIDENT_USER_TYPE.OWNER, label: '业主' },
  { value: RESIDENT_USER_TYPE.TENANT, label: '租住人员' }
]

export const RESIDENT_STATUS = {
  ACTIVE: 'active',
  FROZEN: 'frozen',
  DISABLED: 'disabled'
} as const

export const RESIDENT_STATUS_LABEL: Record<string, string> = {
  active: '正常',
  frozen: '已冻结',
  disabled: '已禁用'
}

export const RESIDENT_STATUS_OPTIONS = [
  { value: RESIDENT_STATUS.ACTIVE, label: '正常' },
  { value: RESIDENT_STATUS.FROZEN, label: '冻结' },
  { value: RESIDENT_STATUS.DISABLED, label: '禁用' }
]

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  delivering: '配送中',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款'
}

export const MERCHANT_LEVEL_OPTIONS = Object.entries(MERCHANT_LEVEL_LABEL).map(([value, label]) => ({
  value,
  label
}))

export const ANNOUNCEMENT_TYPE_OPTIONS = Object.entries(ANNOUNCEMENT_TYPE_LABEL).map(([value, label]) => ({
  value,
  label
}))

export const ANNOUNCEMENT_STATUS_OPTIONS = [
  { value: ANNOUNCEMENT_STATUS.PUBLISHED, label: '立即发布' },
  { value: ANNOUNCEMENT_STATUS.DRAFT, label: '存为草稿' }
]

export function getEnumLabel(map: Record<string, string>, value?: string | null, fallback = '-') {
  if (!value) return fallback
  return map[value] ?? value
}
