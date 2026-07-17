import { buildQuery, request } from './request'
import { MERCHANT_AUDIT_STATUS } from '../constants/enums'
import type {
  AgeBracketItem,
  AnnouncementCreatePayload,
  AnnouncementItem,
  AnnouncementReadStats,
  AnnouncementUpdatePayload,
  CommunityEntityCreatePayload,
  CommunityEntityItem,
  CommunityPropertyBindPayload,
  CommunityPropertyBindingItem,
  CommunityPropertyPermissionPayload,
  ConsultantCreatePayload,
  ConsultantItem,
  ConsultantUpdatePayload,
  ConsultationSettings,
  DashboardOverview,
  DeliveryOrderItem,
  DeliveryCapacity,
  DeliveryCourierItem,
  DeliveryHourlyData,
  DeliveryOverview,
  DeliveryRule,
  DeliveryTaskItem,
  DeliveryTodayStats,
  DirectedMessageCreatePayload,
  DirectedMessageRecipientItem,
  DirectedMessageSendResult,
  DirectedMessageTaskItem,
  DistributorProductCreatePayload,
  RecentDeliveryItem,
  LeaderItem,
  LoginResult,
  MerchantAdCreatePayload,
  MerchantAdItem,
  MerchantAdPackageItem,
  MerchantAdQuota,
  MerchantItem,
  MerchantKickPayload,
  MerchantKickResult,
  MerchantMessageServicePayload,
  MerchantServiceScope,
  MerchantServiceScopeUpdatePayload,
  MerchantUpdatePayload,
  MerchantProfitSpace,
  MerchantAuditPayload,
  MerchantAuditResult,
  PlatformMerchantCreatePayload,
  PlatformMerchantItem,
  PlatformMerchantUpdatePayload,
  OperationLogItem,
  OrderItem,
  PageResult,
  PermissionChangeLog,
  PermissionItemDto,
  AdminUserAccount,
  UserPermissionsDetail,
  PointPool,
  PropertyCompanyConfig,
  PropertyCompanyDetail,
  PropertyCompanyItem,
  PropertyCompanyCommunity,
  PropertyOperatorCreatePayload,
  PropertyOperatorItem,
  PropertyOperatorScopePayload,
  ResidentItem,
  ResidentCreatePayload,
  ResidentUpdatePayload,
  ResidentStatusPayload,
  ResidentMerchantApplicationItem,
  ResidentMerchantDepositItem,
  ResidentMerchantSettlementItem,
  ResidentMerchantSettings,
  RolePresetDto,
  CoinFreezePayload,
  CoinFreezeResult,
  CoinUnfreezePayload,
  CoinUnfreezeResult,
  CoinFreezeRecordItem,
  CommunityServiceCreatePayload,
  CommunityServiceItem,
  CommunityServiceUpdatePayload,
  CourierDeliveryItem,
  DeliveryCompletePayload,
  DistributionRecordItem,
  DistributionStats,
  MerchantPointGrantPayload,
  MerchantPointPurchaseItem,
  MerchantPointPurchasePayload,
  MerchantWithdrawalItem,
  MerchantWithdrawalPayload,
  MyMerchantDetail,
  ProductCreatePayload,
  ProductItem,
  ProductUpdatePayload,
  SectorLeaderDetail,
  SectorLeaderCreatePayload,
  SectorLeaderRemoveResult,
  SectorLeaderUpdatePayload,
  ServiceCategoryDictItem,
  ServiceRequestItem,
  ServiceRequestQuotePayload,
  CoordinatorDetail,
  ActivityGroupItem,
  ActivityGroupCreatePayload,
  ActivityGroupUpdatePayload,
  ActivityGroupMemberItem,
  SpecialOfferCreatePayload,
  SpecialOfferItem,
  SpecialOfferUpdatePayload,
  UserProfile,
  AdminMerchantPointPurchaseItem,
  AdminPointPurchaseAuditPayload,
  AdminPointPurchaseAuditResult,
  AdminMerchantWithdrawalItem,
  AdminWithdrawalAuditPayload,
  AdminWithdrawalAuditResult
} from './types'



