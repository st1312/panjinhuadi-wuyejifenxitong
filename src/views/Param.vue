<template>
    <div class="page">
      <div class="header">
        <div>
          <h1 class="title">参数配置</h1>
          <p class="desc">
            {{ companyDetail.name ? `${companyDetail.name} · ` : '' }}管理全局业务规则与计费系数
          </p>
        </div>
        <button class="btnSave" :disabled="loading || saving || !companyId" @click="handleSave">
          {{ saving ? '保存中...' : '保存全局设置' }}
        </button>
      </div>

      <p v-if="loadError" class="bannerError">{{ loadError }}</p>
      <p v-if="saveError" class="bannerError">{{ saveError }}</p>
      <p v-if="saveSuccess" class="bannerSuccess">{{ saveSuccess }}</p>

      <div v-if="loading" class="loadingText">加载配置中...</div>
      <template v-else>
        <div class="grid">
          <div class="card">
            <div class="header">
              <div class="icon purple"><IconSvg name="points" /></div>
              <span>积分设置区</span>
            </div>
            <div class="field">
              <label class="label">积分抵扣物业费比率</label>
              <div class="inline">
                <div class="inputWrap">
                  <input v-model.number="config.pointToFeeRatePercent" type="number" min="0" step="0.01" class="input" />
                  <span class="unit">%</span>
                </div>
                <span class="hint">积分抵扣物业费时折算比例</span>
              </div>
            </div>
            <div class="field">
              <label class="label">清零规则</label>
              <label class="checkbox">
                <input v-model="config.twoYearClearEnabled" type="checkbox" />
                <span class="checkmark"><IconSvg v-if="config.twoYearClearEnabled" name="check" /></span>
                <span>连续 24 个月欠费自动清零</span>
              </label>
              <p class="note">当业主连续欠缴物业费超过 24 个月时，系统将自动核销其名下所有积分。</p>
            </div>
          </div>

          <div class="card">
            <div class="header">
              <div class="icon green"><IconSvg name="coin" /></div>
              <span>物业币设置区</span>
            </div>
            <div class="field">
              <label class="label">有效期</label>
              <div class="inputWrap">
                <input v-model.number="config.coinExpiryDays" type="number" min="1" class="input" />
                <span class="unit">天</span>
              </div>
            </div>
            <div class="field">
              <label class="label">发放模式</label>
              <select v-model="config.coinIssueMode" class="select">
                <option v-for="opt in COIN_ISSUE_MODE_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div class="field">
              <div class="switchRow">
                <div>
                  <div class="label">全局显示控制</div>
                  <p class="note">开启后，用户端 App 将展示物业币余额</p>
                </div>
                <button type="button" class="switch" :class="{ active: config.coinDisplayEnabled }" @click="config.coinDisplayEnabled = !config.coinDisplayEnabled">
                  <span class="thumb" />
                </button>
              </div>
            </div>
            <div class="field">
              <div class="switchRow">
                <div>
                  <div class="label">新用户默认冻结</div>
                  <p class="note">开启后，新注册用户物业币默认处于冻结状态</p>
                </div>
                <button type="button" class="switch" :class="{ active: config.coinFreezeDefault }" @click="config.coinFreezeDefault = !config.coinFreezeDefault">
                  <span class="thumb" />
                </button>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="header">
              <div class="icon orange"><IconSvg name="delivery" /></div>
              <span>送货设置区</span>
            </div>
            <div class="row">
              <div class="field">
                <label class="label">起步价</label>
                <div class="inputWrap prefix">
                  <span class="prefixText">¥</span>
                  <input v-model.number="config.deliveryBaseFee" type="number" min="0" step="0.01" class="input" />
                </div>
              </div>
              <div class="field">
                <label class="label">快递员分成比例</label>
                <div class="inputWrap">
                  <input v-model.number="config.deliveryCourierShareRatePercent" type="number" min="0" max="100" step="0.1" class="input" />
                  <span class="unit">%</span>
                </div>
              </div>
            </div>
            <div class="courier">
              <div class="info">
                <div class="title">快递员报酬</div>
                <div class="desc">每成功配送一件快递，平台自动划拨至派送员账户</div>
              </div>
              <div class="reward">
                <span>¥</span>
                <input v-model.number="config.deliveryCourierPerOrder" type="number" min="0" step="0.01" />
                <span>/ 件</span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="header">
              <div class="icon pink"><IconSvg name="bank" /></div>
              <span>分账设置区</span>
            </div>
            <div class="shareGrid">
              <div class="field">
                <label class="label">物业分成</label>
                <div class="inputWrap">
                  <input v-model.number="config.propertySharePercent" type="number" min="0" max="100" step="0.1" class="input" />
                  <span class="unit">%</span>
                </div>
              </div>
              <div class="field">
                <label class="label">统筹分成</label>
                <div class="inputWrap">
                  <input v-model.number="config.coordinatorSharePercent" type="number" min="0" max="100" step="0.1" class="input" />
                  <span class="unit">%</span>
                </div>
              </div>
              <div class="field">
                <label class="label">板块负责人</label>
                <div class="inputWrap">
                  <input v-model.number="config.sectorLeaderPercent" type="number" min="0" max="100" step="0.1" class="input" />
                  <span class="unit">%</span>
                </div>
              </div>
              <div class="field">
                <label class="label">个体负责人</label>
                <div class="inputWrap">
                  <input v-model.number="config.individualLeaderPercent" type="number" min="0" max="100" step="0.1" class="input" />
                  <span class="unit">%</span>
                </div>
              </div>
            </div>
            <div class="bar">
              <div class="fill" :style="{ width: `${Math.min(config.propertySharePercent, 100)}%` }" />
            </div>
            <div class="shareNote">
              <IconSvg name="info" />
              <span>此比例适用于所有接入社区的第三方商户订单结算。</span>
            </div>
          </div>

          <div class="card">
            <div class="header">
              <div class="icon purple"><IconSvg name="setting" /></div>
              <span>其他设置</span>
            </div>
            <div class="field">
              <label class="label">提现手续费率</label>
              <div class="inputWrap">
                <input v-model.number="config.withdrawalFeeRatePercent" type="number" min="0" step="0.01" class="input" />
                <span class="unit">%</span>
              </div>
            </div>
            <div class="field">
              <label class="label">邻居私聊每日限制（主动新聊不同人数）</label>
              <div class="inputWrap">
                <input v-model.number="config.neighborDailyContactLimit" type="number" min="0" step="1" class="input" />
                <span class="unit">人/天</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="companyDetail.communities?.length || companyDetail.admins?.length" class="metaGrid">
          <div v-if="companyDetail.communities?.length" class="card metaCard">
            <div class="header">
              <span>小区列表（{{ companyDetail.communities.length }}）</span>
            </div>
            <ul class="metaList">
              <li v-for="item in companyDetail.communities" :key="item.id">
                {{ item.name || item.id }}
              </li>
            </ul>
          </div>
          <div v-if="companyDetail.admins?.length" class="card metaCard">
            <div class="header">
              <span>管理员列表（{{ companyDetail.admins.length }}）</span>
            </div>
            <ul class="metaList">
              <li v-for="item in companyDetail.admins" :key="item.id">
                {{ item.name || item.id }}
                <span v-if="item.phone" class="metaSub"> · {{ item.phone }}</span>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import IconSvg from '../components/IconSvg.vue'
