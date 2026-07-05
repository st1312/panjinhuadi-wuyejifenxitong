import type { AuditResult } from '../constants/enums'

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp?: string
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PageResult<T> {
  list: T[]
  pagination: Pagination
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  resident?: UserProfile
}

export interface UserProfile {
  id: string
  name: string
  phone?: string
  avatarUrl?: string
  role: string
  propertyCompanyId?: string
  propertyName?: string
  status?: string
  wechatBound?: boolean
  newUser?: boolean
}

export interface ResidentItem {
  id: string
  name?: string
  phone?: string
  avatarUrl?: string
  gender?: number
  age?: number
  maritalStatus?: string
  hasChildren?: boolean
  role?: string
  userType?: string
  propertyCompanyId?: string
  propertyName?: string
  communityId?: string
  communityName?: string
  building?: string
  unit?: string
  room?: string
  familyId?: string
  pointBalance?: number
  coinBalance?: number
  coinFrozen?: boolean
  coinHidden?: boolean
  wechatBound?: boolean
  totalConsumption?: number
  totalOrders?: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface ResidentCreatePayload {
  name: string
  phone: string
  userType: string
  role: string
  propertyCompanyId: string
  communityId: string
  avatarUrl?: string
  gender?: number
  age?: number
  maritalStatus?: string
  hasChildren?: boolean
  building?: string
  unit?: string
  room?: string
}

export interface ResidentUpdatePayload {
  name?: string
  avatarUrl?: string
  gender?: number
  age?: number
  maritalStatus?: string
  hasChildren?: boolean
  building?: string
  unit?: string
  room?: string
}

export interface ResidentStatusPayload {
  status: string
  reason?: string
}

export interface CoinFreezePayload {
  amount: number
  reason: string
}

export interface CoinFreezeResult {
  id: string
  residentId: string
  residentName: string
  action: string
  amount: number
  reason: string
  operatorId: string
  operatorName: string
  frozenAt: string
}

export interface CoinUnfreezePayload {
  reason: string
  frozenRecordId?: string
}

export interface CoinUnfreezeResult {
  residentId: string
  unfrozenAmount: number
  newBalance: number
  unfrozenAt: string
  operatorId: string
}

export interface CoinFreezeRecordItem {
  id: string
  residentId: string
  residentName: string
  residentPhone?: string
  residentBuilding?: string
  residentRoom?: string
  action: string
  amount: number | string
  reason: string
  operatorId?: string
  createdAt: string
}

export interface MerchantItem {
  id: string
  platformMerchantId?: string
  name: string
  description?: string
  category?: string
  commissionRate?: number
  pointExchangeRate?: number
  coinRebateRate?: number
  memberDiscountPrice?: number | string | null
  auditStatus?: string
  status?: string
  coinRebateEnabled?: boolean
  merchantLevel?: string
  levelWeight?: number
  businessHours?: string
  contactPhone?: string
  address?: string
  deliveryFee?: string | number
  freeDeliveryThreshold?: string | number
  coverUrls?: string[]
  videoUrl?: string | null
  qrCodeUrl?: string
  rankOrder?: number
  createdAt?: string
  updatedAt?: string
  totalOrders?: number
  totalRevenue?: number
}

export interface MerchantUpdatePayload {
  name?: string
  description?: string
  coverUrls?: string[]
  videoUrl?: string
  businessHours?: string
  contactPhone?: string
  address?: string
  deliveryFee?: number | string
  freeDeliveryThreshold?: number | string
  rankOrder?: number
}

export interface PlatformMerchantLinkedProperty {
  propertyCompanyId: string
  propertyName: string
  linkedAt: string
}

export interface PlatformMerchantItem {
  id: string
  name: string
  category?: string
  contactPhone?: string
  description?: string
  coverUrl?: string
  businessHours?: string
  address?: string
  status?: string
  linkedPropertyCount?: number
  linkedProperties?: PlatformMerchantLinkedProperty[]
  createdAt?: string
  updatedAt?: string
}

export interface PlatformMerchantCreatePayload {
  name: string
  category: string
  contactPhone: string
  description?: string
  coverUrl?: string
  businessHours?: string
  address?: string
}

export interface PlatformMerchantUpdatePayload {
  name?: string
  category?: string
  contactPhone?: string
  description?: string
  coverUrl?: string
  businessHours?: string
  address?: string
  status?: string
}

export interface MerchantKickPayload {
  reason: string
  notifyMerchant?: boolean
}

export interface MerchantKickResult {
  merchantId: string
  merchantName: string
  status: string
  reason: string
  kickedAt: string
  operatorId?: string
  notifySent?: boolean
}

export interface MerchantAuditPayload {
  auditResult: AuditResult
  rejectReason?: string
  remark?: string
  merchantLevel?: string
  category?: string
  businessHours?: string
  deliveryFee?: string
  freeDeliveryThreshold?: string
}

export interface MerchantAuditResult {
  id: string
  name: string
  auditStatus: string
  auditResult: string
  rejectReason?: string | null
  merchantLevel?: string
  category?: string
  operatorId?: string
  operatorName?: string | null
  auditedAt?: string
}

export interface MerchantProfitSpace {
  platformMerchantId?: string
  platformMerchantName?: string
  propertyCompanyId?: string
  propertyName?: string
  period?: string
  startDate?: string
  endDate?: string
  metrics?: {
    totalOrders?: number
    totalRevenue?: number
    totalCommission?: number
    totalDeliveryFee?: number
    totalPointCost?: number
    totalCoinCost?: number
    netProfit?: number
    profitMargin?: number
  }
  breakdown?: {
    propertyShare?: number
    coordinatorShare?: number
    sectorLeaderShare?: number
    individualLeaderShare?: number
    platformShare?: number
  }
  comparison?: {
    lastPeriodRevenue?: number
    revenueGrowthRate?: number
    lastPeriodProfit?: number
    profitGrowthRate?: number
  }
}

export interface AnnouncementItem {
  id: string
  title: string
  content?: string
  announcementType?: string
  targetBuildings?: string[]
  status?: string
  publishedAt?: string
  createdAt?: string
  publisherName?: string
  publisher?: string
}

export interface AnnouncementCreatePayload {
  title: string
  content: string
  announcementType: string
  propertyCompanyId?: string
  communityId?: string
  merchantId?: string
  coverUrls?: string[]
  targetRoles?: string[]
  targetBuildings?: string[]
  collectEnabled?: boolean
  collectFields?: unknown[]
  status?: string
}

export interface OperationLogItem {
  id?: string
  createdAt?: string
  time?: string
  operatorId?: string
  operatorName?: string
  operator?: string
  action?: string
  module?: string
  content?: string
  description?: string
  targetName?: string
  target?: string
  targetId?: string
  result?: string | boolean
  status?: string
  success?: boolean
}

export interface PermissionItemDto {
  code: string
  name: string
  module?: string
  action?: string
  description?: string
  category?: string
  group?: string
  enabled?: boolean
  granted?: boolean
}

export interface RolePresetDto {
  id: string
  code?: string
  name: string
  role?: string
  permissionCodes?: string[]
  permissions?: string[]
  isDefault?: boolean
  createdAt?: string
}

export interface AdminUserAccount {
  id: string
  name: string
  phone?: string
  role: string
  propertyCompanyId?: string
  status?: string
  effectivePermissionCount?: number
}

export interface UserPermissionsDetail {
  userId: string
  userName?: string
  role?: string
  rolePresetId?: string
  rolePresetName?: string
  effectivePermissions?: string[]
  grantedPermissions?: Array<{ code: string; reason?: string; grantedAt?: string }>
  revokedPermissions?: Array<{ code: string; reason?: string; revokedAt?: string }>
}

export interface PermissionChangeLog {
  id?: string
  userId?: string
  userName?: string
  operatorId?: string
  operatorName?: string
  action?: string
  permissionCode?: string
  reason?: string
  createdAt?: string
  targetName?: string
  targetUserName?: string
  content?: string
  changeContent?: string
}

export interface LeaderItem {
  id: string
  name: string
  role?: string
  roleName?: string
  phone?: string
  sector?: string
}

export interface DeliveryRule {
  id: string
  name?: string
  baseFee?: number
  perKgFee?: number
  courierPerOrder?: number
  propertyCompanyId?: string
}

export interface PropertyCompanyDetail {
  id: string
  name?: string
  config?: PropertyCompanyConfig
}

export interface PropertyCompanyItem {
  id: string
  name: string
  logoUrl?: string
  contactPhone?: string
  address?: string
  communityCount?: number
  status?: string
  createdAt?: string
}

export interface PropertyCompanyConfig {
  propertyShareRate?: number
  coordinatorShareRate?: number
  coinDisplayEnabled?: boolean
  coinExpiryDays?: number
  deliveryBaseFee?: number
  deliveryCourierPerOrder?: number
  deliveryPerKgFee?: number
  perKgFee?: number
  twoYearClearEnabled?: boolean
  pointExchangeRate?: number
  pointToFeeRate?: number
}

export interface PointPool {
  propertyCompanyId?: string
  propertyCompanyName?: string
  balance?: number
  totalIn?: number
  totalOut?: number
  equivalentAmount?: number
  updatedAt?: string
}

export interface DashboardOverview {
  /** 实际接口扁平字段 */
  totalResidents?: number
  totalFamilies?: number
  totalMerchants?: number
  propertyFeeCollectionRate?: number
  coinTotalIssued?: number
  frozenCoinCount?: number
  monthlyConsumption?: number
  pendingAuditCount?: number
  pointPoolBalance?: number
  /** 文档嵌套结构（兼容） */
  period?: string
  startDate?: string
  endDate?: string
  summary?: {
    totalOrders?: number
    totalRevenue?: number
    totalResidents?: number
    activeResidents?: number
    newResidents?: number
    totalMerchants?: number
    activeMerchants?: number
    totalPointsIssued?: number
    totalPointsRedeemed?: number
    totalCoinIssued?: number
    totalCoinRedeemed?: number
    propertyFeeCollectionRate?: number
    propertyFeeAmount?: number
    propertyFeeCollected?: number
  }
  trends?: {
    orderGrowthRate?: number
    revenueGrowthRate?: number
    residentGrowthRate?: number
    merchantGrowthRate?: number
  }
  topMerchants?: Array<{
    merchantId?: string
    merchantName?: string
    orderCount?: number
    revenue?: number
  }>
  recentActivity?: Array<{
    type?: string
    description?: string
    timestamp?: string
  }>
}

export interface ReportsOverview {
  scope?: {
    propertyCompanyId?: string
    propertyCompanyName?: string
  }
  summary?: {
    residentCount?: number
    merchantCount?: number
    pointPoolBalance?: number
    propertyCoinCirculation?: number
    propertyFeeCollectionRate?: number
    totalConsumptionAmount?: number
  }
  comparison?: {
    consumptionGrowthRate?: number
    residentGrowthRate?: number
    orderGrowthRate?: number
  }
}

export interface DeliveryOrderItem {
  id?: string
  createdAt?: string
  time?: string
  residentName?: string
  userName?: string
  room?: string
  productName?: string
  product?: string
  deliveryFee?: number
  fee?: number | string
  status?: string
}

export interface DeliveryTaskItem {
  id: string
  courierName?: string
  courierId?: string
  status?: string
  createdAt?: string
}

export interface OrderItem {
  id: string
  createdAt?: string
  residentName?: string
  room?: string
  productSummary?: string
  totalAmount?: number
  deliveryFee?: number
  status?: string
}
