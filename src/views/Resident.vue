<template>
  <AppLayout>
    <div class="page">
      <div class="header">
        <div>
          <h1 class="title">住户资料管理</h1>
          <p class="desc">查看、审核及管理万达花园所有住户的基本信息。</p>
        </div>
        <SegmentedControl :tabs="statusTabs" v-model="activeStatus" />
      </div>
      <div class="toolbar">
        <div class="search">
          <IconSvg name="search" />
          <input type="text" placeholder="搜索姓名、电话、房号..." />
        </div>
        <div class="filters">
          <div class="select">
            <span>全部楼栋</span>
            <IconSvg name="chevronDown" />
          </div>
          <div class="select">
            <IconSvg name="person" />
            <span>身份筛选</span>
            <IconSvg name="chevronDown" />
          </div>
        </div>
      </div>
      <div class="table">
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>楼栋号</th>
              <th>身份</th>
              <th>家庭人数</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" style="text-align:center;padding:24px;color:#8c8c9a">加载中...</td>
            </tr>
            <template v-else>
            <tr v-for="resident in residents" :key="resident.id">
              <td>
                <div class="info">
                  <div class="avatar" :style="{ background: resident.avatarColor }">{{ resident.initials }}</div>
                  <span class="name">{{ resident.name }}</span>
                </div>
              </td>
              <td>{{ resident.building }}</td>
              <td>
                <span class="badge" :class="resident.identity === 'owner' ? 'purple' : 'green'">
                  {{ resident.identity === 'owner' ? '业主' : '租住人员' }}
                </span>
              </td>
              <td>{{ resident.familyCount }}</td>
              <td>{{ resident.registerTime }}</td>
              <td>
                <div class="actions">
                  <button class="approve"><IconSvg name="check" /></button>
                  <button class="reject"><IconSvg name="close" /></button>
                  <button class="detail"><IconSvg name="eye" /></button>
                </div>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
        <div class="footer">
          <span class="total">显示 1 到 {{ residents.length }} 共 {{ residentTotal }} 条待审核记录</span>
          <div class="pagination">
            <button class="pageBtn" disabled>&lt;</button>
            <button class="pageBtn active">1</button>
            <button class="pageBtn">2</button>
            <button class="pageBtn">3</button>
            <button class="pageBtn">&gt;</button>
          </div>
        </div>
      </div>
      <div class="stats">
        <div class="statCard">
          <div class="icon"><IconSvg name="person" /></div>
          <div class="info">
            <div class="label">今日新增注册</div>
            <div class="value">
              {{ residentBottomStats.newToday }}名
              <span class="trend"><IconSvg name="trend" />{{ residentBottomStats.newTrend }}</span>
            </div>
          </div>
        </div>
        <div class="statCard">
          <div class="icon"><IconSvg name="people" /></div>
          <div class="info">
            <div class="label">平均家庭人数</div>
            <div class="value">{{ residentBottomStats.avgFamily }}</div>
          </div>
        </div>
        <div class="statCard">
          <div class="icon"><IconSvg name="home" /></div>
          <div class="info">
            <div class="label">入住率</div>
            <div class="value">{{ residentBottomStats.occupancyRate }}</div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import IconSvg from '../components/IconSvg.vue'
import SegmentedControl from '../components/SegmentedControl.vue'
import { dashboardApi, residentApi } from '../api/services'
import { formatPercent, mapResidents } from '../api/mappers'

const loading = ref(true)
const residents = ref<ReturnType<typeof mapResidents>>([])
const residentTotal = ref(0)
const residentBottomStats = ref({
  newToday: 0,
  newTrend: '0%',
  avgFamily: '—',
  occupancyRate: '—'
})

const statusTabs = computed(() => {
  const total = residentTotal.value
  const pending = residents.value.length
  return [
    { code: 'pending', name: '待审核', count: pending },
    { code: 'approved', name: '已通过', count: Math.max(total - pending, 0) },
    { code: 'rejected', name: '已拒绝', count: 0 }
  ]
})
const activeStatus = ref('pending')

