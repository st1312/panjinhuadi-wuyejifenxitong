<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">业主商户</h1>
        <p class="desc">申请审核、保证金管理、T+1 结算明细与参数配置</p>
      </div>
      <div class="headerActions">
        <button type="button" class="btnSecondary" @click="openSettings">参数设置</button>
        <button type="button" class="btnSecondary" @click="openDistributor">上架一级货源</button>
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="tab"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="panel">
      <div v-if="loading" class="hint">加载中...</div>
      <p v-else-if="error" class="error">{{ error }}</p>

      <table v-else-if="activeTab === 'applications' && applications.length" class="table">
        <thead>
          <tr>
            <th>申请人</th>
            <th>小区</th>
            <th>保证金</th>
            <th>状态</th>
            <th>申请时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in applications" :key="item.id">
            <td>{{ item.residentName || item.residentId }} · {{ item.phone || '' }}</td>
            <td>{{ item.communityName || item.communityId || '—' }}</td>
            <td>{{ item.depositAmount ?? '—' }}（{{ item.depositStatus || '—' }}）</td>
            <td>{{ item.status || item.statusCode || '—' }}</td>
            <td>{{ item.createdAt || '—' }}</td>
            <td class="actions">
              <button type="button" class="linkBtn" @click="auditApp(item.id, AUDIT_RESULT.APPROVED)">
                通过
              </button>
              <button
                type="button"
                class="linkBtn danger"
                @click="auditApp(item.id, AUDIT_RESULT.REJECTED)"
              >
                拒绝
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="activeTab === 'deposits' && deposits.length" class="table">
        <thead>
          <tr>
            <th>住户</th>
            <th>金额</th>
            <th>已扣</th>
            <th>状态</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in deposits" :key="item.id">
            <td>{{ item.residentName || item.residentId || '—' }}</td>
            <td>{{ item.amount ?? '—' }}</td>
            <td>{{ item.deductedAmount ?? 0 }}</td>
            <td>{{ item.status || item.statusCode || '—' }}</td>
            <td>{{ item.createdAt || '—' }}</td>
            <td>
              <button type="button" class="linkBtn" @click="openDeduct(item)">扣除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="activeTab === 'settlements' && settlements.length" class="table">
        <thead>
          <tr>
            <th>订单</th>
            <th>业主商户</th>
            <th>进货价</th>
            <th>售价</th>
            <th>抽成</th>
            <th>结算额</th>
            <th>状态</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in settlements" :key="item.id">
            <td>{{ item.orderId || '—' }}</td>
            <td>{{ item.residentName || item.residentMerchantId || '—' }}</td>
            <td>{{ item.wholesaleAmount ?? '—' }}</td>
            <td>{{ item.retailAmount ?? '—' }}</td>
            <td>{{ item.commissionAmount ?? '—' }}</td>
            <td>{{ item.settlementAmount ?? '—' }}</td>
            <td>{{ item.status || item.statusCode || '—' }}</td>
            <td>{{ item.settledAt || item.createdAt || '—' }}</td>
          </tr>
        </tbody>
      </table>

      <p
        v-else-if="
          !loading &&
          ((activeTab === 'applications' && !applications.length) ||
            (activeTab === 'deposits' && !deposits.length) ||
            (activeTab === 'settlements' && !settlements.length))
        "
        class="hint"
      >
        暂无数据
      </p>
    </div>

    <Teleport to="body">
      <div v-if="deductOpen" class="modalOverlay" @click.self="deductOpen = false">
        <div class="modal">
          <div class="modalHeader">
            <h3 class="modalTitle">扣除保证金</h3>
            <button type="button" class="modalClose" @click="deductOpen = false">&times;</button>
          </div>
          <div class="modalBody">
            <div class="field">
              <label class="label">扣除金额</label>
              <input v-model.number="deductForm.amount" type="number" min="0.01" step="0.01" class="input" />
            </div>
            <div class="field">
              <label class="label">原因</label>
              <textarea v-model="deductForm.reason" class="textarea" rows="3" />
            </div>
            <p v-if="deductError" class="error">{{ deductError }}</p>
            <div class="modalFooter">
              <button type="button" class="btnSecondary" @click="deductOpen = false">取消</button>
              <button type="button" class="btnPrimary" :disabled="deducting" @click="submitDeduct">
                {{ deducting ? '提交中...' : '确认扣除' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="settingsOpen" class="modalOverlay" @click.self="settingsOpen = false">
        <div class="modal">
          <div class="modalHeader">
            <h3 class="modalTitle">业主商户参数</h3>
            <button type="button" class="modalClose" @click="settingsOpen = false">&times;</button>
          </div>
          <div class="modalBody">
            <div class="field">
              <label class="label">默认保证金（元）</label>
              <input v-model.number="settings.defaultDepositAmount" type="number" min="0" class="input" />
            </div>
            <div class="field">
              <label class="label">平台抽成比例（0~1）</label>
              <input
                v-model.number="settings.platformCommissionRate"
                type="number"
                min="0"
                max="1"
                step="0.01"
                class="input"
              />
            </div>
            <div class="field">
              <label class="label">退货窗口（天）</label>
              <input v-model.number="settings.refundWindowDays" type="number" min="1" class="input" />
            </div>
            <p v-if="settingsError" class="error">{{ settingsError }}</p>
            <div class="modalFooter">
              <button type="button" class="btnSecondary" @click="settingsOpen = false">取消</button>
              <button type="button" class="btnPrimary" :disabled="settingsSaving" @click="saveSettings">
                {{ settingsSaving ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="distributorOpen" class="modalOverlay" @click.self="distributorOpen = false">
        <div class="modal">
          <div class="modalHeader">
            <h3 class="modalTitle">上架一级经销商品</h3>
            <button type="button" class="modalClose" @click="distributorOpen = false">&times;</button>
          </div>
          <div class="modalBody">
            <div class="field">
              <label class="label">商品名称</label>
              <input v-model="distributorForm.name" class="input" />
            </div>
            <div class="field">
              <label class="label">封面 URL</label>
              <input v-model="distributorForm.coverUrl" class="input" />
            </div>
            <div class="fieldRow">
              <div class="field">
                <label class="label">进货价</label>
                <input v-model.number="distributorForm.wholesalePrice" type="number" min="0" class="input" />
              </div>
              <div class="field">
                <label class="label">建议零售价</label>
                <input
                  v-model.number="distributorForm.suggestedRetailPrice"
                  type="number"
                  min="0"
                  class="input"
                />
              </div>
            </div>
            <div class="field">
              <label class="label">库存</label>
              <input v-model.number="distributorForm.stock" type="number" min="0" class="input" />
            </div>
            <div class="field">
              <label class="label">描述</label>
              <textarea v-model="distributorForm.description" class="textarea" rows="3" />
            </div>
            <p v-if="distributorError" class="error">{{ distributorError }}</p>
            <div class="modalFooter">
              <button type="button" class="btnSecondary" @click="distributorOpen = false">取消</button>
              <button type="button" class="btnPrimary" :disabled="distributorSaving" @click="submitDistributor">
                {{ distributorSaving ? '提交中...' : '上架' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { residentMerchantAdminApi } from '../../api/services'
import { ApiError } from '../../api/request'
import type {
  ResidentMerchantApplicationItem,
  ResidentMerchantDepositItem,
  ResidentMerchantSettlementItem,
  ResidentMerchantSettings
} from '../../api/types'
import { AUDIT_RESULT, getPhase2ErrorMessage } from '../../constants/enums'

const tabs = [
  { key: 'applications', label: '申请审核' },
  { key: 'deposits', label: '保证金' },
  { key: 'settlements', label: '结算明细' }
] as const

type TabKey = (typeof tabs)[number]['key']

const activeTab = ref<TabKey>('applications')
const loading = ref(false)
const error = ref('')
const applications = ref<ResidentMerchantApplicationItem[]>([])
const deposits = ref<ResidentMerchantDepositItem[]>([])
const settlements = ref<ResidentMerchantSettlementItem[]>([])

const deductOpen = ref(false)
const deducting = ref(false)
const deductError = ref('')
const deductId = ref('')
const deductForm = ref({ amount: 0, reason: '' })

const settingsOpen = ref(false)
const settingsSaving = ref(false)
const settingsError = ref('')
const settings = ref<ResidentMerchantSettings>({
  defaultDepositAmount: 500,
  platformCommissionRate: 0,
  refundWindowDays: 7
})

const distributorOpen = ref(false)
const distributorSaving = ref(false)
const distributorError = ref('')
const distributorForm = ref({
  name: '',
  coverUrl: '',
  wholesalePrice: 0,
  suggestedRetailPrice: 0,
  stock: 0,
  description: ''
})

function resolveError(e: unknown) {
  if (e instanceof ApiError) return getPhase2ErrorMessage(e.code, e.message)
  if (e instanceof Error) return e.message
  return '操作失败'
}

async function loadApplications() {
  const res = await residentMerchantAdminApi.applications({ page: 1, pageSize: 50 })
  applications.value = res.list || []
}

async function loadDeposits() {
  const res = await residentMerchantAdminApi.deposits({ page: 1, pageSize: 50 })
  deposits.value = res.list || []
}

async function loadSettlements() {
  const res = await residentMerchantAdminApi.settlements({ page: 1, pageSize: 50 })
  settlements.value = res.list || []
}

async function loadCurrent() {
  loading.value = true
  error.value = ''
  try {
    if (activeTab.value === 'applications') await loadApplications()
    else if (activeTab.value === 'deposits') await loadDeposits()
    else await loadSettlements()
  } catch (e) {
    error.value = resolveError(e)
  } finally {
    loading.value = false
  }
}

function switchTab(key: TabKey) {
  activeTab.value = key
  loadCurrent()
}

async function auditApp(id: string, result: string) {
  try {
    await residentMerchantAdminApi.auditApplication(id, result)
    await loadApplications()
  } catch (e) {
    error.value = resolveError(e)
  }
}

function openDeduct(item: ResidentMerchantDepositItem) {
  deductId.value = item.id
  deductForm.value = { amount: 0, reason: '' }
  deductError.value = ''
  deductOpen.value = true
}

async function submitDeduct() {
  if (!deductForm.value.amount || !deductForm.value.reason.trim()) {
    deductError.value = '请填写扣除金额和原因'
    return
  }
  deducting.value = true
  deductError.value = ''
  try {
    await residentMerchantAdminApi.deductDeposit(
      deductId.value,
      deductForm.value.amount,
      deductForm.value.reason.trim()
    )
    deductOpen.value = false
    await loadDeposits()
  } catch (e) {
    deductError.value = resolveError(e)
  } finally {
    deducting.value = false
  }
}

async function openSettings() {
  settingsOpen.value = true
  settingsError.value = ''
  try {
    settings.value = {
      defaultDepositAmount: 500,
      platformCommissionRate: 0,
      refundWindowDays: 7,
      ...(await residentMerchantAdminApi.getSettings())
    }
  } catch (e) {
    settingsError.value = resolveError(e)
  }
}

async function saveSettings() {
  settingsSaving.value = true
  settingsError.value = ''
  try {
    await residentMerchantAdminApi.updateSettings(settings.value)
    settingsOpen.value = false
  } catch (e) {
    settingsError.value = resolveError(e)
  } finally {
    settingsSaving.value = false
  }
}

function openDistributor() {
  distributorForm.value = {
    name: '',
    coverUrl: '',
    wholesalePrice: 0,
    suggestedRetailPrice: 0,
    stock: 0,
    description: ''
  }
  distributorError.value = ''
  distributorOpen.value = true
}

async function submitDistributor() {
  if (!distributorForm.value.name.trim()) {
    distributorError.value = '请填写商品名称'
    return
  }
  distributorSaving.value = true
  distributorError.value = ''
  try {
    await residentMerchantAdminApi.createDistributorProduct({
      name: distributorForm.value.name.trim(),
      coverUrl: distributorForm.value.coverUrl.trim() || undefined,
      wholesalePrice: distributorForm.value.wholesalePrice,
      suggestedRetailPrice: distributorForm.value.suggestedRetailPrice,
      stock: distributorForm.value.stock,
      description: distributorForm.value.description.trim() || undefined
    })
    distributorOpen.value = false
  } catch (e) {
    distributorError.value = resolveError(e)
  } finally {
    distributorSaving.value = false
  }
}

onMounted(loadCurrent)
</script>

<style scoped>
.page { max-width: 1200px; }
.header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.headerActions { display: flex; gap: 8px; flex-wrap: wrap; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin: 0 0 8px; }
.desc { font-size: 14px; color: #8c8c9a; margin: 0; }
.tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.tab { border: 1px solid #e8e8ec; background: #ffffff; border-radius: 8px; padding: 10px 18px; color: #5c5c66; font-size: 14px; cursor: pointer; }
.tab:hover { border-color: #5c5c9e; color: #5c5c9e; }
.tab.active { background: #5c5c9e; border-color: #5c5c9e; color: #ffffff; }
.panel { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden; overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 800px; }
.table th, .table td { padding: 14px 24px; text-align: left; vertical-align: middle; border-bottom: 1px solid #f0f0f3; }
.table th { color: #8c8c9a; font-weight: 500; background: #fafafc; }
.table tbody td { color: #1f1f2e; }
.table tbody tr:last-child td { border-bottom: none; }
.actions { display: flex; gap: 12px; flex-wrap: wrap; }
.linkBtn { border: none; background: none; color: #5c5c9e; cursor: pointer; padding: 0; font-size: 14px; }
.linkBtn.danger { color: #e05c5c; }
.btnPrimary { padding: 10px 18px; border-radius: 8px; border: none; background: #5c5c9e; color: #ffffff; font-size: 14px; cursor: pointer; transition: background 0.2s; }
.btnPrimary:hover { background: #52529a; }
.btnPrimary:disabled { opacity: 0.6; cursor: not-allowed; }
.btnSecondary { padding: 10px 18px; border-radius: 8px; border: 1px solid #e8e8ec; background: #ffffff; color: #5c5c66; font-size: 14px; cursor: pointer; }
.btnSecondary:hover { border-color: #5c5c9e; color: #5c5c9e; }
.hint { color: #8c8c9a; font-size: 14px; padding: 24px; margin: 0; }
.error { color: #e05c5c; font-size: 14px; padding: 24px; margin: 0; }
.modalOverlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; padding: 24px; }
.modal { width: min(520px, 100%); max-height: 90vh; background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); overflow: auto; display: flex; flex-direction: column; }
.modalHeader { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f0f0f3; flex-shrink: 0; }
.modalTitle { font-size: 16px; font-weight: 600; color: #1f1f2e; margin: 0; }
.modalClose { width: 32px; height: 32px; border: none; background: transparent; font-size: 24px; line-height: 1; color: #8c8c9a; cursor: pointer; }
.modalClose:hover { color: #1f1f2e; }
.modalBody { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.modalFooter { display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; }
.field, .fieldRow { display: flex; flex-direction: column; gap: 8px; }
.fieldRow { flex-direction: row; gap: 12px; }
.fieldRow .field { flex: 1; }
.label { font-size: 13px; font-weight: 500; color: #5c5c66; }
.input, .textarea { width: 100%; border: 1px solid #e8e8ec; border-radius: 8px; padding: 10px 12px; font-size: 14px; color: #1f1f2e; background: #ffffff; outline: none; box-sizing: border-box; font-family: inherit; }
.input:focus, .textarea:focus { border-color: #5c5c9e; }
.textarea { resize: vertical; min-height: 80px; }
</style>