import { configApi } from '../api/services'
import {
  normalizePropertyCompanyDetail,
  rateToFormPercent
} from '../api/mappers'
import { ApiError } from '../api/request'
import { useAuthStore } from '../stores/auth'
import type { PropertyCompanyConfig, PropertyCompanyDetail } from '../api/types'
import { COIN_ISSUE_MODE, COIN_ISSUE_MODE_OPTIONS } from '../constants/enums'

const auth = useAuthStore()
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const saveError = ref('')
const saveSuccess = ref('')

const companyDetail = reactive<PropertyCompanyDetail>({ id: '' })
const companyId = computed(() => auth.propertyCompanyId)

const config = reactive({
  pointToFeeRatePercent: 1,
  twoYearClearEnabled: false,
  coinExpiryDays: 365,
  coinDisplayEnabled: true,
  coinIssueMode: COIN_ISSUE_MODE.AUTO,
  coinFreezeDefault: false,
  deliveryBaseFee: 0.5,
  deliveryCourierShareRatePercent: 100,
  deliveryCourierPerOrder: 0.35,
  propertySharePercent: 30,
  coordinatorSharePercent: 70,
  sectorLeaderPercent: 10,
  individualLeaderPercent: 0,
  withdrawalFeeRatePercent: 0.6,
  neighborDailyContactLimit: 3
} as {
  pointToFeeRatePercent: number
  twoYearClearEnabled: boolean
  coinExpiryDays: number
  coinDisplayEnabled: boolean
  coinIssueMode: string
  coinFreezeDefault: boolean
  deliveryBaseFee: number
  deliveryCourierShareRatePercent: number
  deliveryCourierPerOrder: number
  propertySharePercent: number
  coordinatorSharePercent: number
  sectorLeaderPercent: number
  individualLeaderPercent: number
  withdrawalFeeRatePercent: number
  neighborDailyContactLimit: number
})

