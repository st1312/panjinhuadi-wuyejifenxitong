<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">工作台</h1>
        <p class="desc">统筹负责人工作概览 · 官方推荐模块</p>
      </div>
    </div>

    <p v-if="portal.loadError" class="bannerWarn">{{ portal.loadError }}，已展示登录缓存信息</p>

    <div v-if="loading" class="loading">加载中...</div>
    <template v-else>
      <div class="stats">
        <div class="statCard purple">
          <div class="label">负责人</div>
          <div class="value small">{{ displayName }}</div>
        </div>
        <div class="statCard">
          <div class="label">官方认证商家</div>
          <div class="value">{{ officialMerchantCount }}</div>
        </div>
        <div class="statCard green">
          <div class="label">板块负责人</div>
          <div class="value">{{ sectorCount }}</div>
        </div>
        <div class="statCard">
          <div class="label">待审核入驻</div>
          <div class="value">{{ pendingAuditCount }}</div>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <h3 class="cardTitle">统筹信息</h3>
          <ul class="infoList">
            <li><span>所属物业</span><strong>{{ propertyName }}</strong></li>
            <li><span>板块数量</span><strong>{{ sectorCount }} 个</strong></li>
            <li><span>个体负责人</span><strong>{{ individualLeaderCount }} 人</strong></li>
            <li><span>工作说明</span><strong>{{ description }}</strong></li>
          </ul>
          <div v-if="distributionSummary" class="subStats">
            <div class="subStat">
              <span>本月统筹分成</span>
              <strong>¥{{ formatMoney(distributionSummary.coordinatorAmount) }}</strong>
            </div>
          </div>
        </div>
        <div class="card">
          <h3 class="cardTitle">快捷入口</h3>
          <div class="actions">
            <RouterLink class="actionBtn" :to="{ name: 'coordinator-merchants' }">商家管理与审核</RouterLink>
            <RouterLink class="actionBtn" :to="{ name: 'coordinator-announcements' }">发布统筹公告</RouterLink>
            <RouterLink class="actionBtn" :to="{ name: 'coordinator-offers' }">特惠推送</RouterLink>
            <RouterLink class="actionBtn" :to="{ name: 'coordinator-sector-leaders' }">板块管理</RouterLink>
          </div>
          <ul class="tips">
            <li>审核商家入驻并推荐为官方认证商家</li>
            <li>发布平台级公告、管理活动组与社区服务</li>
            <li>调整商家排名、推送特惠、管理板块负责人</li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { distributionApi, merchantApi } from '../../api/services'
import { ApiError } from '../../api/request'
import { MERCHANT_LEVEL } from '../../constants/enums'
import { useAuthStore } from '../../stores/auth'
import { useCoordinatorPortalStore } from '../../stores/coordinatorPortal'

const auth = useAuthStore()
const portal = useCoordinatorPortalStore()
const loading = ref(false)
const officialMerchantCount = ref(0)
const pendingAuditCount = ref(0)
const distributionSummary = ref<{ coordinatorAmount?: number } | null>(null)

const detail = computed(() => portal.detail)
const displayName = computed(
  () => detail.value?.residentName || auth.username || '—'
)
const propertyName = computed(() => detail.value?.propertyCompanyName || '—')
const sectorCount = computed(() => detail.value?.sectorCount ?? 0)
const individualLeaderCount = computed(() => detail.value?.individualLeaderCount ?? 0)
const description = computed(() => detail.value?.description || '—')

function formatMoney(value?: number) {
  if (value === undefined || value === null) return '0.00'
  return Number(value).toFixed(2)
}

async function loadStats() {
  loading.value = true
  try {
    await portal.loadMy()
    const now = new Date()
    const end = now.toISOString().slice(0, 10)
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const [officialRes, pendingRes, statsRes] = await Promise.all([
      merchantApi.list({ page: 1, pageSize: 1, merchantLevel: MERCHANT_LEVEL.OFFICIAL_CERTIFIED }),
      merchantApi.listPending({ page: 1, pageSize: 1 }),
      distributionApi.stats({ startDate: start, endDate: end }).catch(() => null)
    ])
    officialMerchantCount.value =
      officialRes.pagination?.total ?? officialRes.list?.length ?? 0
    pendingAuditCount.value =
      pendingRes.pagination?.total ?? pendingRes.list?.length ?? 0
    distributionSummary.value = statsRes?.summary ?? null
  } catch (e) {
    console.error(e instanceof ApiError ? e.message : e)
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)
</script>

<style scoped>
.page { max-width: 1200px; }
.header { margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.bannerWarn { background: #fff7e6; color: #ad6800; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; }
.loading { color: #8c8c9a; font-size: 14px; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.statCard { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.statCard.purple .value { color: #5c5c9e; }
.statCard.green .value { color: #3aaf7d; }
.statCard .label { font-size: 13px; color: #8c8c9a; margin-bottom: 8px; }
.statCard .value { font-size: 28px; font-weight: 600; color: #1f1f2e; }
.statCard .value.small { font-size: 18px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.cardTitle { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.infoList { list-style: none; }
.infoList li { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid #f0f0f3; font-size: 14px; }
.infoList span { color: #8c8c9a; flex-shrink: 0; }
.infoList strong { color: #1f1f2e; text-align: right; font-weight: 500; }
.subStats { margin-top: 16px; padding-top: 12px; border-top: 1px solid #f0f0f3; }
.subStat { display: flex; justify-content: space-between; font-size: 14px; }
.subStat span { color: #8c8c9a; }
.subStat strong { color: #5c5c9e; }
.actions { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
.actionBtn { padding: 10px 16px; border-radius: 8px; background: #5c5c9e; color: #fff; text-decoration: none; font-size: 14px; }
.tips { padding-left: 18px; color: #5c5c66; line-height: 1.8; font-size: 14px; }
@media (max-width: 960px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
  .grid { grid-template-columns: 1fr; }
}
</style>
