<template>
  <AppLayout>
    <div class="page">
      <div class="header">
        <div>
          <h1 class="title">参数配置</h1>
          <p class="desc">管理全局业务规则与计费系数</p>
        </div>
        <button class="btnSave" :disabled="loading || saving" @click="handleSave">
          {{ saving ? '保存中...' : '保存全局设置' }}
        </button>
      </div>
      <div class="grid">
        <div class="card">
          <div class="header">
            <div class="icon purple"><IconSvg name="points" /></div>
            <span>积分设置区</span>
          </div>
          <div class="field">
            <label class="label">兑换比例</label>
            <div class="inline">
              <div class="inputWrap">
                <input v-model="config.pointsExchangeRate" type="number" class="input" />
                <span class="unit">积分/元</span>
              </div>
              <span class="hint">1元可兑换200积分</span>
            </div>
          </div>
          <div class="field">
            <label class="label">清零规则</label>
            <label class="checkbox">
              <input type="checkbox" v-model="config.pointsClearRule" />
              <span class="checkmark"><IconSvg v-if="config.pointsClearRule" name="check" /></span>
              <span>连续 24 个月欠费自动清零</span>
            </label>
            <p class="note">当业主连续欠缴物业费超过24个月时，系统将自动核销其名下所有积分。</p>
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
              <input v-model="config.pcoinValidity" type="number" class="input" />
              <span class="unit">个月</span>
            </div>
          </div>
          <div class="field">
            <div class="switchRow">
              <div>
                <div class="label">全局显示控制</div>
                <p class="note">开启后，用户端App将展示物业币余额</p>
              </div>
              <button class="switch" :class="{ active: config.pcoinDisplay }" @click="config.pcoinDisplay = !config.pcoinDisplay">
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
                <input v-model="config.deliveryBasePrice" type="text" class="input" />
              </div>
            </div>
            <div class="field">
              <label class="label">阶梯计费（每公斤）</label>
              <div class="inputWrap prefix">
                <span class="prefixText">¥</span>
                <input v-model="config.deliveryStepPrice" type="text" class="input" />
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
              <input v-model="config.courierReward" type="text" />
              <span>/ 件</span>
              <IconSvg name="edit" />
            </div>
          </div>
        </div>
        <div class="card">
          <div class="header">
            <div class="icon pink"><IconSvg name="bank" /></div>
            <span>分账设置区</span>
          </div>
          <div class="share">
            <div class="row">
              <span class="label">物业分成</span>
              <span class="value">{{ config.propertyShare }} %</span>
            </div>
            <div class="bar">
              <div class="fill" :style="{ width: `${config.propertyShare}%` }" />
            </div>
            <div class="row">
              <span class="label">统筹分成</span>
              <span class="value">{{ config.overallShare }} %</span>
            </div>
          </div>
          <div class="shareNote">
            <IconSvg name="info" />
            <span>此比例适用于所有接入社区的第三方商户订单结算。</span>
          </div>
        </div>
      </div>
      <div class="banner">
        <div class="sparkle">✦</div>
        <div class="text">智享万达 社区管理系统</div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import IconSvg from '../components/IconSvg.vue'
import { configApi } from '../api/services'
import { formatPercent } from '../api/mappers'
import { useAuthStore } from '../stores/auth'
import type { PropertyCompanyConfig } from '../api/types'

const auth = useAuthStore()
const loading = ref(true)
const saving = ref(false)

const config = reactive({
  pointsExchangeRate: 200,
  pointsClearRule: false,
  pcoinValidity: 12,
  pcoinDisplay: true,
  deliveryBasePrice: '1.00',
  deliveryStepPrice: '0.50',
  courierReward: '0.30',
  propertyShare: 30,
  overallShare: 70
})

function mapConfigToForm(apiConfig: PropertyCompanyConfig) {
  config.pointsExchangeRate = apiConfig.pointExchangeRate ?? 200
  config.pointsClearRule = apiConfig.twoYearClearEnabled ?? false
  config.pcoinValidity = apiConfig.coinExpiryDays
    ? Math.round(apiConfig.coinExpiryDays / 30)
    : 12
  config.pcoinDisplay = apiConfig.coinDisplayEnabled ?? true
  config.deliveryBasePrice = String(apiConfig.deliveryBaseFee ?? '1.00')
  config.deliveryStepPrice = String(apiConfig.perKgFee ?? apiConfig.deliveryPerKgFee ?? '0.50')
  config.courierReward = String(apiConfig.deliveryCourierPerOrder ?? '0.30')
  config.propertyShare = formatPercent(apiConfig.propertyShareRate ?? 0.3)
  config.overallShare = formatPercent(apiConfig.coordinatorShareRate ?? 0.7)
}

