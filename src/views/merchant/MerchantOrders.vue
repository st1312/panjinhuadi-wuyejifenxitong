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
      <input v-model="filters.startDate" type="date" class="input" @change="reload" />
      <span class="sep">至</span>
      <input v-model="filters.endDate" type="date" class="input" @change="reload" />
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
              <th>金额</th>
              <th>配送地址</th>
              <th>状态</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ order.orderNo || order.id }}</td>
              <td>{{ order.residentName || '—' }}</td>
              <td>¥{{ formatMoney(order.totalAmount) }}</td>
              <td>{{ order.deliveryAddress || '—' }}</td>
              <td><span class="tag">{{ statusLabel(order) }}</span></td>
              <td>{{ order.createdAt || '—' }}</td>
              <td>
                <button
                  v-if="canDeliver(order)"
                  class="linkBtn"
                  :disabled="actionId === order.id"
                  @click="markDelivering(order.id)"
                >
                  开始配送
                </button>
                <span v-else class="muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">暂无订单</p>
        <div v-if="totalPages > 1" class="pagination">
          <button class="pageBtn" :disabled="page <= 1" @click="changePage(page - 1)">&lt;</button>
          <span class="pageInfo">{{ page }} / {{ totalPages }}</span>
          <button class="pageBtn" :disabled="page >= totalPages" @click="changePage(page + 1)">&gt;</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { merchantPortalApi } from '../../api/services'
import type { OrderItem } from '../../api/types'
import { ApiError } from '../../api/request'
import { getEnumLabel, ORDER_STATUS, ORDER_STATUS_LABEL } from '../../constants/enums'

const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => ({ value, label }))

const orders = ref<OrderItem[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)
const actionId = ref('')
const filters = reactive({ orderStatus: '', startDate: '', endDate: '' })

function formatMoney(value?: number) {
  if (value === undefined || value === null) return '0.00'
  return Number(value).toFixed(2)
}

function statusLabel(order: OrderItem) {
  const status = order.orderStatus || order.status
  return getEnumLabel(ORDER_STATUS_LABEL, status)
}

function canDeliver(order: OrderItem) {
  return (order.orderStatus || order.status) === ORDER_STATUS.PAID
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

async function markDelivering(id: string) {
  actionId.value = id
  try {
    await merchantPortalApi.updateOrderStatus(id, ORDER_STATUS.DELIVERING)
    await load(page.value)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '状态更新失败'
  } finally {
    actionId.value = ''
  }
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
.sep { color: #8c8c9a; font-size: 13px; }
.panel { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.loading, .empty, .error { text-align: center; padding: 32px 0; color: #8c8c9a; font-size: 14px; }
.error { color: #e05c5c; }
.table th, .table td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #f0f0f3; font-size: 13px; }
.table th { color: #8c8c9a; font-weight: 500; }
.tag { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #f4f5f7; color: #5c5c66; font-size: 12px; }
.linkBtn { color: #5c5c9e; font-size: 13px; cursor: pointer; }
.linkBtn:disabled { opacity: 0.6; cursor: not-allowed; }
.muted { color: #c8c8d0; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 16px; }
.pageBtn { padding: 6px 12px; border: 1px solid #e8e8ec; border-radius: 8px; background: #fff; cursor: pointer; }
.pageInfo { font-size: 13px; color: #8c8c9a; }
</style>