export const authApi = {

  adminLogin(phone: string, password: string) {
    return request<LoginResult>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    }, false)
  },

  refreshToken(refreshToken: string) {

    return request<LoginResult>('/auth/refresh-token', {

      method: 'POST',

      body: JSON.stringify({ refreshToken })

    }, false)

  },

  profile() {

    return request<UserProfile>('/auth/profile')

  }

}



export const dashboardApi = {
  /** 超管需传 propertyCompanyId，由 request 层按登录态自动附加 */
  overview() {
    return request<DashboardOverview>('/admin/dashboard/overview')
  }
}

export const operationLogApi = {
  list(params: {
    page?: number
    pageSize?: number
    keyword?: string
    module?: string
    operatorId?: string
    startDate?: string
    endDate?: string
  } = {}) {
    return request<PageResult<OperationLogItem>>(`/admin/operation-logs${buildQuery(params)}`)
  }
}



export const residentApi = {

  list(params: {
    page?: number
    pageSize?: number
    keyword?: string
    communityId?: string
    building?: string
    status?: string
    role?: string
    userType?: string
    propertyCompanyId?: string
    sort?: string
  } = {}) {

    return request<PageResult<ResidentItem>>(`/residents${buildQuery(params)}`)

  },

  get(id: string) {
    return request<ResidentItem>(`/residents/${id}`)
  },

  create(payload: ResidentCreatePayload) {
    return request<ResidentItem>('/residents', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  update(id: string, payload: ResidentUpdatePayload) {
    return request<ResidentItem>(`/residents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  updateStatus(id: string, payload: ResidentStatusPayload) {
    return request<ResidentItem>(`/residents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
  },

  remove(id: string) {
    return request<null>(`/residents/${id}`, { method: 'DELETE' })
  },

  freezeCoin(id: string, payload: CoinFreezePayload) {

    return request<CoinFreezeResult>(`/admin/residents/${id}/coin/freeze`, {

      method: 'POST',

      body: JSON.stringify(payload)

    })

  },

  unfreezeCoin(id: string, payload: CoinUnfreezePayload) {

    return request<CoinUnfreezeResult>(`/admin/residents/${id}/coin/unfreeze`, {

      method: 'POST',

      body: JSON.stringify(payload)

    })

  }

}

export const coinFreezeRecordApi = {
  list(params: {
    page?: number
    pageSize?: number
    residentId?: string
    action?: string
    sort?: string
  } = {}) {
    return request<PageResult<CoinFreezeRecordItem>>(
      `/admin/coin-freeze-records${buildQuery({ action: 'freeze', ...params })}`
    )
  }
}



export const merchantApi = {

  list(params: {
    page?: number
    pageSize?: number
    keyword?: string
    category?: string
    merchantLevel?: string
    auditStatus?: string
    propertyCompanyId?: string
    sort?: string
  } = {}) {

    return request<PageResult<MerchantItem>>(`/merchants${buildQuery(params)}`)

  },

  get(id: string, propertyCompanyId?: string) {
    return request<MerchantItem>(`/merchants/${id}${buildQuery({ propertyCompanyId })}`)
  },

  update(id: string, payload: MerchantUpdatePayload, propertyCompanyId?: string) {
    return request<MerchantItem>(`/merchants/${id}${buildQuery({ propertyCompanyId })}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  listPlatform(params: {
    page?: number
    pageSize?: number
    keyword?: string
    category?: string
    status?: string
    sort?: string
  } = {}) {
    return request<PageResult<PlatformMerchantItem>>(`/admin/platform-merchants${buildQuery(params)}`)
  },

  createPlatform(payload: PlatformMerchantCreatePayload) {
    return request<PlatformMerchantItem>('/admin/platform-merchants', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  getPlatform(id: string) {
    return request<PlatformMerchantItem>(`/admin/platform-merchants/${id}`)
  },

  updatePlatform(id: string, payload: PlatformMerchantUpdatePayload) {
    return request<PlatformMerchantItem>(`/admin/platform-merchants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  listPending(params: Record<string, string | number | undefined> = {}) {

    return request<PageResult<MerchantItem>>(
      `/merchants${buildQuery({ auditStatus: MERCHANT_AUDIT_STATUS.PENDING, ...params })}`
    )

  },

  audit(id: string, payload: MerchantAuditPayload) {

    return request<MerchantAuditResult>(`/admin/merchants/${id}/audit`, {

      method: 'POST',

      body: JSON.stringify(payload)

    })

  },

  kick(id: string, payload: MerchantKickPayload) {
    return request<MerchantKickResult>(`/admin/merchants/${id}/kick`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  profitSpace(
    platformMerchantId: string,
    params: { consumptionAmount: number }
  ) {
    return request<MerchantProfitSpace>(
      `/admin/platform-merchants/${platformMerchantId}/profit-space${buildQuery({
        consumptionAmount: params.consumptionAmount
      })}`
    )
  }

}



export const pointApi = {

  pool() {

    return request<PointPool>('/admin/point-pools')

  },

  records(params: Record<string, string | number | undefined> = {}) {

    return request<PageResult<unknown>>(`/admin/point-pools/records${buildQuery(params)}`)

  }

}



export const announcementApi = {

  list(params: {
    page?: number
    pageSize?: number
    announcementType?: string
    communityId?: string
    merchantId?: string
    readStatus?: string
    status?: string
    sort?: string
  } = {}) {

    return request<PageResult<AnnouncementItem>>(`/announcements${buildQuery(params)}`)

  },

  get(id: string) {

    return request<AnnouncementItem>(`/announcements/${id}`)

  },

  create(payload: AnnouncementCreatePayload) {

    return request<AnnouncementItem>('/announcements', {

      method: 'POST',

      body: JSON.stringify(payload)

    })

  },

  update(id: string, payload: AnnouncementUpdatePayload) {

    return request<AnnouncementItem>(`/announcements/${id}`, {

      method: 'PUT',

      body: JSON.stringify(payload)

    })

  },

  remove(id: string) {

    return request<{ id: string; status: string }>(`/announcements/${id}`, {

      method: 'DELETE'

    })

  },

  readStats(id: string) {
    return request<AnnouncementReadStats>(`/admin/announcements/${id}/read-stats`)
  }

}



export const deliveryApi = {

  overview(params: Record<string, string | number | undefined> = {}) {

    return request<DeliveryOverview>(`/admin/deliveries/overview${buildQuery(params)}`)

  },

  capacity(params: Record<string, string | number | undefined> = {}) {

    return request<DeliveryCapacity>(`/admin/deliveries/capacity${buildQuery(params)}`)

  },

  rules(params: Record<string, string | number | undefined> = {}) {

    return request<PageResult<DeliveryRule>>(`/admin/delivery-rules${buildQuery(params)}`)

  },

  orders(params: Record<string, string | number | undefined> = {}) {

    return request<PageResult<OrderItem>>(`/admin/delivery-orders${buildQuery(params)}`)

  },

  couriers(params: Record<string, string | number | undefined> = {}) {

    return request<PageResult<DeliveryTaskItem>>(`/admin/couriers${buildQuery(params)}`)

  }

}



export const propertyCompanyApi = {

  list(params: {
    page?: number
    pageSize?: number
    keyword?: string
    status?: string
    sort?: string
  } = {}, auth = false) {
    return request<PageResult<PropertyCompanyItem>>(
      `/property-companies${buildQuery(params)}`,
      {},
      auth
    )
  },

  communities(id: string) {
    return request<PageResult<PropertyCompanyCommunity>>(`/property-companies/${id}/communities`)
  }

}



export const configApi = {

  propertyCompany(id: string) {

    return request<PropertyCompanyDetail>(`/admin/property-companies/${id}`)

  },

  updateConfig(id: string, config: PropertyCompanyConfig) {

    return request<PropertyCompanyDetail | PropertyCompanyConfig>(`/admin/property-companies/${id}/config`, {

      method: 'PATCH',

      body: JSON.stringify(config)

    })

  },

  updateDeliveryRule(id: string, payload: Partial<DeliveryRule>) {

    return request<DeliveryRule>(`/admin/delivery-rules/${id}`, {

      method: 'PUT',

      body: JSON.stringify(payload)

    })

  }

}



export const permissionApi = {

  users(params: { keyword?: string; page?: number; pageSize?: number } = {}) {
    return request<{ accounts: AdminUserAccount[]; total: number }>(
      `/admin/users${buildQuery(params)}`
    )
  },

  permissions() {
    return request<{ permissions: PermissionItemDto[] }>('/admin/permissions')
  },

  rolePresets() {
    return request<{ presets: RolePresetDto[] }>('/admin/role-presets')
  },

  userPermissions(userId: string) {
    return request<UserPermissionsDetail>(`/admin/users/${userId}/permissions`)
  },

  grantPermissions(userId: string, permissionCodes: string[], reason?: string) {
    return request<unknown>(`/admin/users/${userId}/permissions/grant`, {
      method: 'POST',
      body: JSON.stringify({ permissionCodes, reason })
    })
  },

  revokePermissions(userId: string, permissionCodes: string[]) {
    return request<unknown>(`/admin/users/${userId}/permissions/revoke`, {
      method: 'POST',
      body: JSON.stringify({ permissionCodes })
    })
  },

  changeLogs(params: {
    page?: number
    pageSize?: number
    userId?: string
    startDate?: string
    endDate?: string
    sort?: string
  } = {}) {
    return request<PageResult<PermissionChangeLog>>(
      `/admin/permission-change-logs${buildQuery(params)}`
    )
  }

}



export type { DeliveryOrderItem }


export const merchantPortalApi = {
  my() {
    return request<MyMerchantDetail>('/merchants/my')
  },

  update(id: string, payload: MerchantUpdatePayload) {
    return request<MyMerchantDetail>(`/merchants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  orders(params: {
    page?: number
    pageSize?: number
    orderStatus?: string
    startDate?: string
    endDate?: string
    sort?: string
  } = {}) {
    return request<PageResult<OrderItem>>(`/orders${buildQuery(params)}`)
  },

  getOrder(id: string) {
    return request<OrderItem>(`/orders/${id}`)
  },

  updateOrderStatus(id: string, orderStatus: string) {
    return request<OrderItem>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ orderStatus })
    })
  },

  /** 商家手动发送配送任务（POST /orders/{id}/send-delivery）。
   *  适用场景：历史已支付但当时未自动生成配送单的订单。
   *  若订单已存在配送单，后端会返回「该订单已有配送单」错误。 */
  sendDelivery(id: string) {
    return request<{
      orderId?: string
      deliveryId?: string
      status?: string
      sentAt?: string
    }>(`/orders/${id}/send-delivery`, { method: 'POST' })
  },

  /** 物业指派配送（POST /deliveries/{id}/assign） */
  assignDelivery(deliveryId: string, courierId: string) {
    return request<{ deliveryId?: string; courierId?: string; status?: string }>(
      `/deliveries/${deliveryId}/assign`,
      { method: 'POST', body: JSON.stringify({ courierId }) }
    )
  },

  /** 获取可用的快递员列表 */
  couriers(params: { page?: number; pageSize?: number } = {}) {
    return request<PageResult<DeliveryTaskItem>>(
      `/deliveries/couriers${buildQuery(params)}`
    )
  },

  products(params: {
    page?: number
    pageSize?: number
    merchantId?: string
    keyword?: string
    status?: string
    sort?: string
  } = {}) {
    return request<PageResult<ProductItem>>(`/products${buildQuery(params)}`)
  },

  createProduct(payload: ProductCreatePayload) {
    return request<ProductItem>('/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  updateProduct(id: string, payload: ProductUpdatePayload) {
    return request<ProductItem>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  purchasePoints(payload: MerchantPointPurchasePayload) {
    return request<MerchantPointPurchaseItem>('/merchant/points/purchase', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  pointPurchases(params: {
    page?: number
    pageSize?: number
    auditStatus?: string
    startDate?: string
    endDate?: string
    sort?: string
  } = {}) {
    return request<PageResult<MerchantPointPurchaseItem>>(
      `/merchant/points/purchases${buildQuery(params)}`
    )
  },

  grantPoints(payload: MerchantPointGrantPayload) {
    return request<unknown>('/merchant/points/grant', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  createWithdrawal(payload: MerchantWithdrawalPayload) {
    return request<MerchantWithdrawalItem>('/merchant/withdrawals', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  withdrawals(params: {
    page?: number
    pageSize?: number
    auditStatus?: string
    startDate?: string
    endDate?: string
    sort?: string
  } = {}) {
    return request<PageResult<MerchantWithdrawalItem>>(
      `/merchant/withdrawals${buildQuery(params)}`
    )
  },

  getServiceScope() {
    return request<MerchantServiceScope>('/merchants/my/service-scope')
  },

  updateServiceScope(payload: MerchantServiceScopeUpdatePayload) {
    return request<MerchantServiceScope>('/merchants/my/service-scope', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  updateMessageService(payload: MerchantMessageServicePayload) {
    return request<{ enabled: boolean }>('/merchants/my/message-service', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  serviceRequestPending(params: { page?: number; pageSize?: number } = {}) {
    return request<PageResult<ServiceRequestItem>>(
      `/merchant/service-requests/pending${buildQuery(params)}`
    )
  },

  acceptServiceRequest(id: string) {
    return request<ServiceRequestItem>(`/merchant/service-requests/${id}/accept`, {
      method: 'POST'
    })
  },

  skipServiceRequest(id: string) {
    return request<ServiceRequestItem>(`/merchant/service-requests/${id}/skip`, {
      method: 'POST'
    })
  },

  quoteServiceRequest(id: string, payload: ServiceRequestQuotePayload) {
    return request<ServiceRequestItem>(`/merchant/service-requests/${id}/quote`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  adQuota() {
    return request<MerchantAdQuota>('/merchant/ads/quota')
  },

  ads(params: { page?: number; pageSize?: number } = {}) {
    return request<PageResult<MerchantAdItem>>(`/merchant/ads${buildQuery(params)}`)
  },

  createAd(payload: MerchantAdCreatePayload) {
    return request<MerchantAdItem>('/merchant/ads', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }
}

export const courierPortalApi = {
  pending(params: { page?: number; pageSize?: number; sort?: string } = {}) {
    return request<PageResult<CourierDeliveryItem>>(`/deliveries/pending${buildQuery(params)}`)
  },

  available(params: { page?: number; pageSize?: number; sort?: string } = {}) {
    return request<PageResult<CourierDeliveryItem>>(`/deliveries/available${buildQuery(params)}`)
  },

  my(params: {
    page?: number
    pageSize?: number
    status?: string
    sort?: string
  } = {}) {
    return request<PageResult<CourierDeliveryItem>>(`/deliveries/my${buildQuery(params)}`)
  },

  grab(id: string) {
    return request<CourierDeliveryItem>(`/deliveries/${id}/grab`, { method: 'POST' })
  },

  complete(id: string, payload: DeliveryCompletePayload = {}) {
    return request<CourierDeliveryItem>(`/deliveries/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  updateStatus(id: string, status: string) {
    return request<CourierDeliveryItem>(`/deliveries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  }
}

export const distributionApi = {
  records(params: {
    page?: number
    pageSize?: number
    orderId?: string
    merchantId?: string
    coordinatorId?: string
    sectorLeaderId?: string
    individualLeaderId?: string
    startDate?: string
    endDate?: string
    sort?: string
  } = {}) {
    return request<PageResult<DistributionRecordItem>>(`/distribution/records${buildQuery(params)}`)
  },

  stats(params: {
    startDate?: string
    endDate?: string
    dimension?: string
    propertyCompanyId?: string
  } = {}) {
    return request<DistributionStats>(`/distribution/stats${buildQuery(params)}`)
  }
}

export const serviceApi = {
  list(params: {
    page?: number
    pageSize?: number
    category?: string
    mine?: boolean
    sort?: string
  } = {}) {
    return request<PageResult<CommunityServiceItem>>(`/services${buildQuery(params)}`)
  },

  create(payload: CommunityServiceCreatePayload) {
    return request<CommunityServiceItem>('/services', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  get(id: string) {
    return request<CommunityServiceItem>(`/services/${id}`)
  },

  update(id: string, payload: CommunityServiceUpdatePayload) {
    return request<CommunityServiceItem>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  remove(id: string) {
    return request<{ id: string; status?: string; deletedAt?: string }>(`/services/${id}`, {
      method: 'DELETE'
    })
  }
}

export const sectorLeaderPortalApi = {
  my() {
    return request<SectorLeaderDetail>('/sector-leaders/my')
  }
}

export const sectorLeaderAdminApi = {
  list(params: {
    page?: number
    pageSize?: number
    keyword?: string
    status?: string
    sort?: string
  } = {}) {
    return request<PageResult<SectorLeaderDetail>>(`/admin/sector-leaders${buildQuery(params)}`)
  },

  get(id: string) {
    return request<SectorLeaderDetail>(`/admin/sector-leaders/${id}`)
  },

  create(payload: SectorLeaderCreatePayload) {
    return request<SectorLeaderDetail>('/admin/sector-leaders', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  update(id: string, payload: SectorLeaderUpdatePayload) {
    return request<SectorLeaderDetail>(`/admin/sector-leaders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  remove(id: string) {
    return request<SectorLeaderRemoveResult>(`/admin/sector-leaders/${id}`, {
      method: 'DELETE'
    })
  }
}

export const coordinatorPortalApi = {
  my() {
    return request<CoordinatorDetail>('/coordinators/my')
  },

  sectorLeaders: sectorLeaderAdminApi.list.bind(sectorLeaderAdminApi),
  createSectorLeader: sectorLeaderAdminApi.create.bind(sectorLeaderAdminApi),
  updateSectorLeader: sectorLeaderAdminApi.update.bind(sectorLeaderAdminApi),
  removeSectorLeader: sectorLeaderAdminApi.remove.bind(sectorLeaderAdminApi)
}

export const activityGroupApi = {
  list(params: {
    page?: number
    pageSize?: number
    communityId?: string
    mine?: boolean
    sort?: string
  } = {}) {
    return request<PageResult<ActivityGroupItem>>(`/activity-groups${buildQuery(params)}`)
  },

  get(id: string) {
    return request<ActivityGroupItem>(`/activity-groups/${id}`)
  },

  members(id: string) {
    return request<{ list: ActivityGroupMemberItem[]; total?: number }>(
      `/activity-groups/${id}/members`
    )
  },

  create(payload: ActivityGroupCreatePayload) {
    return request<ActivityGroupItem>('/activity-groups', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  update(id: string, payload: ActivityGroupUpdatePayload) {
    return request<ActivityGroupItem>(`/activity-groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }
}

/** 管理端 - 商家积分购买审核 */
export const adminMerchantPointPurchaseApi = {
  list(params: {
    page?: number
    pageSize?: number
    merchantId?: string
    auditStatus?: string
    status?: string
    startDate?: string
    endDate?: string
    propertyCompanyId?: string
    sort?: string
  } = {}) {
    return request<PageResult<AdminMerchantPointPurchaseItem>>(
      `/admin/merchant-point-purchases${buildQuery(params)}`
    )
  },
  audit(id: string, payload: AdminPointPurchaseAuditPayload) {
    return request<AdminPointPurchaseAuditResult>(
      `/admin/merchant-point-purchases/${id}/audit`,
      { method: 'POST', body: JSON.stringify(payload) }
    )
  }
}

/** 管理端 - 商家提现审核 */
export const adminMerchantWithdrawalApi = {
  list(params: {
    page?: number
    pageSize?: number
    merchantId?: string
    auditStatus?: string
    status?: string
    startDate?: string
    endDate?: string
    propertyCompanyId?: string
    sort?: string
  } = {}) {
    return request<PageResult<AdminMerchantWithdrawalItem>>(
      `/admin/merchant-withdrawals${buildQuery(params)}`
    )
  },
  audit(id: string, payload: AdminWithdrawalAuditPayload) {
    return request<AdminWithdrawalAuditResult>(
      `/admin/merchant-withdrawals/${id}/audit`,
      { method: 'POST', body: JSON.stringify(payload) }
    )
  }
}

export const specialOfferApi = {
  list(params: {
    page?: number
    pageSize?: number
    targetType?: string
    status?: string
  } = {}) {
    return request<PageResult<SpecialOfferItem>>(`/special-offers${buildQuery(params)}`)
  },

  get(id: string) {
    return request<SpecialOfferItem>(`/special-offers/${id}`)
  },

  create(payload: SpecialOfferCreatePayload) {
    return request<SpecialOfferItem>('/special-offers', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  update(id: string, payload: SpecialOfferUpdatePayload) {
    return request<SpecialOfferItem>(`/special-offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  remove(id: string) {
    return request<{ id: string }>(`/special-offers/${id}`, { method: 'DELETE' })
  }
}

export const directedMessageApi = {
  list(params: {
    page?: number
    pageSize?: number
    startDate?: string
    endDate?: string
    officialSenderType?: string
    propertyCompanyId?: string
  } = {}) {
    return request<PageResult<DirectedMessageTaskItem>>(
      `/admin/directed-messages${buildQuery(params)}`
    )
  },

  get(id: string) {
    return request<DirectedMessageTaskItem>(`/admin/directed-messages/${id}`)
  },

  create(payload: DirectedMessageCreatePayload) {
    return request<DirectedMessageSendResult>('/admin/directed-messages', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  recipients(
    id: string,
    params: {
      page?: number
      pageSize?: number
      readStatus?: string
      buildingNo?: string
      gender?: string
      ageBracketId?: string
    } = {}
  ) {
    return request<PageResult<DirectedMessageRecipientItem>>(
      `/admin/directed-messages/${id}/recipients${buildQuery(params)}`
    )
  },

  ageBrackets() {
    return request<{ list: AgeBracketItem[] } | AgeBracketItem[]>('/admin/age-brackets')
  },

  updateAgeBrackets(brackets: AgeBracketItem[]) {
    return request<{ list: AgeBracketItem[] }>('/admin/age-brackets', {
      method: 'PUT',
      body: JSON.stringify({ brackets })
    })
  }
}

export const communityEntityApi = {
  list(params: { page?: number; pageSize?: number; keyword?: string } = {}) {
    return request<PageResult<CommunityEntityItem>>(
      `/admin/community-entities${buildQuery(params)}`
    )
  },

  create(payload: CommunityEntityCreatePayload) {
    return request<CommunityEntityItem>('/admin/community-entities', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  propertyCompanies(id: string) {
    return request<{ list: CommunityPropertyBindingItem[] } | CommunityPropertyBindingItem[]>(
      `/admin/community-entities/${id}/property-companies`
    )
  },

  bindProperty(id: string, payload: CommunityPropertyBindPayload) {
    return request<CommunityPropertyBindingItem>(
      `/admin/community-entities/${id}/property-companies`,
      { method: 'POST', body: JSON.stringify(payload) }
    )
  },

  unbindProperty(id: string, propertyCompanyId: string) {
    return request<{ success?: boolean }>(
      `/admin/community-entities/${id}/property-companies/${propertyCompanyId}`,
      { method: 'DELETE' }
    )
  },

  updatePermissions(
    id: string,
    propertyCompanyId: string,
    payload: CommunityPropertyPermissionPayload
  ) {
    return request<CommunityPropertyBindingItem>(
      `/admin/community-entities/${id}/property-companies/${propertyCompanyId}/permissions`,
      { method: 'PUT', body: JSON.stringify(payload) }
    )
  }
}

export const propertyOperatorApi = {
  list(params: { page?: number; pageSize?: number; status?: string } = {}) {
    return request<PageResult<PropertyOperatorItem>>(
      `/admin/property-operators${buildQuery(params)}`
    )
  },

  create(payload: PropertyOperatorCreatePayload) {
    return request<PropertyOperatorItem>('/admin/property-operators', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  updateScope(id: string, payload: PropertyOperatorScopePayload) {
    return request<PropertyOperatorItem>(`/admin/property-operators/${id}/scope`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  updateStatus(id: string, status: string) {
    return request<PropertyOperatorItem>(`/admin/property-operators/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }
}

export const serviceCategoryApi = {
  list() {
    return request<{ list: ServiceCategoryDictItem[] } | ServiceCategoryDictItem[]>(
      '/service-categories'
    )
  }
}

export const consultationAdminApi = {
  list(params: {
    page?: number
    pageSize?: number
    category?: string
    keyword?: string
    status?: string
  } = {}) {
    return request<PageResult<ConsultantItem>>(`/admin/consultants${buildQuery(params)}`)
  },

  create(payload: ConsultantCreatePayload) {
    return request<ConsultantItem>('/admin/consultants', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  update(id: string, payload: ConsultantUpdatePayload) {
    return request<ConsultantItem>(`/admin/consultants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  audit(id: string, auditResult: string, reason?: string) {
    return request<ConsultantItem>(`/admin/consultants/${id}/audit`, {
      method: 'PUT',
      body: JSON.stringify({ auditResult, reason })
    })
  },

  getSettings() {
    return request<ConsultationSettings>('/admin/consultation-settings')
  },

  updateSettings(payload: ConsultationSettings) {
    return request<ConsultationSettings>('/admin/consultation-settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }
}

export const residentMerchantAdminApi = {
  applications(params: {
    page?: number
    pageSize?: number
    status?: string
    keyword?: string
  } = {}) {
    return request<PageResult<ResidentMerchantApplicationItem>>(
      `/admin/resident-merchant-applications${buildQuery(params)}`
    )
  },

  auditApplication(id: string, auditResult: string, reason?: string) {
    return request<ResidentMerchantApplicationItem>(
      `/admin/resident-merchant-applications/${id}/audit`,
      { method: 'POST', body: JSON.stringify({ auditResult, reason }) }
    )
  },

  deposits(params: { page?: number; pageSize?: number; status?: string } = {}) {
    return request<PageResult<ResidentMerchantDepositItem>>(
      `/admin/resident-merchant-deposits${buildQuery(params)}`
    )
  },

  deductDeposit(id: string, amount: number, reason: string) {
    return request<ResidentMerchantDepositItem>(`/admin/resident-merchant-deposits/${id}/deduct`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason })
    })
  },

  settlements(params: {
    page?: number
    pageSize?: number
    startDate?: string
    endDate?: string
  } = {}) {
    return request<PageResult<ResidentMerchantSettlementItem>>(
      `/admin/resident-merchant-settlements${buildQuery(params)}`
    )
  },

  getSettings() {
    return request<ResidentMerchantSettings>('/admin/resident-merchant-settings')
  },

  updateSettings(payload: ResidentMerchantSettings) {
    return request<ResidentMerchantSettings>('/admin/resident-merchant-settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  createDistributorProduct(payload: DistributorProductCreatePayload) {
    return request<{ id: string }>('/admin/distributor-products', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }
}

export const merchantAdAdminApi = {
  packages() {
    return request<{ list: MerchantAdPackageItem[] } | MerchantAdPackageItem[]>(
      '/admin/merchant-ad-packages'
    )
  },

  /** §59.5 为商家增加本周付费广告额度 */
  addQuota(merchantId: string, purchasedQuota: number) {
    return request<MerchantAdQuota>(`/admin/merchants/${merchantId}/ad-quota`, {
      method: 'POST',
      body: JSON.stringify({ purchasedQuota })
    })
  }
}

