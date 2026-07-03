<template>
  <AppLayout>
    <div class="page">
      <div class="header">
        <div>
          <h1 class="title">送货管理</h1>
          <p class="desc">管理快递配送、快递员与订单</p>
        </div>
        <button class="btnPrimary">
          <IconSvg name="plus" />
          <span>新建配送</span>
        </button>
      </div>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.code"
          class="tab"
          :class="{ active: activeTab === tab.code }"
          @click="activeTab = tab.code"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="stats">
        <div class="statCard">
          <div class="label">今日订单</div>
          <div class="value">
            {{ deliveryStats.todayOrders }}
            <span class="trend">+{{ deliveryStats.orderTrend }}</span>
          </div>
        </div>
        <div class="statCard">
          <div class="label">快递员在线</div>
          <div class="value">
            {{ deliveryStats.activeCouriers }}
            <span class="sub">/ {{ deliveryStats.totalCouriers }}</span>
          </div>
        </div>
        <div class="statCard">
          <div class="label">今日配送费</div>
          <div class="value">¥{{ deliveryStats.todayFee }}</div>
        </div>
        <div class="statCard">
          <div class="label">当前运力负荷</div>
          <div class="value load">{{ deliveryStats.loadLevel }}</div>
        </div>
      </div>

      <div class="panels">
        <div class="panel">
          <div class="header">
            <h3 class="title">快递员实时状态</h3>
            <div class="sync connected">
              <IconSvg name="refresh" />
              <span>实时同步中</span>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>快递员</th>
                <th>今日完成</th>
                <th>本月收入</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="courier in couriers" :key="courier.id">
                <td>
                  <div class="userInfo">
                    <div class="avatar" :style="{ background: courier.avatarColor }">{{ courier.initials }}</div>
                    <span class="name">{{ courier.name }}</span>
                  </div>
                </td>
                <td>{{ courier.todayCompleted }}</td>
                <td>{{ courier.monthlyIncome }}</td>
                <td>
                  <span class="status" :class="getCourierStatusClass(courier.status)">
                    {{ getCourierStatusText(courier.status) }}
                  </span>
                </td>
                <td>
                  <button class="action" :class="getActionClass(courier)">
                    {{ getActionText(courier) }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="panel">
          <div class="header">
            <h3 class="title">最新订单动态</h3>
            <button class="link">查看全部</button>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>时间</th>
                <th>用户</th>
                <th>商品</th>
                <th>费用</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in deliveryOrders" :key="order.time + order.user">
                <td>{{ order.time }}</td>
                <td>
                  <div>
                    <div class="name">{{ order.user }}</div>
                    <div class="room">{{ order.room }}</div>
                  </div>
                </td>
                <td>{{ order.product }}</td>
                <td>{{ order.fee }}</td>
                <td>
                  <span class="orderStatus" :class="getOrderStatusClass(order.status)">
                    {{ getOrderStatusText(order.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="capacity">
        <div class="header">
          <div>
            <div class="title">运力效能分析</div>
            <div class="desc">近24小时配送高峰与快递员响应曲线</div>
          </div>
          <div class="tabs">
            <button class="tab">24小时</button>
            <button class="tab active">7天</button>
          </div>
        </div>
        <div class="body">
          <div class="yAxis">
            <div class="line" v-for="n in 6" :key="n" />
          </div>
          <div class="bars">
            <div
              v-for="item in capacityData"
              :key="item.hour"
              class="barWrap"
            >
              <div class="bar" :style="{ height: `${item.value}%` }">
                <div v-if="item.label" class="label">{{ item.label }}</div>
              </div>
              <div class="hour">{{ item.hour }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import IconSvg from '../components/IconSvg.vue'
import { dashboardApi, deliveryApi } from '../api/services'
import { avatarColor, formatMoney, formatPercent, initials } from '../api/mappers'
import type { DeliveryTaskItem, OrderItem } from '../api/types'

const loading = ref(true)
const activeTab = ref('couriers')
const tabs = [
  { code: 'params', name: '送货参数' },
  { code: 'couriers', name: '快递员管理' },
  { code: 'orders', name: '订单监控' }
]

const deliveryStats = ref({
  todayOrders: 0,
  orderTrend: '0',
  activeCouriers: 0,
  totalCouriers: 0,
  todayFee: '0.00',
  loadLevel: '—'
})

interface CourierRow {
  id: string
  name: string
  initials: string
  avatarColor: string
  todayCompleted: number
  monthlyIncome: string
  status: 'online' | 'offline' | 'backup'
}

interface OrderRow {
  time: string
  user: string
  room: string
  product: string
  fee: string
  status: 'grabbed' | 'pending' | 'delivering' | 'completed'
}

const couriers = ref<CourierRow[]>([])
const deliveryOrders = ref<OrderRow[]>([])

const capacityData = ref([
  { hour: '08:00', value: 10 },
  { hour: '10:00', value: 25 },
  { hour: '12:00', value: 15 },
  { hour: '14:00', value: 40, label: '高峰' },
  { hour: '16:00', value: 30 },
  { hour: '18:00', value: 55 },
  { hour: '20:00', value: 20 }
])

function mapOrderStatus(status?: string): OrderRow['status'] {
  if (!status) return 'pending'
  if (status === 'grabbed' || status === 'accepted') return 'grabbed'
  if (status === 'delivering' || status === 'in_transit') return 'delivering'
  if (status === 'completed' || status === 'delivered') return 'completed'
  return 'pending'
}

function mapCourierStatus(status?: string): CourierRow['status'] {
  if (status === 'backup' || status === 'fallback') return 'backup'
  if (status === 'offline' || status === 'inactive') return 'offline'
  return 'online'
}

function mapOrders(list: OrderItem[]): OrderRow[] {
  return list.map(item => ({
    time: item.createdAt?.slice(11, 16) || item.createdAt || '-',
    user: item.residentName || '—',
    room: item.room || '—',
    product: item.productSummary || '—',
    fee: item.deliveryFee !== undefined ? `¥${formatMoney(item.deliveryFee)}` : '—',
    status: mapOrderStatus(item.status)
  }))
}

function mapCouriers(list: DeliveryTaskItem[]): CourierRow[] {
  return list.map(item => {
    const name = item.courierName || '快递员'
    return {
      id: item.id,
      name,
      initials: initials(name),
      avatarColor: avatarColor(item.id),
      todayCompleted: 0,
      monthlyIncome: '¥0.00',
      status: mapCourierStatus(item.status)
    }
  })
}

onMounted(async () => {
  try {
    const [overview, orders, couriersRes] = await Promise.all([
      dashboardApi.overview(),
      deliveryApi.orders({ page: 1, pageSize: 20 }),
      deliveryApi.couriers({ page: 1, pageSize: 20 })
    ])

    const trends = overview.trends || {}
    const orderList = orders.list || []
    const courierList = couriersRes.list || []

    deliveryStats.value = {
      todayOrders: orderList.length,
      orderTrend: trends.orderGrowthRate !== undefined ? String(formatPercent(trends.orderGrowthRate)) : '0',
      activeCouriers: courierList.filter(t => mapCourierStatus(t.status) === 'online').length,
      totalCouriers: courierList.length || 1,
      todayFee: formatMoney(orderList.reduce((sum, o) => sum + (o.deliveryFee || 0), 0)),
      loadLevel: courierList.length > 10 ? '较高' : courierList.length > 5 ? '中等' : '较低'
    }

    deliveryOrders.value = mapOrders(orderList)
    couriers.value = mapCouriers(courierList)
  } finally {
    loading.value = false
  }
})

function getCourierStatusClass(status: string) {
  if (status === 'online') return 'online'
  if (status === 'offline') return 'offline'
  return 'backup'
}

function getCourierStatusText(status: string) {
  if (status === 'online') return '在线'
  if (status === 'offline') return '离线'
  return '兜底'
}

function getOrderStatusClass(status: string) {
  if (status === 'grabbed') return 'grabbed'
  if (status === 'pending') return 'pending'
  if (status === 'delivering') return 'delivering'
  return 'completed'
}

function getOrderStatusText(status: string) {
  if (status === 'grabbed') return '已抢单'
  if (status === 'pending') return '待抢单'
  if (status === 'delivering') return '配送中'
  return '已完成'
}

function getActionText(courier: { status: string }) {
  if (courier.status === 'backup') return '不可停用'
  if (courier.status === 'offline') return '激活'
  return '停用'
}

function getActionClass(courier: { status: string }) {
  if (courier.status === 'backup') return 'disabled'
  if (courier.status === 'offline') return 'activate'
  return 'stop'
}
</script>

<style scoped>
.page { max-width: 1200px; }
.header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.btnPrimary { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 8px; background: #5c5c9e; color: #ffffff; font-size: 14px; cursor: pointer; transition: background 0.2s; }
.btnPrimary:hover { background: #52529a; }
.btnPrimary svg { width: 18px; height: 18px; }

.tabs { display: flex; gap: 24px; border-bottom: 1px solid #e8e8ec; margin-bottom: 20px; }
.tab { padding: 10px 0; font-size: 14px; color: #5c5c66; position: relative; border: none; background: transparent; border-bottom: 2px solid transparent; cursor: pointer; }
.tab.active { color: #5c5c9e; border-bottom-color: #5c5c9e; }

.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
.statCard { background: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.statCard .label { font-size: 13px; color: #8c8c9a; margin-bottom: 8px; }
.statCard .value { font-size: 24px; font-weight: 700; color: #1f1f2e; display: flex; align-items: center; gap: 8px; }
.statCard .trend { font-size: 12px; color: #3aaf7d; font-weight: 500; }
.statCard .sub { font-size: 14px; color: #8c8c9a; font-weight: 400; }
.statCard .value.load { color: #f5a623; font-size: 20px; position: relative; padding-bottom: 8px; }
.statCard .value.load::after { content: ''; position: absolute; bottom: 0; left: 0; width: 40px; height: 3px; background: #f5a623; border-radius: 2px; }

.panels { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.panel { background: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.panel .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.panel .title { font-size: 15px; font-weight: 500; color: #1f1f2e; margin-bottom: 0; }
.panel .link { font-size: 13px; color: #5c5c9e; background: transparent; border: none; cursor: pointer; }
.panel .link:hover { color: #52529a; }
.panel .sync { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #3aaf7d; }
.panel .sync svg { width: 14px; height: 14px; animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.panel .table { width: 100%; font-size: 14px; }
.panel .table thead th { text-align: left; padding: 12px; color: #8c8c9a; font-weight: 500; background: #fafafc; border-bottom: 1px solid #f0f0f3; }
.panel .table tbody td { padding: 14px 12px; color: #1f1f2e; border-bottom: 1px solid #f0f0f3; vertical-align: middle; }
.panel .table tbody tr:last-child td { border-bottom: none; }
.panel .userInfo { display: flex; align-items: center; gap: 10px; }
.panel .avatar { width: 32px; height: 32px; border-radius: 50%; color: #ffffff; font-size: 12px; font-weight: 500; display: flex; align-items: center; justify-content: center; }
.panel .name { font-weight: 500; color: #1f1f2e; }
.panel .room { font-size: 12px; color: #8c8c9a; }
.panel .status { display: inline-block; padding: 3px 8px; border-radius: 10px; font-size: 12px; font-weight: 500; }
.panel .status.online { background: #e8f8f0; color: #3aaf7d; }
.panel .status.offline { background: #f0f0f0; color: #8c8c9a; }
.panel .status.backup { background: #fff8e8; color: #f5a623; }
.panel .action { font-size: 13px; font-weight: 500; background: transparent; border: none; cursor: pointer; }
.panel .action.stop { color: #e05c5c; }
.panel .action.activate { color: #5c5c9e; }
.panel .action.disabled { color: #c8c8d0; cursor: not-allowed; }
.panel .orderStatus { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.panel .orderStatus.grabbed { background: #e8f8f0; color: #3aaf7d; }
.panel .orderStatus.pending { background: #fff8e8; color: #f5a623; }
.panel .orderStatus.delivering { background: #f0f0ff; color: #5c5c9e; }
.panel .orderStatus.completed { background: #f0f0f0; color: #8c8c9a; }

.capacity { background: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.capacity .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.capacity .title { font-size: 15px; font-weight: 500; color: #1f1f2e; margin-bottom: 4px; }
.capacity .desc { font-size: 12px; color: #8c8c9a; }
.capacity .tabs { display: flex; border: 1px solid #e8e8ec; border-radius: 8px; overflow: hidden; border-bottom: none; margin-bottom: 0; gap: 0; }
.capacity .tab { padding: 6px 14px; font-size: 13px; color: #5c5c66; border: none; background: #ffffff; cursor: pointer; border-bottom: none; }
.capacity .tab.active { background: #5c5c9e; color: #ffffff; }
.capacity .body { position: relative; height: 200px; display: flex; }
.capacity .yAxis { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 10px 0; }
.capacity .line { height: 1px; background: #f0f0f3; }
.capacity .bars { display: flex; align-items: flex-end; justify-content: space-around; flex: 1; padding-left: 30px; z-index: 1; }
.capacity .barWrap { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
.capacity .bar { width: 40px; background: #d8d8e8; border-radius: 4px 4px 0 0; position: relative; transition: height 0.6s ease; min-height: 8px; }
.capacity .barWrap:nth-child(5) .bar { background: #5c5c9e; }
.capacity .bar .label { position: absolute; top: -22px; left: 50%; transform: translateX(-50%); padding: 2px 6px; border-radius: 4px; background: #5c5c9e; color: #ffffff; font-size: 10px; white-space: nowrap; }
.capacity .hour { font-size: 12px; color: #8c8c9a; }

@media (max-width: 1024px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
  .panels { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .stats { grid-template-columns: 1fr; }
  .header { flex-direction: column; gap: 16px; }
  .capacity .bars { overflow-x: auto; }
}
</style>
