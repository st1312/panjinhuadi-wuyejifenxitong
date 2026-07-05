import type {
  AnnouncementItem,
  DashboardOverview,
  MerchantItem,
  MerchantProfitSpace,
  OperationLogItem,
  PermissionItemDto,
  PermissionChangeLog,
  PlatformMerchantItem,
  PointPool,
  ReportsOverview,
  ResidentItem,
  RolePresetDto
} from './types'
import { getEnumLabel, ANNOUNCEMENT_STATUS, ANNOUNCEMENT_STATUS_LABEL, ANNOUNCEMENT_TYPE_LABEL, MERCHANT_AUDIT_STATUS_LABEL, MERCHANT_LEVEL_LABEL, MERCHANT_STATUS_LABEL, PERMISSION_MODULE_LABEL, RESIDENT_STATUS, RESIDENT_STATUS_LABEL, RESIDENT_USER_TYPE, ROLE_LABEL } from '../constants/enums'

const avatarColors = ['#5c5c9e', '#3aaf7d', '#f5a623', '#e05c5c', '#6a6aae']

export function initials(name?: string | null) {
  return (name ?? '').trim().slice(0, 1) || '?'
}

export function avatarColor(seed?: string | null) {
  const text = seed ?? ''
  if (!text) return avatarColors[0]
  let hash = 0
  for (let i = 0; i < text.length; i++) hash += text.charCodeAt(i)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function formatMoney(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return '0'
  return value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

export function formatPercent(rate?: number) {
  if (rate === undefined || rate === null) return 0
  return rate <= 1 ? Math.round(rate * 100) : Math.round(rate)
}

function resolveDashboardMetrics(overview: DashboardOverview) {
  const summary = overview.summary || {}
  return {
    totalResidents: overview.totalResidents ?? summary.totalResidents,
    monthlyConsumption: overview.monthlyConsumption ?? summary.totalRevenue,
    totalMerchants: overview.totalMerchants ?? summary.totalMerchants,
    coinTotalIssued: overview.coinTotalIssued ?? summary.totalCoinIssued,
    propertyFeeCollectionRate: overview.propertyFeeCollectionRate ?? summary.propertyFeeCollectionRate
  }
}

export function mapDashboardStats(overview: DashboardOverview) {
  const metrics = resolveDashboardMetrics(overview)
  const trends = overview.trends || {}

  return [
    {
      code: 'residents',
      title: '总住户',
      value: `${formatMoney(metrics.totalResidents)} 户`,
      icon: 'resident',
      badge: trends.residentGrowthRate !== undefined ? `↑ ${formatPercent(trends.residentGrowthRate)}%` : undefined,
      variant: 'default' as const
    },
    {
      code: 'consumption',
      title: '本月消费',
      value: `¥${formatMoney(metrics.monthlyConsumption)}`,
      icon: 'money',
      badge: trends.revenueGrowthRate !== undefined ? `↑ ${formatPercent(trends.revenueGrowthRate)}%` : undefined,
      variant: 'default' as const
    },
    {
      code: 'merchants',
      title: '总商家',
      value: `${formatMoney(metrics.totalMerchants)} 家`,
      icon: 'merchant',
      badge: trends.merchantGrowthRate !== undefined ? `↑ ${formatPercent(trends.merchantGrowthRate)}%` : undefined,
      variant: 'purple' as const
    },
    {
      code: 'coins',
      title: '物业币发行',
      value: `¥${formatMoney(metrics.coinTotalIssued)}`,
      icon: 'coin',
      variant: 'green' as const
    }
  ]
}

export function mapPeriodDescription(overview: DashboardOverview) {
  if (overview.startDate && overview.endDate) {
    return `${overview.startDate} 至 ${overview.endDate} 运营数据`
  }
  if (overview.period === 'month') return '本月运营数据及最近动态'
  return '今日运营数据及最近动态'
}

export function mapRecentActivity(overview: DashboardOverview) {
  return (overview.recentActivity || []).map((item, index) => ({
    id: `${item.type || 'activity'}-${item.timestamp || index}`,
    type: item.type || '-',
    description: item.description || '-',
    timestamp: item.timestamp || '-'
  }))
}

export function mapPendingAuditCount(overview: DashboardOverview) {
  return overview.pendingAuditCount ?? 0
}

export function mapConsumptionData(overview: DashboardOverview) {
  const list = overview.topMerchants || []
  if (!list.length) return [{ name: '暂无', value: 0 }]
  const max = Math.max(...list.map(item => item.revenue || item.orderCount || 0), 1)
  return list.slice(0, 5).map(item => ({
    name: item.merchantName || '商家',
    value: Math.round(((item.revenue || item.orderCount || 0) / max) * 100)
  }))
}

export function mapOperationLogs(logs: OperationLogItem[]) {
  return logs.map(log => ({
    id: log.id || '',
    time: log.createdAt || log.time || '-',
    operator: log.operatorName || log.operator || '-',
    content: log.content || log.description || log.action || '-',
    result: normalizeOperationResult(log)
  }))
}

function normalizeOperationResult(log: OperationLogItem): '成功' | '失败' {
  if (log.success === false) return '失败'
  if (log.success === true) return '成功'
  const raw = String(log.result ?? log.status ?? '').toLowerCase()
  if (['failed', 'fail', 'error', 'failure', 'false', '0'].includes(raw)) return '失败'
  if (/失败|错误|fail|error/.test(raw)) return '失败'
  return '成功'
}

export function resolveResidentDisplayName(item: ResidentItem) {
  return item.name || item.phone || '未知'
}

function resolveResidentName(item: ResidentItem) {
  return resolveResidentDisplayName(item)
}

export function mapResidents(list: ResidentItem[]) {
  return list.map(item => {
    const name = resolveResidentName(item)
    return {
      id: item.id,
      name,
      phone: item.phone || '-',
      initials: initials(name),
      avatarColor: avatarColor(item.id || name),
      building: [item.building, item.unit, item.room].filter(Boolean).join('') || '-',
      identity: item.userType === RESIDENT_USER_TYPE.OWNER ? 'owner' as const : 'tenant' as const,
      status: item.status || RESIDENT_STATUS.ACTIVE,
      statusLabel: getEnumLabel(RESIDENT_STATUS_LABEL, item.status),
      familyCount: item.familyId ? '—' : '—',
      registerTime: item.createdAt || '-'
    }
  })
}

export function resolvePlatformMerchantId(item: MerchantItem): string | null {
  if (item.platformMerchantId) return item.platformMerchantId
  if (item.id.startsWith('pm_')) return item.id
  return null
}

export function mapMerchants(list: MerchantItem[]) {
  return list.map(item => ({
    id: item.id,
    platformMerchantId: resolvePlatformMerchantId(item),
    name: item.name,
    category: item.category || '-',
    categoryCode: item.category?.includes('餐') ? 'dining' as const : 'retail' as const,
    merchantLevel: getEnumLabel(MERCHANT_LEVEL_LABEL, item.merchantLevel),
    auditStatus: getEnumLabel(MERCHANT_AUDIT_STATUS_LABEL, item.auditStatus),
    status: item.status,
    statusLabel: getEnumLabel(MERCHANT_STATUS_LABEL, item.status, '—'),
    commissionRate: item.commissionRate !== undefined ? `${formatPercent(item.commissionRate)}%` : '-',
    pointsRatio: item.pointExchangeRate !== undefined ? `${item.pointExchangeRate} / ¥1` : '-',
    cashbackRate: item.coinRebateRate !== undefined ? `${formatPercent(item.coinRebateRate)}%` : '0%',
    ownerPrice: item.memberDiscountPrice ? `${item.memberDiscountPrice}元` : '-'
  }))
}

export function mapPlatformMerchants(list: PlatformMerchantItem[]) {
  return list.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category || '—',
    categoryCode: item.category?.includes('餐') ? 'dining' as const : 'retail' as const,
    contactPhone: item.contactPhone || '—',
    status: item.status,
    statusLabel: getEnumLabel(MERCHANT_STATUS_LABEL, item.status, '—'),
    linkedPropertyCount: item.linkedPropertyCount ?? 0,
    createdAt: item.createdAt || '—'
  }))
}

