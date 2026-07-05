/** 与《前后端对齐规范》§5.1 保持一致，API 交互使用 snake_case 字符串常量，前端仅做展示映射 */

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

/** 审核操作结果（POST /admin/merchants/{id}/audit 的 auditResult） */
export const AUDIT_RESULT = {
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

export const MERCHANT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  KICKED: 'kicked'
} as const

export const MERCHANT_STATUS_LABEL: Record<string, string> = {
  active: '营业中',
  inactive: '已停业',
  kicked: '已踢出'
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

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDING: 'refunding',
  REFUNDED: 'refunded'
} as const

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  delivering: '配送中',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款'
}

export const VOTE_OPTION = {
  SUPPORT: 'support',
  OPPOSE: 'oppose',
  ABSTAIN: 'abstain'
} as const

export const VOTE_OPTION_LABEL: Record<string, string> = {
  support: '支持',
  oppose: '反对',
  abstain: '弃权'
}

export const USER_ROLE = {
  RESIDENT: 'resident',
  PROPERTY_ADMIN: 'property_admin',
  PLATFORM_ADMIN: 'platform_admin',
  MERCHANT: 'merchant',
  COURIER: 'courier',
  ACTIVITY_LEADER: 'activity_leader',
  TECHNICIAN: 'technician'
} as const

export const MESSAGE_TYPE = {
  PROPERTY: 'property_message',
  PLATFORM: 'platform_message',
  SYSTEM: 'system_message',
  COMMUNITY: 'community_message',
  RESIDENT: 'resident_message',
  TECHNICIAN: 'technician_message'
} as const

export const MESSAGE_TYPE_LABEL: Record<string, string> = {
  property_message: '物业消息',
  platform_message: '统筹消息',
  system_message: '系统消息',
  community_message: '社区消息',
  resident_message: '业主消息',
  technician_message: '技工消息'
}

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

/** 通用实体启用状态（物业公司等资源的 status 查询参数） */
export const ENTITY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const

export const PERMISSION_MODULE_LABEL: Record<string, string> = {
  resident: '住户管理',
  merchant: '商家管理',
  reports: '报表数据',
  announcements: '通告管理',
  point_pool: '积分池',
  coordinator: '统筹管理',
  delivery: '配送管理',
  property_company: '物业公司',
  permission: '权限管理',
  activity: '活动管理',
  notice: '通知收集',
  refund: '退款审批',
  coin: '物业币'
}

export const ROLE_LABEL: Record<string, string> = {
  [USER_ROLE.PLATFORM_ADMIN]: '平台管理员',
  [USER_ROLE.PROPERTY_ADMIN]: '物业管理员',
  [USER_ROLE.RESIDENT]: '住户',
  [USER_ROLE.MERCHANT]: '商家',
  [USER_ROLE.COURIER]: '快递员',
  [USER_ROLE.ACTIVITY_LEADER]: '活动组组长',
  [USER_ROLE.TECHNICIAN]: '技工',
  coordinator: '统筹',
  sector_leader: '板块负责人',
  individual_leader: '个体负责人',
  community_manager: '社区管理员',
  property_employee: '物业员工'
}

export const RESIDENT_STATUS_OPTIONS = [
  { value: RESIDENT_STATUS.ACTIVE, label: '正常' },
  { value: RESIDENT_STATUS.FROZEN, label: '冻结' },
  { value: RESIDENT_STATUS.DISABLED, label: '禁用' }
]

export const MARITAL_STATUS = {
  SINGLE: 'single',
  MARRIED: 'married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed'
} as const

export const MARITAL_STATUS_LABEL: Record<string, string> = {
  single: '未婚',
  married: '已婚',
  divorced: '离异',
  widowed: '丧偶'
}

export const MARITAL_STATUS_OPTIONS = [
  { value: '', label: '未填写' },
  ...Object.entries(MARITAL_STATUS_LABEL).map(([value, label]) => ({ value, label }))
]

export const MERCHANT_AUDIT_STATUS_OPTIONS = [
  { value: '', label: '全部审核状态' },
  { value: MERCHANT_AUDIT_STATUS.PENDING, label: '待审核' },
  { value: MERCHANT_AUDIT_STATUS.APPROVED, label: '已通过' },
  { value: MERCHANT_AUDIT_STATUS.REJECTED, label: '已拒绝' }
]

export const PLATFORM_MERCHANT_STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: MERCHANT_STATUS.ACTIVE, label: '营业中' },
  { value: MERCHANT_STATUS.INACTIVE, label: '已停业' }
]

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

export const COIN_ISSUE_MODE = {
  AUTO: 'auto',
  MANUAL: 'manual'
} as const

export const COIN_ISSUE_MODE_LABEL: Record<string, string> = {
  auto: '自动发放',
  manual: '手动发放'
}

export const COIN_ISSUE_MODE_OPTIONS = Object.entries(COIN_ISSUE_MODE_LABEL).map(([value, label]) => ({
  value,
  label
}))

export const COURIER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline'
} as const

export const COURIER_STATUS_LABEL: Record<string, string> = {
  online: '在线',
  offline: '离线'
}

export const DELIVERY_STATUS = {
  PENDING: 'pending',
  GRABBED: 'grabbed',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export const DELIVERY_STATUS_LABEL: Record<string, string> = {
  pending: '待抢单',
  grabbed: '已抢单',
  delivering: '配送中',
  delivered: '已送达',
  completed: '已完成',
  cancelled: '已取消'
}

export const DELIVERY_CAPACITY_DIMENSION = {
  H24: '24h',
  D7: '7d'
} as const

export type AuditResult = (typeof AUDIT_RESULT)[keyof typeof AUDIT_RESULT]

export function getEnumLabel(map: Record<string, string>, value?: string | null, fallback = '-') {
  if (!value) return fallback
  return map[value] ?? value
}