function mapConfigToForm(apiConfig: PropertyCompanyConfig) {
  config.pointToFeeRatePercent = rateToFormPercent(apiConfig.pointToFeeRate ?? 0.01)
  config.twoYearClearEnabled = apiConfig.twoYearClearEnabled ?? false
  config.coinExpiryDays = apiConfig.coinExpiryDays ?? 365
  config.coinDisplayEnabled = apiConfig.coinDisplayEnabled ?? true
  config.coinIssueMode = apiConfig.coinIssueMode || COIN_ISSUE_MODE.AUTO
  config.coinFreezeDefault = apiConfig.coinFreezeDefault ?? false
  config.deliveryBaseFee = apiConfig.deliveryBaseFee ?? 0.5
  config.deliveryCourierShareRatePercent = rateToFormPercent(apiConfig.deliveryCourierShareRate ?? 1)
  config.deliveryCourierPerOrder = apiConfig.deliveryCourierPerOrder ?? 0.35
  config.propertySharePercent = rateToFormPercent(apiConfig.propertyShareRate ?? 0.3)
  config.coordinatorSharePercent = rateToFormPercent(apiConfig.coordinatorShareRate ?? 0.7)
  config.sectorLeaderPercent = rateToFormPercent(apiConfig.sectorLeaderRate ?? 0.1)
  config.individualLeaderPercent = rateToFormPercent(apiConfig.individualLeaderRate ?? 0)
  config.withdrawalFeeRatePercent = rateToFormPercent(apiConfig.withdrawalFeeRate ?? 0.006)
  config.neighborDailyContactLimit = apiConfig.neighborDailyContactLimit ?? 3
}

function percentToRate(percent: number) {
  return percent / 100
}

function mapFormToConfig(): PropertyCompanyConfig {
  return {
    propertyShareRate: percentToRate(config.propertySharePercent),
    coordinatorShareRate: percentToRate(config.coordinatorSharePercent),
    sectorLeaderRate: percentToRate(config.sectorLeaderPercent),
    individualLeaderRate: percentToRate(config.individualLeaderPercent),
    coinDisplayEnabled: config.coinDisplayEnabled,
    coinIssueMode: config.coinIssueMode,
    coinExpiryDays: Math.round(Number(config.coinExpiryDays)),
    coinFreezeDefault: config.coinFreezeDefault,
    deliveryBaseFee: Number(config.deliveryBaseFee) || 0,
    deliveryCourierShareRate: percentToRate(config.deliveryCourierShareRatePercent),
    deliveryCourierPerOrder: Number(config.deliveryCourierPerOrder) || 0,
    withdrawalFeeRate: percentToRate(config.withdrawalFeeRatePercent),
    pointToFeeRate: percentToRate(config.pointToFeeRatePercent),
    twoYearClearEnabled: config.twoYearClearEnabled,
    neighborDailyContactLimit: Math.round(Number(config.neighborDailyContactLimit))
  }
}

function applyDetail(raw: Partial<PropertyCompanyDetail & PropertyCompanyConfig>, fallbackId?: string) {
  const detail = normalizePropertyCompanyDetail(raw, fallbackId || companyId.value || '')
  Object.assign(companyDetail, {
    id: detail.id,
    name: detail.name,
    logoUrl: detail.logoUrl,
    contactPhone: detail.contactPhone,
    address: detail.address,
    status: detail.status,
    communityCount: detail.communityCount,
    communities: detail.communities || [],
    admins: detail.admins || []
  })
  mapConfigToForm(detail.config || {})
}

async function loadDetail(options?: { silent?: boolean }) {
  const id = companyId.value
  if (!id) {
    loadError.value = '未获取到物业公司，请重新登录'
    return
  }
  if (!options?.silent) loading.value = true
  loadError.value = ''
  try {
    const detail = await configApi.propertyCompany(id)
    applyDetail(detail, id)
  } catch (e) {
    loadError.value = e instanceof ApiError ? e.message : '配置加载失败'
  } finally {
    if (!options?.silent) loading.value = false
  }
}

async function handleSave() {
  const id = companyId.value
  if (!id || saving.value) return
  saving.value = true
  saveError.value = ''
  saveSuccess.value = ''
  try {
    await configApi.updateConfig(id, mapFormToConfig())
    await loadDetail({ silent: true })
    saveSuccess.value = '配置已保存'
  } catch (e) {
    saveError.value = e instanceof ApiError ? e.message : '保存失败，请稍后重试'
  } finally {
    saving.value = false
  }
}

onMounted(loadDetail)
</script>