export function mapProfitSpaceDisplay(data: MerchantProfitSpace | null) {
  const metrics = data?.metrics || {}
  const breakdown = data?.breakdown || {}
  const revenue = metrics.totalRevenue ?? 0
  const deliveryFee = metrics.totalDeliveryFee ?? 0
  const pointCost = metrics.totalPointCost ?? 0
  const coinCost = metrics.totalCoinCost ?? 0
  const exchangeCost = pointCost + coinCost
  // 盈利空间 = 总收入 - 配送费 - 积分成本 - 物业币成本
  const profitSpace = Math.max(revenue - deliveryFee - pointCost - coinCost, 0)
  const propertyShare = breakdown.propertyShare ?? 0
  const coordinatorShare = breakdown.coordinatorShare ?? 0

  const pct = (value: number) => (revenue > 0 ? formatPercent(value / revenue) : 0)

  return {
    merchantName: data?.platformMerchantName || '—',
    propertyName: data?.propertyName || '',
    periodLabel: data?.startDate && data?.endDate ? `${data.startDate} ~ ${data.endDate}` : '',
    totalOrders: metrics.totalOrders ?? 0,
    revenue: `¥${formatMoney(revenue)}`,
    deliveryFee: `${pct(deliveryFee)}%`,
    deliveryFeeAmount: `¥${formatMoney(deliveryFee)}`,
    exchangeCost: `${pct(exchangeCost)}%`,
    exchangeCostDetail: `积分 ¥${formatMoney(pointCost)} + 物业币 ¥${formatMoney(coinCost)}`,
    profitSpace: `${pct(profitSpace)}%`,
    profitSpaceAmount: `¥${formatMoney(profitSpace)}`,
    propertyShare: `${pct(propertyShare)}%`,
    propertyShareAmount: `¥${formatMoney(propertyShare)}`,
    coordinatorShare: `${pct(coordinatorShare)}%`,
    coordinatorShareAmount: `¥${formatMoney(coordinatorShare)}`,
    revenueGrowth: data?.comparison?.revenueGrowthRate !== undefined
      ? `${formatPercent(data.comparison.revenueGrowthRate)}%`
      : undefined,
    profitGrowth: data?.comparison?.profitGrowthRate !== undefined
      ? `${formatPercent(data.comparison.profitGrowthRate)}%`
      : undefined
  }
}

