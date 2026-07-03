import type {
  AnnouncementItem,
  DashboardOverview,
  MerchantItem,
  OperationLogItem,
  PermissionItemDto,
  ReportsOverview,
  ResidentItem,
  RolePresetDto
} from './types'

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

export function mapDashboardStats(overview: DashboardOverview) {
  const summary = overview.summary || {}
  const trends = overview.trends || {}

  return [
    {
      code: 'residents',
      title: '总住户',
      value: `${formatMoney(summary.totalResidents)} 户`,
      icon: 'resident',
      badge: trends.residentGrowthRate !== undefined ? `↑ ${formatPercent(trends.residentGrowthRate)}%` : undefined,
      variant: 'default' as const
    },
    {
      code: 'consumption',
      title: '本月消费',
      value: `¥${formatMoney(summary.totalRevenue)}`,
      icon: 'money',
      badge: trends.revenueGrowthRate !== undefined ? `↑ ${formatPercent(trends.revenueGrowthRate)}%` : undefined,
      variant: 'default' as const
    },
    {
      code: 'points',
      title: '积分池',
      value: `¥${formatMoney(summary.totalPointsIssued)}`,
      icon: 'star',
      variant: 'purple' as const
    },
    {
      code: 'coins',
      title: '物业币发行',
      value: `¥${formatMoney(summary.totalCoinIssued)}`,
      icon: 'coin',
      variant: 'green' as const
    }
  ]
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

function resolveResidentName(item: ResidentItem) {
  return item.name || item.phone || '未知'
}

export function mapResidents(list: ResidentItem[]) {
  return list.map(item => {
    const name = resolveResidentName(item)
    return {
      id: item.id,
      name,
      initials: initials(name),
      avatarColor: avatarColor(item.id || name),
      building: [item.building, item.unit, item.room].filter(Boolean).join('') || '-',
      identity: item.userType === 'owner' ? 'owner' as const : 'tenant' as const,
      familyCount: item.familyId ? '—' : '—',
      registerTime: item.createdAt || '-'
    }
  })
}

import { getEnumLabel, MERCHANT_AUDIT_STATUS_LABEL, MERCHANT_LEVEL_LABEL } from '../constants/enums'

export function mapMerchants(list: MerchantItem[]) {
  return list.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category || '-',
    categoryCode: item.category?.includes('餐') ? 'dining' as const : 'retail' as const,
    merchantLevel: getEnumLabel(MERCHANT_LEVEL_LABEL, item.merchantLevel),
    auditStatus: getEnumLabel(MERCHANT_AUDIT_STATUS_LABEL, item.auditStatus),
    commissionRate: item.commissionRate !== undefined ? `${formatPercent(item.commissionRate)}%` : '-',
    pointsRatio: item.pointExchangeRate !== undefined ? `${item.pointExchangeRate} / ¥1` : '-',
    cashbackRate: item.coinRebateRate !== undefined ? `${formatPercent(item.coinRebateRate)}%` : '0%',
    ownerPrice: item.memberDiscountPrice ? `${item.memberDiscountPrice}元` : '-',
    status: item.status === 'active' || item.auditStatus === 'approved' ? 'connected' as const : 'disconnected' as const
  }))
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
      frozenRecordId: undefined as string | undefined,
      status: item.coinFrozen || item.status === 'frozen' || item.status === 'disabled'
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
    status: item.status === 'archived' || item.status === 'withdrawn' ? 'withdrawn' as const : 'published' as const
  }))
}

export function normalizePermissionGroups(data: PermissionItemDto[] | { list?: PermissionItemDto[]; groups?: Array<{ category: string; items: PermissionItemDto[] }> } | undefined) {
  if (!data) return []
  if (Array.isArray(data)) {
    const map = new Map<string, PermissionItemDto[]>()
    data.forEach(item => {
      const category = item.category || item.group || '其他'
      if (!map.has(category)) map.set(category, [])
      map.get(category)!.push(item)
    })
    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items: items.map(item => ({
        code: item.id || item.code || item.name,
        name: item.name,
        checked: item.enabled ?? item.granted ?? false
      }))
    }))
  }
  if (data.groups) {
    return data.groups.map(group => ({
      category: group.category,
      items: group.items.map(item => ({
        code: item.id || item.code || item.name,
        name: item.name,
        checked: item.enabled ?? item.granted ?? false
      }))
    }))
  }
  if (data.list) {
    return normalizePermissionGroups(data.list)
  }
  return []
}

export function normalizeRolePresets(data: RolePresetDto[] | { list?: RolePresetDto[] } | undefined) {
  if (!data) return []
  const list = Array.isArray(data) ? data : data.list || []
  return list.map(item => ({
    code: item.id || item.code || item.name,
    name: item.name
  }))
}

export function mapPermissionLogs(list: Array<{ createdAt?: string; operatorName?: string; targetName?: string; targetUserName?: string; content?: string; changeContent?: string }>) {
  return list.map(item => ({
    time: item.createdAt || '-',
    operator: item.operatorName || '-',
    target: item.targetName || item.targetUserName || '-',
    content: item.content || item.changeContent || '-'
  }))
}

export function mapCollectionRate(overview: DashboardOverview) {
  return formatPercent(overview.summary?.propertyFeeCollectionRate)
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

export function mapPointsOverview(poolBalance?: number, overview?: DashboardOverview) {
  const summary = overview?.summary || {}
  const circulation = summary.totalCoinIssued ?? 0
  const consumed = summary.totalCoinRedeemed ?? Math.round(circulation * 0.25)
  return {
    poolAmount: formatMoney(poolBalance ?? summary.totalPointsIssued),
    pcoinTotal: circulation,
    pcoinConsumed: consumed,
    pcoinCirculating: Math.max(circulation - consumed, 0)
  }
}
