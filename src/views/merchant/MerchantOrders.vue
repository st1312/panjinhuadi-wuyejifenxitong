<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">订单管理</h1>
        <p class="desc">查看和处理店铺订单</p>
      </div>
    </div>

    <div class="toolbar">
      <select v-model="filters.orderStatus" class="select" @change="reload">
        <option value="">全部状态</option>
        <option v-for="opt in ORDER_STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <input
        v-model="filters.startDate"
        type="date"
        class="input dateInput"
        :class="{ empty: !filters.startDate }"
        @change="reload"
      />
      <span class="sep">至</span>
      <input
        v-model="filters.endDate"
        type="date"
        class="input dateInput"
        :class="{ empty: !filters.endDate }"
        @change="reload"
      />
      <button class="btnGhost" :disabled="loading" @click="reload">查询</button>
    </div>

    <div class="panel">
      <div v-if="loading" class="loading">加载中...</div>
      <p v-else-if="error" class="error">{{ error }}</p>
      <template v-else>
        <table v-if="orders.length" class="table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>顾客</th>
              <th>商品</th>
              <th>金额</th>
              <th>支付</th>
              <th>配送地址</th>
              <th>状态</th>
              <th>下单时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td class="mono">{{ order.orderNo || order.id }}</td>
              <td>{{ order.residentName || '—' }}</td>
              <td class="itemsCell"><span class="itemsText">{{ itemsSummary(order) }}</span></td>
              <td class="amountCell">
                <div class="cellStack">
                  <div>¥{{ formatMoney(order.totalAmount) }}</div>
                  <div class="sub">{{ order.deliveryFee != null ? `含配送 ¥${formatMoney(order.deliveryFee)}` : '\u00A0' }}</div>
                </div>
              </td>
              <td class="payCell">{{ paymentSummary(order) }}</td>
              <td>{{ order.deliveryAddress || '—' }}</td>
              <td>
                <span class="tag" :class="statusClass(order)">{{ statusLabel(order) }}</span>
              </td>
              <td>{{ order.createdAt || '—' }}</td>
              <td class="actions">
                <div class="actionsInner">
                  <button class="linkBtn" @click="openDetail(order.id)">详情</button>
                  <button
                    v-if="canDeliver(order)"
                    class="linkBtn"
                    :disabled="actionId === order.id"
                    @click="markDelivering(order.id)"
                  >
                    开始配送
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">暂无订单</p>
        <div v-if="totalPages > 1" class="pagination">
          <button class="pageBtn" :disabled="page <= 1" @click="changePage(page - 1)">&lt;</button>
          <span class="pageInfo">{{ page }} / {{ totalPages }}（共 {{ total }} 条）</span>
          <button class="pageBtn" :disabled="page >= totalPages" @click="changePage(page + 1)">&gt;</button>
        </div>
      </template>
    </div>

    <Teleport to="body">
      <div v-if="detailOpen" class="modalOverlay" @click.self="closeDetail">
        <div class="modal">
          <div class="modalHeader">
            <h3 class="modalTitle">订单详情</h3>
            <button class="modalClose" @click="closeDetail">&times;</button>
          </div>
          <div class="modalBody">
            <div v-if="detailLoading" class="loading">加载详情中...</div>
            <p v-else-if="detailError" class="error">{{ detailError }}</p>
            <template v-else-if="detail">
              <div class="detailHead">
                <div>
                  <div class="orderNo">{{ detail.orderNo || detail.id }}</div>
                  <div class="meta">下单时间：{{ detail.createdAt || '—' }}</div>
                </div>
                <span class="tag large" :class="statusClass(detail)">{{ statusLabel(detail) }}</span>
              </div>

              <section class="section">
                <h4 class="sectionTitle">顾客信息</h4>
                <ul class="infoGrid">
                  <li><span>顾客</span><strong>{{ detail.residentName || '—' }}</strong></li>
                  <li><span>联系电话</span><strong>{{ detail.contactPhone || '—' }}</strong></li>
                  <li><span>配送地址</span><strong>{{ detail.deliveryAddress || '—' }}</strong></li>
                  <li><span>备注</span><strong>{{ detail.remark || '—' }}</strong></li>
                </ul>
              </section>

              <section class="section">
                <h4 class="sectionTitle">商品明细</h4>
                <table v-if="detail.items?.length" class="itemTable">
                  <thead>
                    <tr>
                      <th>商品</th>
                      <th>单价</th>
                      <th>数量</th>
                      <th>小计</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in detail.items" :key="item.productId || index">
                      <td>
                        <div class="productCell">
                          <img
                            v-if="item.coverUrl"
                            :src="item.coverUrl"
                            :alt="item.productName"
                            class="coverThumb"
                          />
                          <span v-else class="coverPlaceholder">无图</span>
                          <span>{{ item.productName || '—' }}</span>
                        </div>
                      </td>
                      <td>¥{{ formatMoney(item.price) }}</td>
                      <td>{{ item.quantity ?? '—' }}</td>
                      <td>¥{{ formatMoney(item.subtotal ?? (item.price || 0) * (item.quantity || 0)) }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="muted">暂无商品明细</p>
              </section>

              <section class="section">
                <h4 class="sectionTitle">费用与支付</h4>
                <ul class="infoGrid">
                  <li><span>商品合计</span><strong>¥{{ formatMoney(detail.totalAmount) }}</strong></li>
                  <li><span>配送费</span><strong>¥{{ formatMoney(detail.deliveryFee) }}</strong></li>
                  <li><span>支付方式</span><strong>{{ paymentMethodLabel(detail.paymentMethod) }}</strong></li>
                  <li><span>积分抵扣</span><strong>{{ detail.pointUsed ?? 0 }} 积分</strong></li>
                  <li><span>物业币</span><strong>¥{{ formatMoney(detail.coinUsed) }}</strong></li>
                  <li><span>现金</span><strong>¥{{ formatMoney(detail.cashAmount) }}</strong></li>
                </ul>
              </section>

              <section class="section">
                <h4 class="sectionTitle">配送与进度</h4>
                <ul class="infoGrid">
                  <li><span>配送员</span><strong>{{ detail.courierName || '—' }}</strong></li>
                  <li><span>配送单号</span><strong>{{ detail.deliveryId || '—' }}</strong></li>
                  <li><span>支付时间</span><strong>{{ detail.paidAt || '—' }}</strong></li>
                  <li><span>完成时间</span><strong>{{ detail.completedAt || '—' }}</strong></li>
                  <li><span>取消时间</span><strong>{{ detail.cancelledAt || '—' }}</strong></li>
                  <li><span>更新时间</span><strong>{{ detail.updatedAt || '—' }}</strong></li>
                </ul>
              </section>
            </template>
          </div>
          <div v-if="detail && canDeliver(detail)" class="modalFooter">
            <button class="btnPrimary" :disabled="actionId === detail.id" @click="markDeliveringFromDetail">
              {{ actionId === detail.id ? '处理中...' : '开始配送' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { merchantPortalApi } from '../../api/services'
import type { OrderItem } from '../../api/types'
import { ApiError } from '../../api/request'
import {
  getEnumLabel,
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL
} from '../../constants/enums'

const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => ({ value, label }))

const orders = ref<OrderItem[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const actionId = ref('')
const filters = reactive({ orderStatus: '', startDate: '', endDate: '' })

const detailOpen = ref(false)
const detailLoading = ref(false)
const detailError = ref('')
const detail = ref<OrderItem | null>(null)

function formatMoney(value?: number | null) {
  if (value === undefined || value === null) return '0.00'
  return Number(value).toFixed(2)
}

function orderStatus(order: OrderItem) {
  return order.orderStatus || order.status || ''
}

function statusLabel(order: OrderItem) {
  return getEnumLabel(ORDER_STATUS_LABEL, orderStatus(order))
}

function statusClass(order: OrderItem) {
  const status = orderStatus(order)
  if (status === ORDER_STATUS.PAID) return 'paid'
  if (status === ORDER_STATUS.DELIVERING) return 'delivering'
  if (status === ORDER_STATUS.COMPLETED) return 'completed'
  if (status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.REFUNDED) return 'cancelled'
  return ''
}

function paymentMethodLabel(method?: string) {
  return getEnumLabel(PAYMENT_METHOD_LABEL, method, method || '—')
}

function itemsSummary(order: OrderItem) {
  if (order.items?.length) {
    return order.items
      .map((item) => `${item.productName || '商品'}×${item.quantity ?? 1}`)
      .join('、')
  }
  return order.productSummary || '—'
}

function paymentSummary(order: OrderItem) {
  const parts: string[] = [paymentMethodLabel(order.paymentMethod)]
  if (order.pointUsed) parts.push(`${order.pointUsed}积分`)
  if (order.coinUsed) parts.push(`币¥${formatMoney(order.coinUsed)}`)
  if (order.cashAmount) parts.push(`现金¥${formatMoney(order.cashAmount)}`)
  return parts.filter((p) => p && p !== '—').join(' / ') || '—'
}

function canDeliver(order: OrderItem) {
  return orderStatus(order) === ORDER_STATUS.PAID
}

async function load(pageNo = 1) {
  loading.value = true
  error.value = ''
  try {
    const res = await merchantPortalApi.orders({
      page: pageNo,
      pageSize: 20,
      orderStatus: filters.orderStatus || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      sort: '-createdAt'
    })
    orders.value = res.list || []
    page.value = res.pagination?.page || pageNo
    totalPages.value = res.pagination?.totalPages || 1
    total.value = res.pagination?.total ?? orders.value.length
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '订单加载失败'
  } finally {
    loading.value = false
  }
}

function reload() {
  load(1)
}

function changePage(next: number) {
  load(next)
}

async function openDetail(id: string) {
  detailOpen.value = true
  detailLoading.value = true
  detailError.value = ''
  detail.value = null
  try {
    detail.value = await merchantPortalApi.getOrder(id)
  } catch (e) {
    detailError.value = e instanceof ApiError ? e.message : '订单详情加载失败'
  } finally {
    detailLoading.value = false
  }
}

function closeDetail() {
  detailOpen.value = false
  detail.value = null
  detailError.value = ''
}

async function markDelivering(id: string) {
  actionId.value = id
  try {
    await merchantPortalApi.updateOrderStatus(id, ORDER_STATUS.DELIVERING)
    await load(page.value)
    if (detail.value?.id === id) {
      detail.value = await merchantPortalApi.getOrder(id)
    }
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '状态更新失败'
  } finally {
    actionId.value = ''
  }
}

async function markDeliveringFromDetail() {
  if (!detail.value) return
  await markDelivering(detail.value.id)
}

onMounted(() => load(1))
</script>

<style scoped>
.page { max-width: 1200px; }
.header { margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.select, .input { padding: 8px 12px; border: 1px solid #e8e8ec; border-radius: 8px; background: #fff; font-size: 14px; }
.dateInput {
  padding: 6px 4px;
  width: 132px;
  box-sizing: border-box;
  line-height: 1.2;
}
.dateInput.empty {
  width: 132px;
  padding: 6px 4px;
  color: transparent;
}
.dateInput.empty::-webkit-datetime-edit,
.dateInput.empty::-webkit-datetime-edit-fields-wrapper {
  padding: 0;
  opacity: 0;
}
.dateInput.empty::-webkit-calendar-picker-indicator {
  opacity: 1;
  margin: 0;
  padding: 0;
  cursor: pointer;
}
.dateInput:not(.empty) {
  color: #1f1f2e;
  padding: 6px 8px;
}
.dateInput:not(.empty)::-webkit-datetime-edit {
  padding: 0;
}
.dateInput:not(.empty)::-webkit-calendar-picker-indicator {
  margin-left: 4px;
  cursor: pointer;
}
.btnGhost { padding: 8px 14px; border-radius: 8px; border: 1px solid #e8e8ec; background: #fff; cursor: pointer; font-size: 14px; }
.sep { color: #8c8c9a; font-size: 13px; }
.panel { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow-x: auto; }
.loading, .empty, .error { text-align: center; color: #8c8c9a; font-size: 14px; padding: 16px 0; }
.error { color: #e05c5c; }
.table { width: 100%; border-collapse: collapse; min-width: 980px; table-layout: fixed; }
.table th, .table td {
  padding: 10px;
  text-align: left;
  font-size: 13px;
  vertical-align: middle;
  box-sizing: border-box;
}
.table th { color: #8c8c9a; font-weight: 500; border-bottom: 1px solid #f0f0f3; }
.table tbody tr { border-bottom: 1px solid #f0f0f3; }
.table tbody td { border-bottom: none; }
.table th:nth-child(1), .table td:nth-child(1) { width: 130px; }
.table th:nth-child(3), .table td:nth-child(3) { width: 180px; }
.table th:nth-child(4), .table td:nth-child(4) { width: 100px; }
.table th:nth-child(5), .table td:nth-child(5) { width: 120px; }
.table th:nth-child(8), .table td:nth-child(8) { width: 150px; }
.table th:nth-child(9), .table td:nth-child(9) { width: 130px; }
.mono { font-family: ui-monospace, monospace; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.itemsText {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  word-break: break-all;
}
.payCell { line-height: 1.4; font-size: 12px; color: #5c5c66; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.amountCell { white-space: nowrap; }
.cellStack { display: flex; flex-direction: column; justify-content: center; gap: 2px; line-height: 1.3; }
.sub { font-size: 11px; color: #8c8c9a; min-height: 14px; }
.tag { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #f4f5f7; color: #5c5c66; font-size: 12px; white-space: nowrap; }
.tag.large { padding: 4px 12px; font-size: 13px; }
.tag.paid { background: #e6f4ff; color: #1677ff; }
.tag.delivering { background: #fff7e6; color: #d48806; }
.tag.completed { background: #f6ffed; color: #389e0d; }
.tag.cancelled { background: #fff1f0; color: #cf1322; }
.actions { height: 1px; }
.actionsInner {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}
.linkBtn {
  color: #5c5c9e;
  font-size: 13px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  line-height: 1.4;
  flex-shrink: 0;
  text-decoration: none;
}
.linkBtn:disabled { opacity: 0.6; cursor: not-allowed; }
.muted { color: #c8c8d0; font-size: 13px; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 16px; }
.pageBtn { padding: 6px 12px; border: 1px solid #e8e8ec; border-radius: 8px; background: #fff; cursor: pointer; }
.pageInfo { font-size: 13px; color: #8c8c9a; }
.modalOverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal { width: 720px; max-width: 100%; max-height: 90vh; background: #fff; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
.modalHeader { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f0f0f3; flex-shrink: 0; }
.modalTitle { font-size: 16px; font-weight: 600; }
.modalClose { font-size: 24px; color: #8c8c9a; cursor: pointer; background: none; border: none; }
.modalBody { padding: 24px; overflow-y: auto; }
.modalFooter { padding: 16px 24px 24px; border-top: 1px solid #f0f0f3; display: flex; justify-content: flex-end; flex-shrink: 0; }
.btnPrimary { padding: 10px 18px; border-radius: 8px; background: #5c5c9e; color: #fff; border: none; cursor: pointer; }
.detailHead { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
.orderNo { font-size: 18px; font-weight: 600; color: #1f1f2e; margin-bottom: 6px; }
.meta { font-size: 13px; color: #8c8c9a; }
.section { margin-bottom: 20px; }
.sectionTitle { font-size: 14px; font-weight: 600; color: #1f1f2e; margin-bottom: 12px; }
.infoGrid { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; }
.infoGrid li { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; padding: 8px 0; border-bottom: 1px solid #f7f7f9; }
.infoGrid span { color: #8c8c9a; flex-shrink: 0; }
.infoGrid strong { color: #1f1f2e; text-align: right; font-weight: 500; word-break: break-all; }
.itemTable { width: 100%; border-collapse: collapse; font-size: 13px; }
.itemTable th, .itemTable td { padding: 10px 8px; border-bottom: 1px solid #f0f0f3; text-align: left; }
.itemTable th { color: #8c8c9a; font-weight: 500; }
.productCell { display: flex; align-items: center; gap: 10px; }
.coverThumb { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid #f0f0f3; flex-shrink: 0; }
.coverPlaceholder { width: 40px; height: 40px; line-height: 40px; text-align: center; font-size: 10px; color: #8c8c9a; background: #f4f5f7; border-radius: 6px; flex-shrink: 0; }
@media (max-width: 640px) {
  .infoGrid { grid-template-columns: 1fr; }
}
</style>