export function mapPointsUsers(list: ResidentItem[]) {
  return list.map(item => {
    const name = resolveResidentName(item)
    return {
      id: item.id,
      name,
      initials: initials(name),
      avatarColor: avatarColor(item.id || name),
      room: [item.building, item.room].filter(Boolean).join('') || '-',
      points: `${formatMoney(item.pointBalance)} pts`,
      pcoin: `${formatMoney(item.coinBalance)} PCoin`,
      coinBalance: item.coinBalance ?? 0,
      status: item.status === RESIDENT_STATUS.FROZEN || item.status === RESIDENT_STATUS.DISABLED
        ? 'frozen' as const
        : 'normal' as const
    }
  })
}

export function mapAnnouncements(list: AnnouncementItem[]) {
  return list.map(item => ({
    id: item.id,
    publishTime: item.publishedAt || item.createdAt || '-',
    title: item.title,
    publisher: item.publisherName || item.publisher || '物业管理处',
    scope: item.targetBuildings?.length ? item.targetBuildings : ['全部楼栋'],
    status: item.status || ANNOUNCEMENT_STATUS.DRAFT,
    statusLabel: getEnumLabel(ANNOUNCEMENT_STATUS_LABEL, item.status, '—'),
    announcementType: item.announcementType,
    announcementTypeLabel: getEnumLabel(ANNOUNCEMENT_TYPE_LABEL, item.announcementType, '—')
  }))
}

export function extractPermissionPool(data: PermissionItemDto[] | { permissions?: PermissionItemDto[]; list?: PermissionItemDto[] } | undefined) {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data.permissions) return data.permissions
  if (data.list) return data.list
  return []
}

export function buildPermissionGroups(pool: PermissionItemDto[], effectiveCodes: string[] = []) {
  const effective = new Set(effectiveCodes)
  const map = new Map<string, PermissionItemDto[]>()
  pool.forEach(item => {
    const category = PERMISSION_MODULE_LABEL[item.module || ''] || item.module || item.category || item.group || '其他'
    if (!map.has(category)) map.set(category, [])
    map.get(category)!.push(item)
  })
  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items: items.map(item => ({
      code: item.code,
      name: item.name,
      description: item.description || '',
      checked: effective.has(item.code)
    }))
  }))
}

export function normalizePermissionGroups(data: PermissionItemDto[] | { permissions?: PermissionItemDto[]; list?: PermissionItemDto[]; groups?: Array<{ category: string; items: PermissionItemDto[] }> } | undefined, effectiveCodes: string[] = []) {
  if (data && 'groups' in data && data.groups) {
    const effective = new Set(effectiveCodes)
    return data.groups.map(group => ({
      category: group.category,
      items: group.items.map(item => ({
        code: item.code,
        name: item.name,
        description: item.description || '',
        checked: effective.has(item.code)
      }))
    }))
  }
  return buildPermissionGroups(extractPermissionPool(data), effectiveCodes)
}