<style scoped>
.page { max-width: 1200px; }
.header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.btnSave { padding: 10px 20px; border-radius: 8px; background: #5c5c9e; color: #ffffff; font-size: 14px; transition: background 0.2s; cursor: pointer; border: none; }
.btnSave:hover:not(:disabled) { background: #52529a; }
.btnSave:disabled { opacity: 0.6; cursor: not-allowed; }
.bannerError { font-size: 13px; color: #e05c5c; margin-bottom: 12px; }
.bannerSuccess { font-size: 13px; color: #3aaf7d; margin-bottom: 12px; }
.loadingText { text-align: center; color: #8c8c9a; padding: 48px 0; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.metaGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

.card { background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.card .header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; font-size: 16px; font-weight: 500; color: #1f1f2e; }
.card .icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; }
.card .icon svg { width: 20px; height: 20px; }
.card .icon.purple { background: #5c5c9e; }
.card .icon.green { background: #3aaf7d; }
.card .icon.orange { background: #f5a623; }
.card .icon.pink { background: #e05c5c; }
.card .field { margin-bottom: 20px; }
.card .field:last-child { margin-bottom: 0; }
.card .label { display: block; font-size: 14px; color: #5c5c66; margin-bottom: 10px; }
.card .inline { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.card .inputWrap { display: flex; align-items: center; border: 1px solid #e8e8ec; border-radius: 8px; padding: 0 12px; background: #ffffff; height: 40px; min-width: 160px; }
.card .input { flex: 1; border: none; background: transparent; font-size: 14px; color: #1f1f2e; outline: none; min-width: 60px; }
.card .select { width: 100%; height: 40px; border: 1px solid #e8e8ec; border-radius: 8px; padding: 0 12px; font-size: 14px; color: #1f1f2e; background: #ffffff; outline: none; }
.card .select:focus { border-color: #5c5c9e; }
.card .unit { font-size: 13px; color: #8c8c9a; margin-left: 8px; white-space: nowrap; }
.card .inputWrap.prefix { padding-left: 0; }
.card .prefixText { padding: 0 12px; color: #8c8c9a; font-size: 14px; height: 100%; display: flex; align-items: center; }
.card .hint { font-size: 13px; color: #8c8c9a; }
.card .note { font-size: 12px; color: #8c8c9a; margin-top: 6px; line-height: 1.5; }
.card .checkbox { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; font-weight: 500; color: #1f1f2e; }
.card .checkbox input { position: absolute; opacity: 0; width: 0; height: 0; }
.card .checkmark { width: 18px; height: 18px; border-radius: 4px; border: 2px solid #d0d0d8; display: flex; align-items: center; justify-content: center; color: #ffffff; flex-shrink: 0; transition: all 0.2s; }
.card .checkbox input:checked + .checkmark { background: #5c5c9e; border-color: #5c5c9e; }
.card .checkmark svg { width: 14px; height: 14px; }
.card .switchRow { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.card .switch { width: 44px; height: 24px; border-radius: 12px; background: #e8e8ec; position: relative; cursor: pointer; transition: background 0.2s; border: none; flex-shrink: 0; }
.card .switch.active { background: #5c5c9e; }
.card .thumb { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #ffffff; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.card .switch.active .thumb { transform: translateX(20px); }
.card .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.card .shareGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.card .courier { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #f4f5f7; border-radius: 10px; gap: 16px; margin-top: 16px; }
.card .courier .info { flex: 1; }
.card .courier .title { font-size: 14px; font-weight: 500; color: #1f1f2e; margin-bottom: 4px; }
.card .courier .desc { font-size: 12px; color: #8c8c9a; }
.card .reward { display: flex; align-items: center; gap: 4px; color: #5c5c9e; font-size: 14px; font-weight: 500; }
.card .reward input { width: 60px; border: none; background: transparent; font-size: 14px; font-weight: 500; color: #5c5c9e; text-align: center; border-bottom: 1px solid #5c5c9e; padding: 0; }
.card .bar { height: 8px; border-radius: 4px; background: #e8e8ec; margin-bottom: 16px; overflow: hidden; }
.card .fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #5c5c9e 0%, #3aaf7d 100%); }
.card .shareNote { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #8c8c9a; }
.card .shareNote svg { width: 14px; height: 14px; flex-shrink: 0; color: #8c8c9a; }

.metaCard .header { margin-bottom: 12px; font-size: 15px; }
.metaList { list-style: none; margin: 0; padding: 0; max-height: 200px; overflow-y: auto; }
.metaList li { padding: 8px 0; border-bottom: 1px solid #f0f0f3; font-size: 14px; color: #1f1f2e; }
.metaList li:last-child { border-bottom: none; }
.metaSub { color: #8c8c9a; font-size: 13px; }

@media (max-width: 900px) {
  .header { flex-direction: column; gap: 16px; }
  .grid, .metaGrid { grid-template-columns: 1fr; }
  .card .row, .card .shareGrid { grid-template-columns: 1fr; }
  .card .courier { flex-direction: column; align-items: flex-start; }
}
</style>
