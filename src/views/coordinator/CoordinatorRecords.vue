<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">分成明细</h1>
        <p class="desc">查看订单分成记录</p>
      </div>
    </div>

    <div class="toolbar">
      <input v-model="startDate" type="date" class="input" />
      <span class="sep">至</span>
      <input v-model="endDate" type="date" class="input" />
      <button class="btnPrimary" :disabled="loading" @click="reload">查询</button>
    </div>

    <DistributionRecordsTable
      :records="records"
      :loading="loading"
      :error="error"
      :page="page"
      :total-pages="totalPages"
      @page-change="changePage"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DistributionRecordsTable from '../../components/DistributionRecordsTable.vue'
import { distributionApi } from '../../api/services'
import type { DistributionRecordItem } from '../../api/types'
import { ApiError } from '../../api/request'

const records = ref<DistributionRecordItem[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)
const startDate = ref('')
const endDate = ref('')

function defaultRange() {
  const now = new Date()
  endDate.value = now.toISOString().slice(0, 10)
  startDate.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}

async function load(pageNo = 1) {
  loading.value = true
  error.value = ''
  try {
    const res = await distributionApi.records({
      page: pageNo,
      pageSize: 20,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
      sort: '-createdAt'
    })
    records.value = res.list || []
    page.value = res.pagination?.page || pageNo
    totalPages.value = res.pagination?.totalPages || 1
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '记录加载失败'
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

onMounted(() => {
  defaultRange()
  load(1)
})
</script>

<style scoped>
.page { max-width: 1200px; }
.header { margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.input { padding: 8px 12px; border: 1px solid #e8e8ec; border-radius: 8px; background: #fff; }
.sep { color: #8c8c9a; font-size: 13px; }
.btnPrimary { padding: 10px 18px; border-radius: 8px; background: #5c5c9e; color: #fff; border: none; cursor: pointer; }
</style>
