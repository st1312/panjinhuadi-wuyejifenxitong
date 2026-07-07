<template>
  <div class="panel">
    <div v-if="loading" class="loading">加载中...</div>
    <p v-else-if="error" class="error">{{ error }}</p>
    <template v-else>
      <table v-if="records.length" class="table">
        <thead>
          <tr>
            <th>时间</th>
            <th>订单号</th>
            <th>商家</th>
            <th>可分配金额</th>
            <th v-if="showProperty">物业</th>
            <th v-if="showCoordinator">统筹</th>
            <th v-if="showSector">板块</th>
            <th v-if="showIndividual">个体</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in records" :key="item.id">
            <td>{{ item.createdAt || '—' }}</td>
            <td>{{ item.orderNo || item.orderId || '—' }}</td>
            <td>{{ item.merchantName || '—' }}</td>
            <td>{{ formatMoney(item.distributableAmount) }}</td>
            <td v-if="showProperty">{{ formatMoney(item.propertyAmount) }}</td>
            <td v-if="showCoordinator">{{ formatMoney(item.coordinatorAmount) }}</td>
            <td v-if="showSector">{{ formatMoney(item.sectorLeaderAmount) }}</td>
            <td v-if="showIndividual">{{ formatMoney(item.individualLeaderAmount) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">暂无分成记录</p>
      <div v-if="totalPages > 1" class="pagination">
        <button class="pageBtn" :disabled="page <= 1 || loading" @click="$emit('page-change', page - 1)">&lt;</button>
        <span class="pageInfo">{{ page }} / {{ totalPages }}</span>
        <button class="pageBtn" :disabled="page >= totalPages || loading" @click="$emit('page-change', page + 1)">&gt;</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DistributionRecordItem } from '../api/types'

interface Props {
  records: DistributionRecordItem[]
  loading?: boolean
  error?: string
  page?: number
  totalPages?: number
  showProperty?: boolean
  showCoordinator?: boolean
  showSector?: boolean
  showIndividual?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: '',
  page: 1,
  totalPages: 1,
  showProperty: true,
  showCoordinator: true,
  showSector: true,
  showIndividual: true
})

defineEmits<{ 'page-change': [page: number] }>()

function formatMoney(value?: number) {
  if (value === undefined || value === null) return '—'
  return `¥${Number(value).toFixed(2)}`
}
</script>

<style scoped>
.panel { background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.loading, .empty, .error { font-size: 14px; color: #8c8c9a; text-align: center; padding: 32px 0; }
.error { color: #e05c5c; }
.table th, .table td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #f0f0f3; font-size: 13px; }
.table th { color: #8c8c9a; font-weight: 500; }
.table td { color: #1f1f2e; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 16px; }
.pageBtn { padding: 6px 12px; border: 1px solid #e8e8ec; border-radius: 8px; background: #fff; cursor: pointer; }
.pageBtn:disabled { opacity: 0.5; cursor: not-allowed; }
.pageInfo { font-size: 13px; color: #8c8c9a; }
</style>