function mapFormToConfig(): PropertyCompanyConfig {
  return {
    pointExchangeRate: Number(config.pointsExchangeRate),
    twoYearClearEnabled: config.pointsClearRule,
    coinExpiryDays: Math.round(Number(config.pcoinValidity) * 30),
    coinDisplayEnabled: config.pcoinDisplay,
    deliveryBaseFee: parseFloat(config.deliveryBasePrice) || 0,
    perKgFee: parseFloat(config.deliveryStepPrice) || 0,
    deliveryCourierPerOrder: parseFloat(config.courierReward) || 0,
    propertyShareRate: config.propertyShare / 100,
    coordinatorShareRate: config.overallShare / 100
  }
}

onMounted(async () => {
  const companyId = auth.propertyCompanyId
  if (!companyId) {
    loading.value = false
    return
  }
  try {
    const detail = await configApi.propertyCompany(companyId)
    if (detail.config) mapConfigToForm(detail.config)
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  const companyId = auth.propertyCompanyId
  if (!companyId || saving.value) return
  saving.value = true
  try {
    const detail = await configApi.updateConfig(companyId, mapFormToConfig())
    if (detail.config) mapConfigToForm(detail.config)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page { max-width: 1200px; }
.header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.btnSave { padding: 10px 20px; border-radius: 8px; background: #5c5c9e; color: #ffffff; font-size: 14px; transition: background 0.2s; cursor: pointer; }
.btnSave:hover { background: #52529a; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

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
.card .unit { font-size: 13px; color: #8c8c9a; margin-left: 8px; white-space: nowrap; }
.card .inputWrap.prefix { padding-left: 0; }
.card .prefixText { padding: 0 12px; color: #8c8c9a; font-size: 14px; height: 100%; display: flex; align-items: center; }
.card .hint { font-size: 13px; color: #8c8c9a; }
.card .note { font-size: 12px; color: #8c8c9a; margin-top: 6px; line-height: 1.5; }
.card .checkbox { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; font-weight: 500; color: #1f1f2e; }
.card .checkbox input { position: absolute; opacity: 0; width: 0; height: 0; }
.card .checkmark { width: 18px; height: 18px; border-radius: 4px; background: #5c5c9e; color: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.card .checkmark svg { width: 14px; height: 14px; }
.card .switchRow { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.card .switch { width: 44px; height: 24px; border-radius: 12px; background: #e8e8ec; position: relative; cursor: pointer; transition: background 0.2s; border: none; flex-shrink: 0; }
.card .switch.active { background: #5c5c9e; }
.card .thumb { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #ffffff; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.card .switch.active .thumb { transform: translateX(20px); }
.card .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.card .courier { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #f4f5f7; border-radius: 10px; gap: 16px; }
.card .courier .info { flex: 1; }
.card .courier .title { font-size: 14px; font-weight: 500; color: #1f1f2e; margin-bottom: 4px; }
.card .courier .desc { font-size: 12px; color: #8c8c9a; }
.card .reward { display: flex; align-items: center; gap: 4px; color: #5c5c9e; font-size: 14px; font-weight: 500; }
.card .reward input { width: 50px; border: none; background: transparent; font-size: 14px; font-weight: 500; color: #5c5c9e; text-align: center; border-bottom: 1px solid #5c5c9e; padding: 0; }
.card .reward svg { width: 16px; height: 16px; margin-left: 8px; }
.card .share { margin-bottom: 16px; }
.card .share .row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.card .share .label { margin-bottom: 0; }
.card .share .value { font-size: 14px; font-weight: 600; color: #1f1f2e; }
.card .bar { height: 8px; border-radius: 4px; background: #e8e8ec; margin-bottom: 16px; overflow: hidden; }
.card .fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #5c5c9e 0%, #3aaf7d 100%); }
.card .shareNote { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #8c8c9a; }
.card .shareNote svg { width: 14px; height: 14px; flex-shrink: 0; color: #8c8c9a; }

.banner { height: 200px; border-radius: 16px; background: linear-gradient(135deg, #4a4a6a 0%, #7a7a9a 50%, #4a4a6a 100%); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.banner::before { content: ''; position: absolute; inset: 0; background: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80') center/cover; opacity: 0.3; }
.banner .sparkle { position: absolute; font-size: 48px; color: #ffffff; opacity: 0.8; top: 50%; left: 50%; transform: translate(-50%, -80%); }
.banner .text { position: relative; color: #ffffff; font-size: 20px; font-weight: 500; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }

@media (max-width: 900px) {
  .header { flex-direction: column; gap: 16px; }
  .grid { grid-template-columns: 1fr; }
  .card .row { grid-template-columns: 1fr; }
  .card .courier { flex-direction: column; align-items: flex-start; }
}
</style>