export function normalizeRolePresets(data: RolePresetDto[] | { presets?: RolePresetDto[]; list?: RolePresetDto[] } | undefined) {
  if (!data) return []
  const list = Array.isArray(data) ? data : data.presets || data.list || []
  return list.map(item => ({
    id: item.id,
    code: item.id || item.code || item.name,
    name: item.name,
    role: item.role || '',
    permissionCodes: item.permissionCodes || item.permissions || []
  }))
}

export function mapAdminUserAccounts(list: Array<{ id: string; name: string; phone?: string; role: string; effectivePermissionCount?: number }>) {
  return list.map(item => ({
    id: item.id,
    name: item.name,
    phone: item.phone || '-',
    initials: initials(item.name),
    role: getEnumLabel(ROLE_LABEL, item.role, item.role),
    roleCode: item.role,
    permissionCount: item.effectivePermissionCount ?? 0
  }))
}

export function mapPermissionChangeLogs(list: PermissionChangeLog[]) {
  return list.map(item => {
    const actionLabel = item.action === 'grant' ? '授予' : item.action === 'revoke' ? '撤销' : item.action || '-'
    const content = item.permissionCode
      ? `${actionLabel} ${item.permissionCode}${item.reason ? `（${item.reason}）` : ''}`
      : item.content || item.changeContent || '-'
    return {
      id: item.id || `${item.createdAt}-${item.permissionCode}`,
      time: item.createdAt || '-',
      operator: item.operatorName || '-',
      target: item.userName || item.targetName || item.targetUserName || '-',
      content
    }
  })
}

/** @deprecated use mapPermissionChangeLogs */
export function mapPermissionLogs(list: Array<{ createdAt?: string; operatorName?: string; targetName?: string; targetUserName?: string; content?: string; changeContent?: string; action?: string; permissionCode?: string; reason?: string; userName?: string }>) {
  return mapPermissionChangeLogs(list as PermissionChangeLog[])
}

export function mapCollectionRate(overview: DashboardOverview) {
  const metrics = resolveDashboardMetrics(overview)
  return formatPercent(metrics.propertyFeeCollectionRate)
}

export function mapReportsToDashboardOverview(reports: ReportsOverview, period: string): DashboardOverview {
  const summary = reports.summary || {}
  const comparison = reports.comparison || {}
  return {
    period,
    summary: {
      totalResidents: summary.residentCount,
      totalMerchants: summary.merchantCount,
      totalPointsIssued: summary.pointPoolBalance,
      totalCoinIssued: summary.propertyCoinCirculation,
      propertyFeeCollectionRate: summary.propertyFeeCollectionRate,
      totalRevenue: summary.totalConsumptionAmount
    },
    trends: {
      residentGrowthRate: comparison.residentGrowthRate,
      revenueGrowthRate: comparison.consumptionGrowthRate,
      orderGrowthRate: comparison.orderGrowthRate
    },
    topMerchants: []
  }
}

/** GET /admin/point-pools — 积分池概览卡片 */
export function mapPointPoolOverview(pool?: PointPool) {
  const amount = pool?.equivalentAmount ?? pool?.balance
  return {
    poolAmount: formatMoney(amount),
    balance: pool?.balance ?? 0,
    totalIn: pool?.totalIn ?? 0,
    totalOut: pool?.totalOut ?? 0,
    propertyCompanyName: pool?.propertyCompanyName ?? '',
    updatedAt: pool?.updatedAt ?? ''
  }
}

export function mapPointsOverview(pool?: PointPool, overview?: DashboardOverview) {
  const summary = overview?.summary || {}
  const circulation = overview?.coinTotalIssued ?? summary.totalCoinIssued ?? 0
  const consumed = summary.totalCoinRedeemed ?? Math.round(circulation * 0.25)
  const poolOverview = mapPointPoolOverview(pool)
  const hasPoolData = pool?.equivalentAmount != null || pool?.balance != null
  return {
    ...poolOverview,
    poolAmount: hasPoolData
      ? poolOverview.poolAmount
      : formatMoney(overview?.pointPoolBalance ?? summary.totalPointsIssued),
    pcoinTotal: circulation,
    pcoinConsumed: consumed,
    pcoinCirculating: Math.max(circulation - consumed, 0)
  }
}
