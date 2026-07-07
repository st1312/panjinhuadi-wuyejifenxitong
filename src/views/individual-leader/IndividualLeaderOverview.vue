<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">工作台</h1>
        <p class="desc">个体负责人工作概览</p>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <template v-else>
      <div class="stats">
        <div class="statCard purple">
          <div class="label">姓名</div>
          <div class="value small">{{ profile?.name || auth.username || '—' }}</div>
        </div>
        <div class="statCard">
          <div class="label">所属物业</div>
          <div class="value small">{{ profile?.propertyName || '—' }}</div>
        </div>
        <div class="statCard green">
          <div class="label">我的服务数</div>
          <div class="value">{{ serviceCount }}</div>
        </div>
        <div class="statCard">
          <div class="label">账号状态</div>
          <div class="value small">{{ getEnumLabel(RESIDENT_STATUS_LABEL, profile?.status) }}</div>
        </div>
      </div>

      <div class="card">
        <h3 class="cardTitle">工作说明</h3>
        <ul class="tips">
          <li>在「我的服务」中发布和维护您负责的社区服务项目</li>
          <li>业主可通过小程序预约您发布的服务</li>
          <li>服务分类须与平台规范保持一致</li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { serviceApi } from '../../api/services'
import { ApiError } from '../../api/request'
import { getEnumLabel, RESIDENT_STATUS_LABEL } from '../../constants/enums'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const profile = computed(() => auth.profile)
const serviceCount = ref(0)
const loading = ref(false)

async function loadServices() {
  loading.value = true
  try {
    const servicesRes = await serviceApi.list({ mine: true, page: 1, pageSize: 1 })
    serviceCount.value = servicesRes.pagination?.total ?? servicesRes.list?.length ?? 0
  } catch (e) {
    console.error(e instanceof ApiError ? e.message : e)
  } finally {
    loading.value = false
  }
}

onMounted(loadServices)
</script>

<style scoped>
.page { max-width: 1200px; }
.header { margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.loading { color: #8c8c9a; font-size: 14px; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.statCard { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.statCard.purple .value { color: #5c5c9e; }
.statCard.green .value { color: #3aaf7d; }
.statCard .label { font-size: 13px; color: #8c8c9a; margin-bottom: 8px; }
.statCard .value { font-size: 22px; font-weight: 600; color: #1f1f2e; }
.statCard .value.small { font-size: 18px; }
.card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.cardTitle { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.tips { padding-left: 18px; color: #5c5c66; line-height: 1.8; font-size: 14px; }
@media (max-width: 960px) { .stats { grid-template-columns: repeat(2, 1fr); } }
</style>
