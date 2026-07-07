export interface Menu {
  name: string
  icon: string
  route: string
}

export const adminMenus: Menu[] = [
  { name: '数据大盘', icon: 'dashboard', route: 'dashboard' },
  { name: '住户管理', icon: 'resident', route: 'resident' },
  { name: '商家管理', icon: 'merchant', route: 'merchant' },
  { name: '权限配置', icon: 'permission', route: 'permission' },
  { name: '参数配置', icon: 'param', route: 'param' },
  { name: '积分管理', icon: 'points', route: 'points' },
  { name: '通告发布', icon: 'notice', route: 'notice' },
  { name: '送货管理', icon: 'delivery', route: 'delivery' }
]

export const merchantMenus: Menu[] = [
  { name: '店铺概览', icon: 'dashboard', route: 'merchant-overview' },
  { name: '订单管理', icon: 'retail', route: 'merchant-orders' },
  { name: '商品管理', icon: 'merchant', route: 'merchant-products' },
  { name: '积分管理', icon: 'points', route: 'merchant-points' },
  { name: '提现管理', icon: 'wallet', route: 'merchant-withdrawals' }
]

export const courierMenus: Menu[] = [
  { name: '抢单大厅', icon: 'delivery', route: 'courier-available' },
  { name: '我的任务', icon: 'history', route: 'courier-tasks' }
]

export const coordinatorMenus: Menu[] = [
  { name: '工作台', icon: 'dashboard', route: 'coordinator-overview' },
  { name: '商家管理', icon: 'merchant', route: 'coordinator-merchants' },
  { name: '商家排名', icon: 'chart', route: 'coordinator-ranking' },
  { name: '统筹公告', icon: 'notice', route: 'coordinator-announcements' },
  { name: '活动组', icon: 'people', route: 'coordinator-activity-groups' },
  { name: '服务管理', icon: 'home', route: 'coordinator-services' },
  { name: '特惠推送', icon: 'retail', route: 'coordinator-offers' },
  { name: '板块管理', icon: 'permission', route: 'coordinator-sector-leaders' },
  { name: '分成统计', icon: 'money', route: 'coordinator-stats' },
  { name: '分成明细', icon: 'history', route: 'coordinator-records' }
]

export const sectorLeaderMenus: Menu[] = [
  { name: '工作台', icon: 'dashboard', route: 'sector-leader-overview' },
  { name: '板块商家', icon: 'merchant', route: 'sector-leader-merchants' },
  { name: '板块排名', icon: 'chart', route: 'sector-leader-ranking' },
  { name: '板块特惠', icon: 'retail', route: 'sector-leader-offers' }
]

export const individualLeaderMenus: Menu[] = [
  { name: '工作台', icon: 'dashboard', route: 'individual-leader-overview' },
  { name: '我的服务', icon: 'home', route: 'individual-leader-services' }
]

/** @deprecated 请使用 getMenusForRole */
export const menus = adminMenus
