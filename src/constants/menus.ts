export interface Menu {
  name: string
  icon: string
  route: string
}

export const menus: Menu[] = [
  { name: '数据大盘', icon: 'dashboard', route: 'dashboard' },
  { name: '住户管理', icon: 'resident', route: 'resident' },
  { name: '商家管理', icon: 'merchant', route: 'merchant' },
  { name: '权限配置', icon: 'permission', route: 'permission' },
  { name: '参数配置', icon: 'param', route: 'param' },
  { name: '积分管理', icon: 'points', route: 'points' },
  { name: '通告发布', icon: 'notice', route: 'notice' },
  { name: '送货管理', icon: 'delivery', route: 'delivery' }
]
