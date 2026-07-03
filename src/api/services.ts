import { buildQuery, request } from './request'
import type {
  AnnouncementCreatePayload,
  AnnouncementItem,
  DashboardOverview,
  DeliveryOrderItem,
  DeliveryRule,
  DeliveryTaskItem,
  LeaderItem,
  LoginResult,
  MerchantItem,
  MerchantAuditPayload,
  MerchantAuditResult,
  OperationLogItem,
  OrderItem,
  PageResult,
  PermissionChangeLog,
  PermissionItemDto,
  PointPool,
  PropertyCompanyConfig,
  PropertyCompanyDetail,
  ResidentItem,
  RolePresetDto,
  CoinFreezePayload,
  CoinFreezeResult,
  CoinUnfreezePayload,
  CoinUnfreezeResult,
  CoinFreezeRecordItem,
  UserProfile
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

  list(params: Record<string, string | number | undefined> = {}) {

    return request<PageResult<MerchantItem>>(`/merchants${buildQuery(params)}`)

  },

  listPending(params: Record<string, string | number | undefined> = {}) {

    return request<PageResult<MerchantItem>>(
      `/merchants${buildQuery({ auditStatus: 'pending_audit', ...params })}`
    )

  },

  audit(id: string, payload: MerchantAuditPayload) {

    return request<MerchantAuditResult>(`/admin/merchants/${id}/audit`, {

      method: 'POST',

      body: JSON.stringify(payload)

    })

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

  list(params: Record<string, string | number | undefined> = {}) {

    return request<PageResult<AnnouncementItem>>(`/admin/announcements${buildQuery(params)}`)

  },

  create(payload: AnnouncementCreatePayload) {

    return request<AnnouncementItem>('/announcements', {

      method: 'POST',

      body: JSON.stringify(payload)

    })

  }

}



export const deliveryApi = {

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



export const configApi = {

  propertyCompany(id: string) {

    return request<PropertyCompanyDetail>(`/admin/property-companies/${id}`)

  },

  updateConfig(id: string, config: PropertyCompanyConfig) {

    return request<PropertyCompanyDetail>(`/admin/property-companies/${id}/config`, {

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

  permissions() {

    return request<PermissionItemDto[] | { list?: PermissionItemDto[]; groups?: Array<{ category: string; items: PermissionItemDto[] }> }>('/admin/permissions')

  },

  rolePresets() {

    return request<RolePresetDto[] | PageResult<RolePresetDto>>('/admin/role-presets')

  },

  userPermissions(userId: string) {

    return request<PermissionItemDto[] | { permissions?: PermissionItemDto[] }>(`/admin/users/${userId}/permissions`)

  },

  grantPermissions(userId: string, permissionIds: string[]) {

    return request<unknown>(`/admin/users/${userId}/permissions/grant`, {

      method: 'POST',

      body: JSON.stringify({ permissionIds })

    })

  },

  changeLogs(page = 1, pageSize = 20) {

    return request<PageResult<PermissionChangeLog>>(`/admin/permission-change-logs${buildQuery({ page, pageSize })}`)

  },

  coordinators() {

    return request<PageResult<LeaderItem>>(`/admin/coordinators${buildQuery({ page: 1, pageSize: 100 })}`)

  },

  sectorLeaders() {

    return request<PageResult<LeaderItem>>(`/admin/sector-leaders${buildQuery({ page: 1, pageSize: 100 })}`)

  },

  individualLeaders() {

    return request<PageResult<LeaderItem>>(`/admin/individual-leaders${buildQuery({ page: 1, pageSize: 100 })}`)

  }

}



export type { DeliveryOrderItem }


