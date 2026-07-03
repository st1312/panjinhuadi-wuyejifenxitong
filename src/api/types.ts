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
  name: string
  phone?: string
  avatarUrl?: string
  role?: string
  userType?: string
  communityName?: string
  building?: string
  unit?: string
  room?: string
  familyId?: string
  pointBalance?: number
  coinBalance?: number
  coinFrozen?: boolean
  status?: string
  createdAt?: string
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
  businessHours?: string
  contactPhone?: string
  address?: string
  deliveryFee?: string | number
  freeDeliveryThreshold?: string | number
}

export interface MerchantAuditPayload {
  auditResult: 'approved' | 'rejected'
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
  id: string
  code?: string
  name: string
  category?: string
  group?: string
  enabled?: boolean
  granted?: boolean
}

export interface RolePresetDto {
  id: string
  code?: string
  name: string
  permissions?: string[]
}

export interface PermissionChangeLog {
  id?: string
  createdAt?: string
  operatorName?: string
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
  balance?: number
  equivalentAmount?: number
  totalIn?: number
  totalOut?: number
}

export interface DashboardOverview {
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
