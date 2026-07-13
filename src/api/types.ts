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
  communityId?: string
  communityName?: string
  coordinatorId?: string
  sectorLeaderId?: string
  individualLeaderId?: string
  status?: string
  wechatBound?: boolean
  newUser?: boolean
  pointBalance?: number
  coinBalance?: number
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
  reason?: string
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
  reason?: string
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
  propertyCompanyId?: string
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
  merchantLevel?: string
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
  merchantId?: string
  merchantName?: string
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

export interface AnnouncementCollectField {
  name: string
  label: string
  type: string
}

export interface AnnouncementItem {
  id: string
  title: string
  content?: string
  announcementType?: string
  propertyCompanyId?: string
  communityId?: string
  merchantId?: string | null
  coverUrls?: string[]
  targetRoles?: string[]
  targetBuildings?: string[]
  collectEnabled?: boolean
  collectFields?: AnnouncementCollectField[]
  status?: string
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
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
  collectFields?: AnnouncementCollectField[]
  status?: string
}

export interface AnnouncementUpdatePayload {
  title?: string
  content?: string
  announcementType?: string
  communityId?: string
  coverUrls?: string[]
  targetRoles?: string[]
  targetBuildings?: string[]
  collectEnabled?: boolean
  collectFields?: AnnouncementCollectField[]
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

export interface PropertyCompanyCommunity {
  id: string
  name?: string
  address?: string
  totalBuildings?: number
  totalUnits?: number
  status?: string
  createdAt?: string
}

export interface PropertyCompanyAdmin {
  id: string
  name?: string
  phone?: string
  role?: string
}

export interface PropertyCompanyDetail {
  id: string
  name?: string
  logoUrl?: string
  contactPhone?: string
  address?: string
  status?: string
  communityCount?: number
  config?: PropertyCompanyConfig
  communities?: PropertyCompanyCommunity[]
  admins?: PropertyCompanyAdmin[]
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
  sectorLeaderRate?: number
  individualLeaderRate?: number
  coinDisplayEnabled?: boolean
  coinIssueMode?: string
  coinExpiryDays?: number
  coinFreezeDefault?: boolean
  deliveryBaseFee?: number
  deliveryCourierShareRate?: number
  deliveryCourierPerOrder?: number
  withdrawalFeeRate?: number
  pointToFeeRate?: number
  twoYearClearEnabled?: boolean
  neighborDailyContactLimit?: number
  /** GET 响应可能包含 */
  pointExchangeRate?: number
  deliveryPerKgFee?: number
  perKgFee?: number
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
    totalFamilies?: number
    activeResidents?: number
    newResidents?: number
    totalMerchants?: number
    activeMerchants?: number
    totalPointsIssued?: number
    totalPointsRedeemed?: number
    totalCoinIssued?: number
    coinConsumed?: number
    coinInCirculation?: number
    totalCoinRedeemed?: number
    propertyFeeCollectionRate?: number
    propertyFeeAmount?: number
    propertyFeeCollected?: number
  }
  trends?: {
    orderGrowthRate?: number
    revenueGrowthRate?: number
    residentGrowthRate?: number
    newResidentGrowthRate?: number
    merchantGrowthRate?: number
  }
  topMerchants?: Array<{
    id?: string
    name?: string
    merchantId?: string
    merchantName?: string
    orderCount?: number
    revenue?: number
  }>
  recentActivity?: Array<{
    type?: string
    description?: string
    time?: string
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

export interface DeliveryTodayStats {
  todayOrders?: number
  orderGrowth?: number
  onlineCouriers?: number
  totalCouriers?: number
  todayDeliveryFee?: number
  capacityLoad?: number
}

export interface DeliveryCourierItem {
  id: string
  name?: string
  todayCompleted?: number
  monthIncome?: number
  status?: string
}

export interface RecentDeliveryItem {
  id?: string
  time?: string
  residentName?: string
  productDesc?: string
  fee?: number
  status?: string
}

export interface DeliveryOverview {
  todayStats?: DeliveryTodayStats
  couriers?: DeliveryCourierItem[]
  recentDeliveries?: RecentDeliveryItem[]
}

export interface DeliveryHourlyData {
  hour?: number
  label?: string
  deliveryCount?: number
  avgResponseMinutes?: number
}

export interface DeliveryCapacity {
  dimension?: string
  peakHour?: string
  hourlyData?: DeliveryHourlyData[]
}

export interface DeliveryTaskItem {
  id: string
  courierName?: string
  courierId?: string
  status?: string
  createdAt?: string
}

export interface OrderLineItem {
  productId?: string
  productName?: string
  coverUrl?: string
  quantity?: number
  price?: number
  subtotal?: number
}

export interface OrderItem {
  id: string
  orderNo?: string
  createdAt?: string
  updatedAt?: string
  residentId?: string
  residentName?: string
  merchantId?: string
  merchantName?: string
  room?: string
  productSummary?: string
  items?: OrderLineItem[]
  totalAmount?: number
  deliveryFee?: number
  paymentMethod?: string
  pointUsed?: number
  coinUsed?: number
  cashAmount?: number
  deliveryAddress?: string
  contactPhone?: string
  remark?: string
  courierId?: string | null
  courierName?: string | null
  deliveryId?: string | null
  paidAt?: string | null
  completedAt?: string | null
  cancelledAt?: string | null
  orderStatus?: string
  status?: string
}

export interface MyMerchantDetail {
  id: string
  platformMerchantId?: string
  name: string
  description?: string
  coverUrls?: string[]
  videoUrl?: string | null
  merchantLevel?: string
  category?: string
  businessHours?: string
  contactPhone?: string
  address?: string
  deliveryFee?: number
  freeDeliveryThreshold?: number
  auditStatus?: string
  status?: string
  totalOrders?: number
  totalRevenue?: number
  products?: ProductItem[]
  createdAt?: string
  updatedAt?: string
}

export interface ProductItem {
  id: string
  merchantId?: string
  merchantName?: string
  name: string
  description?: string
  coverUrl?: string
  price?: number
  memberPrice?: number
  pointPrice?: number
  stock?: number
  category?: string
  status?: string
  salesCount?: number
  createdAt?: string
}

export interface ProductCreatePayload {
  name: string
  description?: string
  coverUrl?: string
  price: number
  memberPrice?: number
  pointPrice?: number
  stock?: number
  category?: string
  status?: string
}

export interface ProductUpdatePayload {
  name?: string
  description?: string
  coverUrl?: string
  price?: number
  memberPrice?: number
  pointPrice?: number
  stock?: number
  category?: string
  status?: string
}

export interface MerchantPointPurchaseItem {
  id: string
  merchantId?: string
  merchantName?: string
  pointAmount?: number
  remainingPoints?: number
  payAmount?: number
  status?: string
  auditRemark?: string
  createdAt?: string
  auditedAt?: string
}

export interface MerchantPointPurchasePayload {
  pointAmount: number
  payAmount: number
}

export interface MerchantPointGrantPayload {
  residentId: string
  pointAmount: number
  description?: string
}

export interface MerchantWithdrawalItem {
  id: string
  merchantId?: string
  merchantName?: string
  amount?: number
  feeRate?: number
  feeAmount?: number
  actualAmount?: number
  status?: string
  createdAt?: string
  completedAt?: string
}

/** 管理员 - 积分购买审核记录 */
export interface AdminMerchantPointPurchaseItem {
  id: string
  merchantId: string
  merchantName: string
  pointAmount: number
  payAmount: number
  status: string
  createdAt: string
  auditRemark?: string
  auditedAt?: string
  operatorId?: string
  auditResult?: string
}

/** 管理员 - 积分购买审核请求体 */
export interface AdminPointPurchaseAuditPayload {
  auditResult: string
  rejectReason?: string
  remark?: string
}

/** 管理员 - 积分购买审核结果 */
export interface AdminPointPurchaseAuditResult {
  id: string
  merchantId: string
  merchantName: string
  pointAmount: number
  payAmount: number
  status: string
  auditResult: string
  auditRemark?: string
  operatorId: string
  auditedAt: string
}

/** 管理员 - 提现审核记录 */
export interface AdminMerchantWithdrawalItem {
  id: string
  merchantId: string
  merchantName: string
  amount: number
  feeAmount: number
  actualAmount: number
  status: string
  createdAt: string
  auditRemark?: string
  auditedAt?: string
  operatorId?: string
  auditResult?: string
}

/** 管理员 - 提现审核请求体 */
export interface AdminWithdrawalAuditPayload {
  auditResult: string
  rejectReason?: string
  remark?: string
}

/** 管理员 - 提现审核结果 */
export interface AdminWithdrawalAuditResult {
  id: string
  merchantId: string
  merchantName: string
  amount: number
  feeAmount: number
  actualAmount: number
  status: string
  auditResult: string
  auditRemark?: string
  operatorId: string
  auditedAt: string
}

export interface MerchantWithdrawalPayload {
  amount: number
}

export interface CourierDeliveryItem {
  id: string
  orderId?: string
  orderNo?: string
  merchantId?: string
  merchantName?: string
  merchantAddress?: string
  pickupAddress?: string
  deliveryAddress?: string
  contactPhone?: string
  fee?: number
  courierEarning?: number
  status?: string
  timeoutMinutes?: number
  acceptedAt?: string
  timeoutAt?: string
  deliveredAt?: string
  remark?: string
  proofImageUrls?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface DeliveryCompletePayload {
  proofImageUrls?: string[]
  remark?: string
}

export interface DistributionRecordItem {
  id: string
  orderId?: string
  orderNo?: string
  merchantId?: string
  merchantName?: string
  totalAmount?: number
  distributableAmount?: number
  propertyAmount?: number
  coordinatorAmount?: number
  sectorLeaderAmount?: number
  individualLeaderAmount?: number
  status?: string
  createdAt?: string
}

export interface DistributionStats {
  summary?: {
    totalDistributableAmount?: number
    propertyAmount?: number
    coordinatorAmount?: number
    sectorLeaderAmount?: number
    individualLeaderAmount?: number
  }
  byProperty?: Array<{ propertyCompanyId?: string; propertyName?: string; amount?: number }>
  byCoordinator?: Array<{ coordinatorId?: string; name?: string; amount?: number }>
  bySector?: Array<{ sector?: string; sectorName?: string; amount?: number }>
}

export interface CommunityServiceItem {
  id: string
  name: string
  description?: string
  coverUrls?: string[]
  coverUrl?: string
  category?: string
  categoryName?: string
  price?: number
  memberPrice?: number
  priceUnit?: string
  providerId?: string
  providerName?: string
  providerType?: string
  isSubscription?: boolean
  subscriptionRequired?: boolean
  monthlyFee?: number | null
  yearlyFee?: number | null
  rankOrder?: number
  propertyCompanyId?: string
  propertyCompanyName?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
}

export interface CommunityServiceCreatePayload {
  name: string
  category: string
  description?: string
  coverUrls?: string[]
  price?: number
  memberPrice?: number
  priceUnit?: string
  isSubscription?: boolean
}

export interface CommunityServiceUpdatePayload {
  name?: string
  description?: string
  coverUrls?: string[]
  price?: number
  memberPrice?: number
  priceUnit?: string
  category?: string
  status?: string
}

export interface SectorLeaderDetail {
  id: string
  residentId?: string
  residentName?: string
  residentPhone?: string
  phone?: string
  coordinatorId?: string
  coordinatorName?: string
  sector?: string
  sectorName?: string
  propertyCompanyId?: string
  propertyCompanyName?: string
  description?: string
  individualLeaderCount?: number
  merchantCount?: number
  activeSpecialOfferCount?: number
  totalEarnings?: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface SectorLeaderCreatePayload {
  residentId: string
  coordinatorId: string
  sector: string
  description?: string
}

export interface SectorLeaderUpdatePayload {
  coordinatorId?: string
  sector?: string
  description?: string
  status?: string
}

export interface SectorLeaderRemoveResult {
  id: string
  status?: string
  deletedAt?: string
}

export interface CoordinatorDetail {
  id: string
  residentId?: string
  residentName?: string
  residentPhone?: string
  phone?: string
  propertyCompanyId?: string
  propertyCompanyName?: string
  description?: string
  sectorCount?: number
  sectorLeaderCount?: number
  merchantCount?: number
  individualLeaderCount?: number
  activeSpecialOfferCount?: number
  commissionRate?: number
  totalEarnings?: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface ActivityGroupItem {
  id: string
  name: string
  description?: string
  coverUrl?: string
  leaderId?: string
  leaderName?: string
  communityId?: string
  communityName?: string
  memberCount?: number
  subscriberCount?: number
  monthlyFee?: number
  yearlyFee?: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface ActivityGroupCreatePayload {
  name: string
  description?: string
  coverUrl?: string
  monthlyFee?: number
  yearlyFee?: number
}

export interface ActivityGroupUpdatePayload {
  name?: string
  description?: string
  coverUrl?: string
  monthlyFee?: number
  yearlyFee?: number
}

export interface ActivityGroupMemberItem {
  id: string
  name?: string
  avatarUrl?: string
  relation?: string
  isLeader?: boolean
  joinedAt?: string
  status?: string
}

export interface SpecialOfferItem {
  id: string
  title: string
  content?: string
  targetType?: string
  targetTags?: string
  publisherName?: string
  publisherRole?: string
  merchantId?: string
  merchantName?: string
  communityId?: string
  coverUrl?: string
  discountInfo?: string
  minConsumption?: number
  startTime?: string
  endTime?: string
  totalQuota?: number
  perUserQuota?: number
  usedQuota?: number
  status?: string
  createdAt?: string
}

export interface SpecialOfferCreatePayload {
  title: string
  content: string
  targetType: string
  startTime: string
  endTime: string
  targetTags?: string
  communityId?: string
  merchantId?: string
  coverUrl?: string
  discountInfo?: string
  minConsumption?: number
  totalQuota?: number
  perUserQuota?: number
  status?: string
}

export interface SpecialOfferUpdatePayload {
  title?: string
  content?: string
  targetType?: string
  startTime?: string
  endTime?: string
  targetTags?: string
  communityId?: string
  merchantId?: string
  coverUrl?: string
  discountInfo?: string
  minConsumption?: number
  totalQuota?: number
  perUserQuota?: number
  status?: string
}
