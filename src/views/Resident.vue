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
        <form class="search" @submit.prevent="submitSearch">
          <IconSvg name="search" />
          <input
            v-model="searchKeyword"
            type="search"
            placeholder="搜索姓名、手机号..."
            @input="onSearchInput"
          />
        </form>
        <div class="filters">
          <select v-model="selectedBuilding" class="select" @change="applyFilters">
            <option value="">全部楼栋</option>
            <option v-for="building in buildingOptions" :key="building" :value="building">
              {{ building }}
            </option>
          </select>
          <select v-model="selectedUserType" class="select" @change="applyFilters">
            <option v-for="opt in RESIDENT_USER_TYPE_OPTIONS" :key="opt.value || 'all'" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
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
              <td colspan="6" class="emptyCell">加载中...</td>
            </tr>
            <tr v-else-if="!residents.length">
              <td colspan="6" class="emptyCell">暂无住户数据</td>
            </tr>
            <tr v-for="resident in residents" v-else :key="resident.id">
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
          </tbody>
        </table>
        <div class="footer">
          <span class="total">
            显示 {{ pageStart }} 到 {{ pageEnd }}，共 {{ residentTotal }} 条记录
          </span>
          <div v-if="totalPages > 1" class="pagination">
            <button class="pageBtn" :disabled="currentPage <= 1 || loading" @click="changePage(currentPage - 1)">&lt;</button>
            <span class="pageInfo">{{ currentPage }} / {{ totalPages }}</span>
            <button class="pageBtn" :disabled="currentPage >= totalPages || loading" @click="changePage(currentPage + 1)">&gt;</button>
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
import { computed, onMounted, ref, watch } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import IconSvg from '../components/IconSvg.vue'
import SegmentedControl from '../components/SegmentedControl.vue'
import { dashboardApi, residentApi } from '../api/services'
import type { ResidentItem } from '../api/types'
import { formatPercent, mapResidents } from '../api/mappers'
import { RESIDENT_USER_TYPE_OPTIONS } from '../constants/enums'

const PAGE_SIZE = 20

const loading = ref(true)
const searchKeyword = ref('')
const appliedKeyword = ref('')
const selectedBuilding = ref('')
const selectedUserType = ref('')
const buildingOptions = ref<string[]>([])
const residents = ref<ReturnType<typeof mapResidents>>([])
const residentTotal = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const residentBottomStats = ref({
  newToday: 0,
  newTrend: '0%',
  avgFamily: '—',
  occupancyRate: '—'
})

let searchTimer: ReturnType<typeof setTimeout>

const statusTabs = [
  { code: 'all', name: '全部' },
  { code: 'active', name: '正常' },
  { code: 'frozen', name: '已冻结' },
  { code: 'disabled', name: '已禁用' }
]
const activeStatus = ref('all')

const pageStart = computed(() => {
  if (!residentTotal.value) return 0
  return (currentPage.value - 1) * PAGE_SIZE + 1
})

const pageEnd = computed(() => {
  if (!residentTotal.value) return 0
  return Math.min(currentPage.value * PAGE_SIZE, residentTotal.value)
})

function collectBuildings(list: ResidentItem[]) {
  const set = new Set(buildingOptions.value)
  list.forEach(item => {
    if (item.building) set.add(item.building)
  })
  buildingOptions.value = Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

async function loadBuildingOptions() {
  try {
    const res = await residentApi.list({ page: 1, pageSize: 100, sort: '-createdAt' })
    collectBuildings(res.list || [])
  } catch (e) {
    console.error(e)
  }
}

async function loadResidents(page = currentPage.value) {
  loading.value = true
  try {
    const res = await residentApi.list({
      page,
      pageSize: PAGE_SIZE,
      keyword: appliedKeyword.value || undefined,
      building: selectedBuilding.value || undefined,
      userType: selectedUserType.value || undefined,
      status: activeStatus.value === 'all' ? undefined : activeStatus.value,
      sort: '-createdAt'
    })
    residents.value = mapResidents(res.list || [])
    residentTotal.value = res.pagination?.total ?? residents.value.length
    currentPage.value = res.pagination?.page ?? page
    totalPages.value = res.pagination?.totalPages ?? 1
    if (!selectedBuilding.value) {
      collectBuildings(res.list || [])
    }
  } catch (e) {
    console.error(e)
    residents.value = []
    residentTotal.value = 0
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  currentPage.value = 1
  loadResidents(1)
}

function submitSearch() {
  clearTimeout(searchTimer)
  appliedKeyword.value = searchKeyword.value.trim()
  currentPage.value = 1
  loadResidents(1)
}

function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(submitSearch, 300)
}

function changePage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page
  loadResidents(page)
}

watch(activeStatus, () => {
  currentPage.value = 1
  loadResidents(1)
})

onMounted(async () => {
  try {
    const overview = await dashboardApi.overview()
    await Promise.all([loadBuildingOptions(), loadResidents(1)])

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
  } catch (e) {
    console.error(e)
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
.select {
  padding: 10px 14px;
  border: 1px solid #e8e8ec;
  border-radius: 8px;
  background: #ffffff;
  color: #5c5c66;
  font-size: 14px;
  cursor: pointer;
  min-width: 120px;
  outline: none;
}
.select:focus { border-color: #5c5c9e; }
.table { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden; margin-bottom: 20px; }
.table table { width: 100%; font-size: 14px; }
.table thead th { text-align: left; padding: 14px 24px; color: #8c8c9a; font-weight: 500; background: #fafafc; border-bottom: 1px solid #f0f0f3; }
.table tbody td { padding: 16px 24px; color: #1f1f2e; border-bottom: 1px solid #f0f0f3; vertical-align: middle; }
.table tbody tr:last-child td { border-bottom: none; }
.table .emptyCell { text-align: center; padding: 24px; color: #8c8c9a; }
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
.table .pagination { display: flex; align-items: center; gap: 8px; }
.table .pageInfo { font-size: 13px; color: #8c8c9a; min-width: 48px; text-align: center; }
.table .pageBtn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px solid #e8e8ec; background: #ffffff; color: #5c5c66; font-size: 14px; cursor: pointer; }
.table .pageBtn:disabled { color: #c8c8d0; cursor: not-allowed; }
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
  .filters .select { flex: 1; }
  .table { overflow-x: auto; }
  .table table { min-width: 700px; }
  .stats { grid-template-columns: 1fr; }
}
</style>
