<template>
  <AppLayout>
    <div class="page">
      <div class="header">
        <div>
          <h1 class="title">总览</h1>
          <p class="desc">{{ periodDesc }}</p>
        </div>
        <div class="actions">
          <button class="btnSecondary" @click="openCoinModal('freeze')">冻结物业币</button>
          <button class="btnSecondary" @click="openCoinModal('unfreeze')">解冻物业币</button>
          <button class="btnSecondary" @click="openAuditModal">审核注册</button>
          <button class="btnPrimary" @click="openAnnouncementModal">发布通告</button>
        </div>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <template v-else>
        <div class="stats">
          <div v-for="stat in stats" :key="stat.code" class="statCard" :class="stat.variant === 'purple' ? 'purple' : stat.variant === 'green' ? 'green' : ''">
            <div class="top">
              <div class="icon"><IconSvg :name="stat.icon" /></div>
              <div v-if="stat.badge" class="badge"><IconSvg name="arrowUp" /><span>{{ stat.badge }}</span></div>
            </div>
            <div class="label">{{ stat.title }}</div>
            <div class="value">{{ stat.value }}</div>
          </div>
        </div>
        <div class="charts">
          <div class="collectionRate">
            <h3 class="title">物业费收缴率</h3>
            <div class="chart">
              <svg viewBox="0 0 120 120" class="svg">
                <circle class="track" cx="60" cy="60" r="50" />
                <circle class="progress" cx="60" cy="60" r="50" :stroke-dasharray="collectionDashArray" :stroke-dashoffset="collectionDashOffset" />
              </svg>
              <div class="text">
                <div class="percent">{{ collectionRate }}%</div>
                <div class="hint">已缴纳</div>
              </div>
            </div>
          </div>
          <div class="pendingAudit">
            <h3 class="title">待审核</h3>
            <div class="body">
              <div class="count">{{ pendingAuditCount }}</div>
              <div class="hint">条待处理申请</div>
            </div>
          </div>
        </div>
        <div v-if="recentActivity.length" class="recentActivity">
          <div class="header">
            <h3 class="title">最近动态</h3>
          </div>
          <ul class="activityList">
            <li v-for="item in recentActivity" :key="item.id" class="activityItem">
              <span class="activityTime">{{ item.timestamp }}</span>
              <span class="activityDesc">{{ item.description }}</span>
            </li>
          </ul>
        </div>
        <div class="recentLog">
          <div class="header">
            <h3 class="title">最近操作日志</h3>
            <button
              v-if="!logsLoading && (operationLogs.length || logsExpanded)"
              class="more"
              @click="toggleLogsExpand"
            >
              {{ logsExpanded ? '收起' : '查看全部' }}
            </button>
          </div>
          <table class="table">
            <thead><tr><th>时间</th><th>操作人</th><th>操作内容</th><th>结果</th></tr></thead>
            <tbody>
              <tr v-if="logsLoading || (logsExpanded && allLogsLoading)">
                <td colspan="4" class="emptyCell">加载中...</td>
              </tr>
              <tr v-else-if="!displayedLogs.length">
                <td colspan="4" class="emptyCell">暂无操作日志</td>
              </tr>
              <tr v-for="log in displayedLogs" :key="log.id || log.time + log.content">
                <td>{{ log.time }}</td>
                <td>{{ log.operator }}</td>
                <td>{{ log.content }}</td>
                <td><span class="tag" :class="log.result === '成功' ? 'tagSuccess' : 'tagFail'">{{ log.result }}</span></td>
              </tr>
            </tbody>
          </table>
          <div v-if="logsExpanded && allLogsTotalPages > 1" class="logsPagination">
            <button class="pageBtn" :disabled="allLogsPage <= 1 || allLogsLoading" @click="changeAllLogsPage(allLogsPage - 1)">&lt;</button>
            <span class="pageInfo">{{ allLogsPage }} / {{ allLogsTotalPages }}</span>
            <button class="pageBtn" :disabled="allLogsPage >= allLogsTotalPages || allLogsLoading" @click="changeAllLogsPage(allLogsPage + 1)">&gt;</button>
          </div>
        </div>
      </template>
    </div>

    <Teleport to="body">
      <div v-if="coinModal" class="modalOverlay" @click.self="closeCoinModal">
        <div class="modal">
          <div class="modalHeader">
            <h3 class="modalTitle">{{ coinModal === 'freeze' ? '冻结物业币' : '解冻物业币' }}</h3>
            <button class="modalClose" @click="closeCoinModal">&times;</button>
          </div>
          <form class="modalBody" @submit.prevent="submitCoinModal">
            <div v-if="coinModal === 'freeze'" class="field">
              <label class="label">选择业主</label>
              <ResidentSearchSelect
                :key="coinModalKey"
                v-model="coinForm.residentId"
              />
            </div>
            <div v-if="coinModal === 'freeze'" class="field">
              <label class="label">冻结金额</label>
              <input
                v-model.number="coinForm.amount"
                type="number"
                min="0"
                step="0.01"
                class="input"
                placeholder="0 表示全部冻结"
                required
              />
              <p class="hint">输入 0 将全部冻结</p>
            </div>
            <div v-if="coinModal === 'unfreeze'" class="field">
              <label class="label">选择冻结记录</label>
              <FreezeRecordSelect
                :key="coinModalKey"
                v-model:frozen-record-id="coinForm.frozenRecordId"
                v-model:resident-id="coinForm.residentId"
              />
              <p class="hint">从冻结记录列表中选择要解冻的账号</p>
            </div>
            <div class="field">
              <label class="label">{{ coinModal === 'freeze' ? '冻结原因' : '解冻原因' }}</label>
              <textarea
                v-model="coinForm.reason"
                class="textarea"
                rows="3"
                maxlength="200"
                :placeholder="coinModal === 'freeze' ? '请输入冻结原因' : '请输入解冻原因'"
                required
              />
            </div>
            <p v-if="coinError" class="error">{{ coinError }}</p>
            <p v-if="coinSuccess" class="success">{{ coinSuccess }}</p>
            <div class="modalFooter">
              <button type="button" class="btnSecondary" @click="closeCoinModal">取消</button>
              <button type="submit" class="btnPrimary" :disabled="coinSubmitting">
                {{ coinSubmitting ? '提交中...' : '确认' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="auditModalOpen" class="modalOverlay" @click.self="closeAuditModal">
        <div class="modal modalScroll">
          <div class="modalHeader">
            <h3 class="modalTitle">审核商家入驻</h3>
            <button class="modalClose" @click="closeAuditModal">&times;</button>
          </div>
          <form class="modalBody" @submit.prevent="submitAuditModal">
            <div class="field">
              <label class="label">选择商家</label>
              <PendingMerchantSelect
                :key="auditModalKey"
                v-model="auditForm.merchantId"
                @select="onMerchantSelect"
              />
            </div>
            <div class="field">
              <label class="label">审核结果</label>
              <div class="radioGroup">
                <label class="radioItem">
                  <input v-model="auditForm.auditResult" type="radio" :value="AUDIT_RESULT.APPROVED" />
                  <span>通过</span>
                </label>
                <label class="radioItem">
                  <input v-model="auditForm.auditResult" type="radio" :value="AUDIT_RESULT.REJECTED" />
                  <span>拒绝</span>
                </label>
              </div>
            </div>
            <div v-if="auditForm.auditResult === AUDIT_RESULT.REJECTED" class="field">
              <label class="label">拒绝原因</label>
              <textarea
                v-model="auditForm.rejectReason"
                class="textarea"
                rows="3"
                maxlength="200"
                placeholder="请填写拒绝原因"
                required
              />
            </div>
            <template v-if="auditForm.auditResult === AUDIT_RESULT.APPROVED">
              <div class="field">
                <label class="label">商家等级</label>
                <select v-model="auditForm.merchantLevel" class="input">
                  <option v-for="opt in MERCHANT_LEVEL_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label class="label">分类</label>
                <input v-model="auditForm.category" type="text" class="input" maxlength="50" placeholder="如：外卖" />
              </div>
              <div class="field">
                <label class="label">营业时间</label>
                <input v-model="auditForm.businessHours" type="text" class="input" maxlength="50" placeholder="如：08:00-22:00" />
              </div>
              <div class="field">
                <label class="label">配送费</label>
                <input v-model="auditForm.deliveryFee" type="text" class="input" placeholder="如：0.30" />
              </div>
              <div class="field">
                <label class="label">满额免配送费</label>
                <input v-model="auditForm.freeDeliveryThreshold" type="text" class="input" placeholder="如：50.00" />
              </div>
            </template>
            <div class="field">
              <label class="label">备注（选填）</label>
              <textarea
                v-model="auditForm.remark"
                class="textarea"
                rows="2"
                maxlength="200"
                placeholder="审核备注"
              />
            </div>
            <p v-if="auditError" class="error">{{ auditError }}</p>
            <p v-if="auditSuccess" class="success">{{ auditSuccess }}</p>
            <div class="modalFooter">
              <button type="button" class="btnSecondary" @click="closeAuditModal">取消</button>
              <button type="submit" class="btnPrimary" :disabled="auditSubmitting">
                {{ auditSubmitting ? '提交中...' : '确认审核' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="announcementModalOpen" class="modalOverlay" @click.self="closeAnnouncementModal">
        <div class="modal modalScroll">
          <div class="modalHeader">
            <h3 class="modalTitle">发布通告</h3>
            <button class="modalClose" @click="closeAnnouncementModal">&times;</button>
          </div>
          <form class="modalBody" @submit.prevent="submitAnnouncementModal">
            <div class="field">
              <label class="label">通告标题</label>
              <input
                v-model="announcementForm.title"
                type="text"
                class="input"
                maxlength="200"
                placeholder="输入通告标题"
                required
              />
            </div>
            <div class="field">
              <label class="label">通告内容</label>
              <textarea
                v-model="announcementForm.content"
                class="textarea"
                rows="5"
                placeholder="输入通告正文"
                required
              />
            </div>
            <div class="field">
              <label class="label">公告类型</label>
              <select v-model="announcementForm.announcementType" class="input" required>
                <option v-for="opt in ANNOUNCEMENT_TYPE_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div class="field">
              <label class="label">覆盖楼栋</label>
              <input
                v-model="announcementForm.targetBuildingsText"
                type="text"
                class="input"
                placeholder="多个楼栋用逗号分隔，如：1栋, 2栋, 3栋"
              />
              <p class="hint">留空则不限楼栋</p>
            </div>
            <div class="field">
              <label class="label">发布状态</label>
              <select v-model="announcementForm.status" class="input">
                <option v-for="opt in ANNOUNCEMENT_STATUS_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <p v-if="announcementError" class="error">{{ announcementError }}</p>
            <p v-if="announcementSuccess" class="success">{{ announcementSuccess }}</p>
            <div class="modalFooter">
              <button type="button" class="btnSecondary" @click="closeAnnouncementModal">取消</button>
              <button type="submit" class="btnPrimary" :disabled="announcementSubmitting">
                {{ announcementSubmitting ? '提交中...' : '确认发布' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import IconSvg from '../components/IconSvg.vue'
import ResidentSearchSelect from '../components/ResidentSearchSelect.vue'
import FreezeRecordSelect from '../components/FreezeRecordSelect.vue'
import PendingMerchantSelect from '../components/PendingMerchantSelect.vue'
import { dashboardApi, announcementApi, merchantApi, operationLogApi, residentApi } from '../api/services'
import type { AnnouncementCreatePayload, MerchantAuditPayload, MerchantItem } from '../api/types'
import { mapCollectionRate, mapDashboardStats, mapOperationLogs, mapPendingAuditCount, mapPeriodDescription, mapRecentActivity } from '../api/mappers'
import { ApiError } from '../api/request'
import { getAccessToken } from '../stores/tokenStore'
import { useAuthStore } from '../stores/auth'
import {
  ANNOUNCEMENT_STATUS,
  ANNOUNCEMENT_STATUS_OPTIONS,
  ANNOUNCEMENT_TYPE,
  ANNOUNCEMENT_TYPE_OPTIONS,
  AUDIT_RESULT,
  MERCHANT_LEVEL,
  MERCHANT_LEVEL_OPTIONS,
  type AuditResult
} from '../constants/enums'

const loading = ref(true)
const periodDesc = ref('今日运营数据及最近动态')
const stats = ref<ReturnType<typeof mapDashboardStats>>([])
const collectionRate = ref(0)
const pendingAuditCount = ref(0)
const recentActivity = ref<ReturnType<typeof mapRecentActivity>>([])
const operationLogs = ref<ReturnType<typeof mapOperationLogs>>([])
const logsLoading = ref(false)
const logsExpanded = ref(false)
const logsTotal = ref(0)
const RECENT_LOGS_LIMIT = 20

const allLogsLoading = ref(false)
const allLogs = ref<ReturnType<typeof mapOperationLogs>>([])
const allLogsPage = ref(1)
const allLogsTotalPages = ref(1)
const ALL_LOGS_PAGE_SIZE = 20

const displayedLogs = computed(() => (logsExpanded.value ? allLogs.value : operationLogs.value))

type CoinModalType = 'freeze' | 'unfreeze'
const coinModal = ref<CoinModalType | null>(null)
const coinModalKey = ref(0)
const coinSubmitting = ref(false)
const coinError = ref('')
const coinSuccess = ref('')
const coinForm = ref({
  residentId: '',
  amount: 0,
  frozenRecordId: '',
  reason: ''
})

const auditModalOpen = ref(false)
const auditModalKey = ref(0)
const auditSubmitting = ref(false)
const auditError = ref('')
const auditSuccess = ref('')
const auditForm = ref<{
  merchantId: string
  auditResult: AuditResult
  rejectReason: string
  remark: string
  merchantLevel: string
  category: string
  businessHours: string
  deliveryFee: string
  freeDeliveryThreshold: string
}>({
  merchantId: '',
  auditResult: AUDIT_RESULT.APPROVED,
  rejectReason: '',
  remark: '',
  merchantLevel: MERCHANT_LEVEL.PROPERTY_CERTIFIED,
  category: '',
  businessHours: '',
  deliveryFee: '',
  freeDeliveryThreshold: ''
})

const announcementModalOpen = ref(false)
const announcementSubmitting = ref(false)
const announcementError = ref('')
const announcementSuccess = ref('')
const announcementForm = ref({
  title: '',
  content: '',
  announcementType: ANNOUNCEMENT_TYPE.PROPERTY,
  targetBuildingsText: '',
  status: ANNOUNCEMENT_STATUS.PUBLISHED
})

const collectionRadius = 50
const collectionCircumference = 2 * Math.PI * collectionRadius
const collectionDashArray = `${collectionCircumference} ${collectionCircumference}`
const collectionDashOffset = computed(() => collectionCircumference - (collectionRate.value / 100) * collectionCircumference)

async function loadOperationLogs() {
  logsLoading.value = true
  try {
    const result = await operationLogApi.list({ page: 1, pageSize: RECENT_LOGS_LIMIT })
    operationLogs.value = mapOperationLogs(result.list || [])
    logsTotal.value = result.pagination?.total ?? operationLogs.value.length
  } catch (e) {
    console.error(e)
    operationLogs.value = []
    logsTotal.value = 0
  } finally {
    logsLoading.value = false
  }
}

async function loadAllLogs(page = 1) {
  allLogsLoading.value = true
  try {
    const result = await operationLogApi.list({ page, pageSize: ALL_LOGS_PAGE_SIZE })
    allLogs.value = mapOperationLogs(result.list || [])
    allLogsPage.value = result.pagination?.page ?? page
    allLogsTotalPages.value = result.pagination?.totalPages ?? 1
    logsTotal.value = result.pagination?.total ?? allLogs.value.length
  } catch (e) {
    console.error(e)
    allLogs.value = []
  } finally {
    allLogsLoading.value = false
  }
}

async function toggleLogsExpand() {
  if (logsExpanded.value) {
    logsExpanded.value = false
    allLogsPage.value = 1
    return
  }
  logsExpanded.value = true
  allLogsPage.value = 1
  await loadAllLogs(1)
}

async function refreshOperationLogs() {
  await loadOperationLogs()
  if (logsExpanded.value) {
    await loadAllLogs(allLogsPage.value)
  }
}

function changeAllLogsPage(page: number) {
  allLogsPage.value = page
  loadAllLogs(page)
}

function resetCoinForm() {
  coinForm.value = { residentId: '', amount: 0, frozenRecordId: '', reason: '' }
  coinError.value = ''
  coinSuccess.value = ''
}

function openCoinModal(type: CoinModalType) {
  coinModal.value = type
  resetCoinForm()
  coinModalKey.value++
}

function closeCoinModal() {
  coinModal.value = null
  resetCoinForm()
}

function resetAuditForm() {
  auditForm.value = {
    merchantId: '',
    auditResult: AUDIT_RESULT.APPROVED,
    rejectReason: '',
    remark: '',
    merchantLevel: MERCHANT_LEVEL.PROPERTY_CERTIFIED,
    category: '',
    businessHours: '',
    deliveryFee: '',
    freeDeliveryThreshold: ''
  }
  auditError.value = ''
  auditSuccess.value = ''
}

function openAuditModal() {
  auditModalOpen.value = true
  resetAuditForm()
  auditModalKey.value++
}

function closeAuditModal() {
  auditModalOpen.value = false
  resetAuditForm()
}

function resetAnnouncementForm() {
  announcementForm.value = {
    title: '',
    content: '',
    announcementType: ANNOUNCEMENT_TYPE.PROPERTY,
    targetBuildingsText: '',
    status: ANNOUNCEMENT_STATUS.PUBLISHED
  }
  announcementError.value = ''
  announcementSuccess.value = ''
}

function openAnnouncementModal() {
  announcementModalOpen.value = true
  resetAnnouncementForm()
}

function closeAnnouncementModal() {
  announcementModalOpen.value = false
  resetAnnouncementForm()
}

function parseTargetBuildings(text: string) {
  return text
    .split(/[,，]/)
    .map(item => item.trim())
    .filter(Boolean)
}

async function submitAnnouncementModal() {
  const auth = useAuthStore()
  const title = announcementForm.value.title.trim()
  const content = announcementForm.value.content.trim()
  if (!title) {
    announcementError.value = '请填写通告标题'
    return
  }
  if (!content) {
    announcementError.value = '请填写通告内容'
    return
  }

  announcementSubmitting.value = true
  announcementError.value = ''
  announcementSuccess.value = ''

  try {
    const payload: AnnouncementCreatePayload = {
      title,
      content,
      announcementType: announcementForm.value.announcementType,
      status: announcementForm.value.status
    }
    if (auth.propertyCompanyId) {
      payload.propertyCompanyId = auth.propertyCompanyId
    }
    const buildings = parseTargetBuildings(announcementForm.value.targetBuildingsText)
    if (buildings.length) {
      payload.targetBuildings = buildings
    }

    const result = await announcementApi.create(payload)
    announcementSuccess.value = announcementForm.value.status === 'published'
      ? `通告「${result.title}」已发布`
      : `通告「${result.title}」已存为草稿`
    await refreshOperationLogs()
    setTimeout(closeAnnouncementModal, 1500)
  } catch (e) {
    announcementError.value = e instanceof ApiError ? e.message : '发布失败，请稍后重试'
  } finally {
    announcementSubmitting.value = false
  }
}

function onMerchantSelect(merchant: MerchantItem) {
  auditForm.value.category = merchant.category || ''
  auditForm.value.businessHours = merchant.businessHours || ''
  auditForm.value.deliveryFee = merchant.deliveryFee != null ? String(merchant.deliveryFee) : ''
  auditForm.value.freeDeliveryThreshold = merchant.freeDeliveryThreshold != null
    ? String(merchant.freeDeliveryThreshold)
    : ''
  if (merchant.merchantLevel) {
    auditForm.value.merchantLevel = merchant.merchantLevel
  }
}

async function submitAuditModal() {
  if (!getAccessToken()) {
    auditError.value = '登录已过期，请重新登录'
    return
  }

  const merchantId = auditForm.value.merchantId.trim()
  if (!merchantId) {
    auditError.value = '请选择商家'
    return
  }

  if (auditForm.value.auditResult === AUDIT_RESULT.REJECTED && !auditForm.value.rejectReason.trim()) {
    auditError.value = '请填写拒绝原因'
    return
  }

  auditSubmitting.value = true
  auditError.value = ''
  auditSuccess.value = ''

  try {
    const payload: MerchantAuditPayload = {
      auditResult: auditForm.value.auditResult
    }

    if (auditForm.value.remark.trim()) {
      payload.remark = auditForm.value.remark.trim()
    }

    if (auditForm.value.auditResult === AUDIT_RESULT.REJECTED) {
      payload.rejectReason = auditForm.value.rejectReason.trim()
    } else {
      payload.merchantLevel = auditForm.value.merchantLevel
      if (auditForm.value.category.trim()) payload.category = auditForm.value.category.trim()
      if (auditForm.value.businessHours.trim()) payload.businessHours = auditForm.value.businessHours.trim()
      if (auditForm.value.deliveryFee.trim()) payload.deliveryFee = auditForm.value.deliveryFee.trim()
      if (auditForm.value.freeDeliveryThreshold.trim()) {
        payload.freeDeliveryThreshold = auditForm.value.freeDeliveryThreshold.trim()
      }
    }

    const result = await merchantApi.audit(merchantId, payload)
    auditSuccess.value = auditForm.value.auditResult === AUDIT_RESULT.APPROVED
      ? `已通过「${result.name}」的入驻申请`
      : `已拒绝「${result.name}」的入驻申请`
    await refreshOperationLogs()
    setTimeout(closeAuditModal, 1500)
  } catch (e) {
    auditError.value = e instanceof ApiError ? e.message : '审核失败，请稍后重试'
  } finally {
    auditSubmitting.value = false
  }
}

async function submitCoinModal() {
  const residentId = coinForm.value.residentId.trim()
  const reason = coinForm.value.reason.trim()
  if (coinModal.value === 'freeze' && !residentId) {
    coinError.value = '请选择业主'
    return
  }
  if (coinModal.value === 'unfreeze' && !coinForm.value.frozenRecordId.trim()) {
    coinError.value = '请选择冻结记录'
    return
  }
  if (!reason) return

  coinSubmitting.value = true
  coinError.value = ''
  coinSuccess.value = ''

  try {
    if (coinModal.value === 'freeze') {
      const result = await residentApi.freezeCoin(residentId, {
        amount: coinForm.value.amount,
        reason
      })
      coinSuccess.value = `已成功冻结 ${result.residentName} 的物业币 ${result.amount} 元`
    } else {
      const payload: { reason: string; frozenRecordId: string } = {
        reason,
        frozenRecordId: coinForm.value.frozenRecordId.trim()
      }
      const result = await residentApi.unfreezeCoin(residentId, payload)
      coinSuccess.value = `已成功解冻 ${result.unfrozenAmount} 元，当前余额 ${result.newBalance} 元`
    }
    await refreshOperationLogs()
    setTimeout(closeCoinModal, 1500)
  } catch (e) {
    coinError.value = e instanceof ApiError ? e.message : '操作失败，请稍后重试'
  } finally {
    coinSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    const overview = await dashboardApi.overview()
    periodDesc.value = mapPeriodDescription(overview)
    stats.value = mapDashboardStats(overview)
    collectionRate.value = mapCollectionRate(overview)
    pendingAuditCount.value = mapPendingAuditCount(overview)
    recentActivity.value = mapRecentActivity(overview)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
  loadOperationLogs()
})
</script>

<style scoped>
.page { max-width: 1200px; }
.loading { padding: 40px 0; text-align: center; color: #8c8c9a; }
.header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.actions { display: flex; gap: 12px; }
.btnSecondary { padding: 10px 18px; border-radius: 8px; border: 1px solid #e8e8ec; background: #ffffff; color: #5c5c66; font-size: 14px; transition: all 0.2s; text-decoration: none; display: inline-block; }
.btnSecondary:hover { border-color: #5c5c9e; color: #5c5c9e; }
.btnPrimary { padding: 10px 18px; border-radius: 8px; background: #5c5c9e; color: #ffffff; font-size: 14px; transition: background 0.2s; }
.btnPrimary:hover { background: #52529a; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
.charts { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-bottom: 20px; }
.statCard { background: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); min-width: 0; }
.statCard .top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.statCard .icon { width: 40px; height: 40px; border-radius: 10px; background: #f4f5f7; color: #5c5c66; display: flex; align-items: center; justify-content: center; }
.statCard .icon svg { width: 22px; height: 22px; }
.statCard .badge { display: flex; align-items: center; gap: 2px; padding: 4px 8px; border-radius: 12px; background: #e8f8f0; color: #3aaf7d; font-size: 12px; font-weight: 500; }
.statCard .badge svg { width: 12px; height: 12px; }
.statCard .label { font-size: 13px; color: #8c8c9a; margin-bottom: 6px; }
.statCard .value { font-size: 22px; font-weight: 600; color: #1f1f2e; }
.statCard.purple { background: linear-gradient(135deg, #5c5c9e 0%, #8a8ad4 100%); color: #ffffff; }
.statCard.purple .icon { background: rgba(255,255,255,0.2); color: #ffffff; }
.statCard.purple .label { color: rgba(255,255,255,0.8); }
.statCard.purple .value { color: #ffffff; }
.statCard.green { background: linear-gradient(135deg, #3aaf7d 0%, #6dd5a0 100%); color: #ffffff; }
.statCard.green .icon { background: rgba(255,255,255,0.2); color: #ffffff; }
.statCard.green .label { color: rgba(255,255,255,0.8); }
.statCard.green .value { color: #ffffff; }
.collectionRate { background: #ffffff; border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; }
.collectionRate .title { font-size: 15px; font-weight: 500; color: #1f1f2e; margin-bottom: 24px; align-self: flex-start; }
.collectionRate .chart { position: relative; width: 160px; height: 160px; }
.collectionRate .svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.collectionRate .track { fill: none; stroke: #f0f0f3; stroke-width: 10; stroke-linecap: round; }
.collectionRate .progress { fill: none; stroke: #5c5c9e; stroke-width: 10; stroke-linecap: round; transition: stroke-dashoffset 0.6s ease; }
.collectionRate .text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.collectionRate .percent { font-size: 32px; font-weight: 700; color: #1f1f2e; }
.collectionRate .hint { font-size: 13px; color: #8c8c9a; margin-top: 4px; }
.pendingAudit { background: #ffffff; border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; }
.pendingAudit .title { font-size: 15px; font-weight: 500; color: #1f1f2e; margin-bottom: 24px; align-self: flex-start; }
.pendingAudit .body { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; }
.pendingAudit .count { font-size: 56px; font-weight: 700; color: #5c5c9e; line-height: 1; }
.pendingAudit .hint { font-size: 13px; color: #8c8c9a; margin-top: 12px; }
.recentActivity { background: #ffffff; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.recentActivity .header { margin-bottom: 12px; }
.recentActivity .title { font-size: 15px; font-weight: 500; color: #1f1f2e; margin-bottom: 0; }
.activityList { list-style: none; margin: 0; padding: 0; }
.activityItem { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f0f0f3; font-size: 14px; }
.activityItem:last-child { border-bottom: none; }
.activityTime { flex-shrink: 0; color: #8c8c9a; min-width: 140px; }
.activityDesc { color: #1f1f2e; }

.recentLog { background: #ffffff; border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.recentLog .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.recentLog .title { font-size: 15px; font-weight: 500; color: #1f1f2e; margin-bottom: 0; }
.recentLog .more { font-size: 13px; color: #5c5c9e; }
.recentLog .more:hover { color: #52529a; }
.recentLog .table { font-size: 14px; width: 100%; }
.recentLog .table thead th { text-align: left; padding: 12px 16px; color: #8c8c9a; font-weight: 500; background: #fafafc; border-bottom: 1px solid #f0f0f3; }
.recentLog .table thead th:first-child { border-radius: 8px 0 0 8px; }
.recentLog .table thead th:last-child { border-radius: 0 8px 8px 0; }
.recentLog .table tbody td { padding: 16px; color: #1f1f2e; border-bottom: 1px solid #f0f0f3; }
.recentLog .table tbody tr:last-child td { border-bottom: none; }
.recentLog .tag { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.recentLog .tagSuccess { background: #e8f8f0; color: #3aaf7d; }
.recentLog .tagFail { background: #fdf0f0; color: #e05c5c; }
.recentLog .emptyCell { text-align: center; padding: 24px; color: #8c8c9a; }
@media (max-width: 1024px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
  .charts { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .header { flex-direction: column; gap: 16px; }
  .actions { width: 100%; flex-wrap: wrap; }
  .stats { grid-template-columns: 1fr; }
}

.modalOverlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.modal {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
.modalWide { max-width: 720px; }
.modalScroll { max-height: calc(100vh - 48px); display: flex; flex-direction: column; }
.modalScroll .modalBody { overflow-y: auto; }
.radioGroup { display: flex; gap: 20px; }
.radioItem { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #1f1f2e; cursor: pointer; }
.radioItem input { accent-color: #5c5c9e; }
.recentLog .logsPagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 0 4px;
  margin-top: 8px;
  border-top: 1px solid #f0f0f3;
}
.recentLog .logsPagination .pageBtn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e8e8ec;
  background: #ffffff;
  color: #5c5c66;
  cursor: pointer;
}
.recentLog .logsPagination .pageBtn:disabled { color: #c8c8d0; cursor: not-allowed; }
.recentLog .logsPagination .pageInfo { font-size: 13px; color: #8c8c9a; }
.modalHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f3;
}
.modalTitle { font-size: 16px; font-weight: 600; color: #1f1f2e; margin: 0; }
.modalClose {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  color: #8c8c9a;
  cursor: pointer;
}
.modalClose:hover { color: #1f1f2e; }
.modalBody { padding: 24px; }
.field { margin-bottom: 16px; }
.field .label { display: block; font-size: 13px; font-weight: 500; color: #5c5c66; margin-bottom: 8px; }
.field .input,
.field .textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e8e8ec;
  border-radius: 8px;
  font-size: 14px;
  color: #1f1f2e;
  background: #ffffff;
  outline: none;
  box-sizing: border-box;
}
.field .input:focus,
.field .textarea:focus { border-color: #5c5c9e; }
.field .textarea { resize: vertical; min-height: 80px; font-family: inherit; }
.field .hint { font-size: 12px; color: #8c8c9a; margin-top: 6px; }
.error { font-size: 13px; color: #e05c5c; margin-bottom: 12px; }
.success { font-size: 13px; color: #3aaf7d; margin-bottom: 12px; }
.modalFooter {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
.modalFooter .btnSecondary,
.modalFooter .btnPrimary { cursor: pointer; }
.modalFooter .btnPrimary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
