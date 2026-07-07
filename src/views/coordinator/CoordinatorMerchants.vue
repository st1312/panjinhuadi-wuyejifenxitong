<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">商家管理</h1>
        <p class="desc">官方推荐商家展示、入驻审核与等级管理</p>
      </div>
    </div>

    <div class="tabs">
      <button
        class="tab"
        :class="{ active: tab === 'official' }"
        @click="switchTab('official')"
      >
        官方认证商家
      </button>
      <button
        class="tab"
        :class="{ active: tab === 'pending' }"
        @click="switchTab('pending')"
      >
        待审核入驻
      </button>
      <button
        class="tab"
        :class="{ active: tab === 'all' }"
        @click="switchTab('all')"
      >
        全部商家
      </button>
    </div>

    <div class="toolbar">
      <input v-model="keyword" class="input" placeholder="搜索商家名称" @keyup.enter="reload" />
      <button class="btnPrimary" :disabled="loading" @click="reload">搜索</button>
    </div>

    <div class="panel">
      <div v-if="loading" class="loading">加载中...</div>
      <p v-else-if="error" class="error">{{ error }}</p>
      <table v-else-if="merchants.length" class="table">
        <thead>
          <tr>
            <th>商家名称</th>
            <th>分类</th>
            <th>等级</th>
            <th v-if="tab === 'pending'">审核状态</th>
            <th v-else>状态</th>
            <th>排名</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in merchants" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.category || '—' }}</td>
            <td>{{ getEnumLabel(MERCHANT_LEVEL_LABEL, item.merchantLevel) }}</td>
            <td v-if="tab === 'pending'">
              {{ getEnumLabel(MERCHANT_AUDIT_STATUS_LABEL, item.auditStatus) }}
            </td>
            <td v-else>{{ getEnumLabel(MERCHANT_STATUS_LABEL, item.status) }}</td>
            <td>{{ item.rankOrder ?? '—' }}</td>
            <td class="actions">
              <button
                v-if="tab === 'pending'"
                class="btnPrimarySm"
                @click="openAudit(item)"
              >
                审核
              </button>
              <button
                v-else-if="item.merchantLevel !== MERCHANT_LEVEL.OFFICIAL_CERTIFIED"
                class="btnGhostSm"
                :disabled="upgradingId === item.id"
                @click="setOfficial(item)"
              >
                设为官方认证
              </button>
              <span v-else class="badge">官方推荐</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">暂无商家</p>
    </div>

    <div v-if="totalPages > 1" class="pager">
      <button class="btnGhost" :disabled="page <= 1 || loading" @click="changePage(page - 1)">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button class="btnGhost" :disabled="page >= totalPages || loading" @click="changePage(page + 1)">下一页</button>
    </div>

    <Teleport to="body">
      <div v-if="auditTarget" class="modalOverlay" @click.self="closeAudit">
        <div class="modal">
          <div class="modalHeader">
            <h3 class="modalTitle">审核商家「{{ auditTarget.name }}」</h3>
            <button class="modalClose" @click="closeAudit">&times;</button>
          </div>
          <div class="modalBody">
            <div class="field">
              <label class="label">审核结果</label>
              <select v-model="auditForm.auditResult" class="input">
                <option :value="AUDIT_RESULT.APPROVED">通过</option>
                <option :value="AUDIT_RESULT.REJECTED">拒绝</option>
              </select>
            </div>
            <div v-if="auditForm.auditResult === AUDIT_RESULT.APPROVED" class="field">
              <label class="label">商家等级</label>
              <select v-model="auditForm.merchantLevel" class="input">
                <option v-for="opt in MERCHANT_LEVEL_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div v-if="auditForm.auditResult === AUDIT_RESULT.REJECTED" class="field">
              <label class="label">拒绝原因</label>
              <textarea v-model="auditForm.rejectReason" class="textarea" rows="3" />
            </div>
            <div class="field">
              <label class="label">备注（可选）</label>
              <input v-model="auditForm.remark" class="input" />
            </div>
            <p v-if="auditError" class="error">{{ auditError }}</p>
          </div>
          <div class="modalFooter">
            <button class="btnGhost" @click="closeAudit">取消</button>
            <button class="btnPrimary" :disabled="auditing" @click="submitAudit">
              {{ auditing ? '提交中...' : '提交审核' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { merchantApi } from '../../api/services'
import type { MerchantItem } from '../../api/types'
import { ApiError } from '../../api/request'
import {
  AUDIT_RESULT,
  getEnumLabel,
  MERCHANT_AUDIT_STATUS_LABEL,
  MERCHANT_LEVEL,
  MERCHANT_LEVEL_LABEL,
  MERCHANT_LEVEL_OPTIONS,
  MERCHANT_STATUS_LABEL
} from '../../constants/enums'

type TabKey = 'official' | 'pending' | 'all'

const tab = ref<TabKey>('official')
const merchants = ref<MerchantItem[]>([])
const loading = ref(false)
const error = ref('')
const keyword = ref('')
const page = ref(1)
const totalPages = ref(1)
const upgradingId = ref('')
const auditTarget = ref<MerchantItem | null>(null)
const auditing = ref(false)
const auditError = ref('')
const auditForm = reactive({
  auditResult: AUDIT_RESULT.APPROVED,
  merchantLevel: MERCHANT_LEVEL.OFFICIAL_CERTIFIED,
  rejectReason: '',
  remark: ''
})

async function load(pageNo = 1) {
  loading.value = true
  error.value = ''
  try {
    const params = {
      page: pageNo,
      pageSize: 20,
      keyword: keyword.value.trim() || undefined,
      sort: '+rankOrder' as string
    }
    const res =
      tab.value === 'pending'
        ? await merchantApi.listPending(params)
        : await merchantApi.list({
            ...params,
            merchantLevel: tab.value === 'official' ? MERCHANT_LEVEL.OFFICIAL_CERTIFIED : undefined
          })
    merchants.value = res.list || []
    page.value = res.pagination?.page || pageNo
    totalPages.value = res.pagination?.totalPages || 1
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '商家列表加载失败'
  } finally {
    loading.value = false
  }
}

function switchTab(next: TabKey) {
  tab.value = next
  reload()
}

function reload() {
  load(1)
}

function changePage(next: number) {
  load(next)
}

function openAudit(item: MerchantItem) {
  auditTarget.value = item
  auditForm.auditResult = AUDIT_RESULT.APPROVED
  auditForm.merchantLevel = MERCHANT_LEVEL.OFFICIAL_CERTIFIED
  auditForm.rejectReason = ''
  auditForm.remark = ''
  auditError.value = ''
}

function closeAudit() {
  auditTarget.value = null
}

async function submitAudit() {
  if (!auditTarget.value) return
  if (auditForm.auditResult === AUDIT_RESULT.REJECTED && !auditForm.rejectReason.trim()) {
    auditError.value = '请填写拒绝原因'
    return
  }
  auditing.value = true
  auditError.value = ''
  try {
    await merchantApi.audit(auditTarget.value.id, {
      auditResult: auditForm.auditResult,
      merchantLevel:
        auditForm.auditResult === AUDIT_RESULT.APPROVED ? auditForm.merchantLevel : undefined,
      rejectReason:
        auditForm.auditResult === AUDIT_RESULT.REJECTED ? auditForm.rejectReason.trim() : undefined,
      remark: auditForm.remark.trim() || undefined
    })
    closeAudit()
    await load(page.value)
  } catch (e) {
    auditError.value = e instanceof ApiError ? e.message : '审核失败，请确认是否有商家审核权限'
  } finally {
    auditing.value = false
  }
}

async function setOfficial(item: MerchantItem) {
  upgradingId.value = item.id
  try {
    await merchantApi.update(item.id, { merchantLevel: MERCHANT_LEVEL.OFFICIAL_CERTIFIED })
    await load(page.value)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '设置官方认证失败'
  } finally {
    upgradingId.value = ''
  }
}

onMounted(() => load(1))
</script>

<style scoped>
.page { max-width: 1200px; }
.header { margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.tab { padding: 8px 16px; border-radius: 8px; border: 1px solid #e8e8ec; background: #fff; cursor: pointer; font-size: 14px; }
.tab.active { background: #5c5c9e; color: #fff; border-color: #5c5c9e; }
.toolbar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.input { padding: 8px 12px; border: 1px solid #e8e8ec; border-radius: 8px; min-width: 220px; }
.btnPrimary { padding: 10px 18px; border-radius: 8px; background: #5c5c9e; color: #fff; border: none; cursor: pointer; }
.panel { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table th, .table td { padding: 12px 10px; border-bottom: 1px solid #f0f0f3; text-align: left; }
.table th { color: #8c8c9a; font-weight: 500; }
.actions { display: flex; gap: 8px; align-items: center; }
.btnPrimarySm { padding: 6px 12px; border-radius: 6px; background: #5c5c9e; color: #fff; border: none; cursor: pointer; font-size: 13px; }
.btnGhostSm { padding: 6px 12px; border-radius: 6px; border: 1px solid #e8e8ec; background: #fff; cursor: pointer; font-size: 13px; }
.badge { font-size: 12px; color: #5c5c9e; background: #f0f0ff; padding: 4px 8px; border-radius: 4px; }
.loading, .empty, .error { font-size: 14px; color: #8c8c9a; padding: 12px 0; }
.error { color: #e05c5c; }
.pager { display: flex; align-items: center; gap: 12px; margin-top: 16px; font-size: 14px; }
.btnGhost { padding: 8px 14px; border-radius: 8px; border: 1px solid #e8e8ec; background: #fff; cursor: pointer; }
.modalOverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { width: 460px; max-width: calc(100vw - 32px); background: #fff; border-radius: 12px; overflow: hidden; }
.modalHeader { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f0f0f3; }
.modalTitle { font-size: 16px; font-weight: 600; }
.modalClose { border: none; background: none; font-size: 22px; cursor: pointer; color: #8c8c9a; }
.modalBody { padding: 20px; }
.modalFooter { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 20px; border-top: 1px solid #f0f0f3; }
.field { margin-bottom: 14px; }
.label { display: block; font-size: 13px; color: #8c8c9a; margin-bottom: 6px; }
.textarea { width: 100%; padding: 8px 12px; border: 1px solid #e8e8ec; border-radius: 8px; resize: vertical; box-sizing: border-box; }
</style>