onMounted(async () => {
  try {
    const [res, overview] = await Promise.all([
      residentApi.list({ page: 1, pageSize: 20 }),
      dashboardApi.overview()
    ])
    residents.value = mapResidents(res.list || [])
    residentTotal.value = res.pagination?.total ?? residents.value.length

    const summary = overview.summary || {}
    const trends = overview.trends || {}
    residentBottomStats.value = {
      newToday: summary.newResidents ?? 0,
      newTrend: trends.residentGrowthRate !== undefined ? `${formatPercent(trends.residentGrowthRate)}%` : '0%',
      avgFamily: '—',
      occupancyRate: summary.propertyFeeCollectionRate !== undefined
        ? `${formatPercent(summary.propertyFeeCollectionRate)}%`
        : '—'
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page { max-width: 1200px; }
.header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.search { display: flex; align-items: center; gap: 8px; flex: 1; padding: 10px 14px; border: 1px solid #e8e8ec; border-radius: 8px; background: #fafafc; min-width: 240px; }
.search svg { width: 18px; height: 18px; color: #8c8c9a; }
.search input { flex: 1; border: none; background: transparent; font-size: 14px; color: #1f1f2e; outline: none; }
.search input::placeholder { color: #8c8c9a; }
.filters { display: flex; gap: 12px; }
.select { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border: 1px solid #e8e8ec; border-radius: 8px; background: #ffffff; color: #5c5c66; font-size: 14px; cursor: pointer; min-width: 120px; }
.select svg { width: 16px; height: 16px; color: #8c8c9a; }
.table { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden; margin-bottom: 20px; }
.table table { width: 100%; font-size: 14px; }
.table thead th { text-align: left; padding: 14px 24px; color: #8c8c9a; font-weight: 500; background: #fafafc; border-bottom: 1px solid #f0f0f3; }
.table tbody td { padding: 16px 24px; color: #1f1f2e; border-bottom: 1px solid #f0f0f3; vertical-align: middle; }
.table tbody tr:last-child td { border-bottom: none; }
.table .info { display: flex; align-items: center; gap: 12px; }
.table .avatar { width: 36px; height: 36px; border-radius: 50%; color: #ffffff; font-size: 13px; font-weight: 500; display: flex; align-items: center; justify-content: center; }
.table .name { font-weight: 500; color: #1f1f2e; }
.table .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.table .badge.purple { background: #f0f0ff; color: #5c5c9e; }
.table .badge.green { background: #e8f8f0; color: #3aaf7d; }
.table .actions { display: flex; align-items: center; gap: 12px; }
.table .actions button { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; border: 1px solid; background: transparent; cursor: pointer; }
.table .actions button svg { width: 14px; height: 14px; }
.table .approve { border-color: #3aaf7d; color: #3aaf7d; }
.table .reject { border-color: #e05c5c; color: #e05c5c; }
.table .detail { border-color: #e8e8ec; color: #8c8c9a; }
.table .footer { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; border-top: 1px solid #f0f0f3; }
.table .total { font-size: 13px; color: #8c8c9a; }
.table .pagination { display: flex; gap: 8px; }
.table .pageBtn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px solid #e8e8ec; background: #ffffff; color: #5c5c66; font-size: 14px; }
.table .pageBtn:disabled { color: #c8c8d0; cursor: not-allowed; }
.table .pageBtn.active { background: #5c5c9e; color: #ffffff; border-color: #5c5c9e; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.statCard { background: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; align-items: center; gap: 16px; }
.statCard .icon { width: 48px; height: 48px; border-radius: 50%; background: #f4f5f7; color: #5c5c9e; display: flex; align-items: center; justify-content: center; }
.statCard .icon svg { width: 24px; height: 24px; }
.statCard .info { flex: 1; }
.statCard .label { font-size: 13px; color: #8c8c9a; margin-bottom: 6px; }
.statCard .value { font-size: 20px; font-weight: 600; color: #1f1f2e; display: flex; align-items: center; gap: 8px; }
.statCard .trend { display: flex; align-items: center; gap: 2px; font-size: 12px; color: #3aaf7d; }
.statCard .trend svg { width: 12px; height: 12px; }
@media (max-width: 900px) {
  .header { flex-direction: column; gap: 16px; }
  .toolbar { flex-direction: column; align-items: stretch; }
  .filters { width: 100%; }
  .table { overflow-x: auto; }
  .table table { min-width: 700px; }
  .stats { grid-template-columns: 1fr; }
}
</style>
