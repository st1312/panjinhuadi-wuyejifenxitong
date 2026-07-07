<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">我的任务</h1>
        <p class="desc">管理已接配送任务</p>
      </div>
    </div>

    <div class="toolbar">
      <select v-model="statusFilter" class="select" @change="load(1)">
        <option value="">全部状态</option>
        <option value="accepted">已接单</option>
        <option value="delivering">配送中</option>
        <option value="completed">已完成</option>
        <option value="cancelled">已取消</option>
      </select>
    </div>

    <div class="panel">
      <div v-if="loading" class="loading">加载中...</div>
      <p v-else-if="error" class="error">{{ error }}</p>
      <table v-else-if="tasks.length" class="table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>商家</th>
            <th>送达地址</th>
            <th>收益</th>
            <th>状态</th>
            <th>接单时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in tasks" :key="item.id">
            <td>{{ item.orderNo || item.orderId }}</td>
            <td>{{ item.merchantName || '—' }}</td>
            <td>{{ item.deliveryAddress || '—' }}</td>
            <td>¥{{ formatMoney(item.courierEarning ?? item.fee) }}</td>
            <td>{{ getEnumLabel(DELIVERY_STATUS_LABEL, item.status) }}</td>
            <td>{{ item.acceptedAt || item.createdAt || '—' }}</td>
            <td>
              <button
                v-if="canStart(item)"
                class="linkBtn"
                :disabled="actionId === item.id"
                @click="startDelivery(item.id)"
              >
                开始配送
              </button>
              <button
                v-else-if="canComplete(item)"
                class="linkBtn"
                :disabled="actionId === item.id"
                @click="complete(item.id)"
              >
                完成配送
              </button>
              <span v-else class="muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">暂无配送任务</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { courierPortalApi } from '../../api/services'
import type { CourierDeliveryItem } from '../../api/types'
import { ApiError } from '../../api/request'
import { DELIVERY_STATUS, DELIVERY_STATUS_LABEL, getEnumLabel } from '../../constants/enums'

const tasks = ref<CourierDeliveryItem[]>([])
const loading = ref(false)
const error = ref('')
const statusFilter = ref('')
const actionId = ref('')

function formatMoney(value?: number) {
  if (value === undefined || value === null) return '0.00'
  return Number(value).toFixed(2)
}

function canStart(item: CourierDeliveryItem) {
  return item.status === DELIVERY_STATUS.GRABBED || item.status === 'accepted'
}

function canComplete(item: CourierDeliveryItem) {
  return item.status === DELIVERY_STATUS.DELIVERING || item.status === 'delivering'
}

async function load(page = 1) {
  loading.value = true
  error.value = ''
  try {
    const res = await courierPortalApi.my({
      page,
      pageSize: 20,
      status: statusFilter.value || undefined,
      sort: '-createdAt'
    })
    tasks.value = res.list || []
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '任务加载失败'
  } finally {
    loading.value = false
  }
}

async function startDelivery(id: string) {
  actionId.value = id
  try {
    await courierPortalApi.updateStatus(id, DELIVERY_STATUS.DELIVERING)
    await load(1)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '状态更新失败'
  } finally {
    actionId.value = ''
  }
}

async function complete(id: string) {
  actionId.value = id
  try {
    await courierPortalApi.complete(id, { remark: '已送达' })
    await load(1)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '完成配送失败'
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
.toolbar { margin-bottom: 16px; }
.select { padding: 8px 12px; border: 1px solid #e8e8ec; border-radius: 8px; background: #fff; }
.panel { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.loading, .empty, .error { text-align: center; padding: 32px 0; color: #8c8c9a; font-size: 14px; }
.error { color: #e05c5c; }
.table th, .table td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #f0f0f3; font-size: 13px; }
.linkBtn { color: #5c5c9e; cursor: pointer; margin-right: 8px; }
.linkBtn:disabled { opacity: 0.6; cursor: not-allowed; }
.muted { color: #c8c8d0; }
</style>
