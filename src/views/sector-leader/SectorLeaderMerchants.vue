<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">板块商家</h1>
        <p class="desc">管理本板块商家，可踢出不合格商家</p>
      </div>
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
            <th>排名</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in merchants" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.category || '—' }}</td>
            <td>{{ getEnumLabel(MERCHANT_LEVEL_LABEL, item.merchantLevel) }}</td>
            <td>{{ item.rankOrder ?? '—' }}</td>
            <td>{{ getEnumLabel(MERCHANT_STATUS_LABEL, item.status) }}</td>
            <td>
              <button
                class="btnDanger"
                :disabled="item.status === MERCHANT_STATUS.KICKED || kickingId === item.id"
                @click="openKick(item)"
              >
                踢出
              </button>
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
      <div v-if="kickTarget" class="modalOverlay" @click.self="closeKick">
        <div class="modal">
          <div class="modalHeader">
            <h3 class="modalTitle">踢出商家</h3>
            <button class="modalClose" @click="closeKick">&times;</button>
          </div>
          <div class="modalBody">
            <p class="hint">确认踢出「{{ kickTarget.name }}」？踢出后商品将自动下架。</p>
            <div class="field">
              <label class="label">踢出原因</label>
              <textarea v-model="kickReason" class="textarea" rows="3" placeholder="请填写踢出原因" />
            </div>
            <p v-if="kickError" class="error">{{ kickError }}</p>
          </div>
          <div class="modalFooter">
            <button class="btnGhost" @click="closeKick">取消</button>
            <button class="btnDanger" :disabled="kicking" @click="confirmKick">
              {{ kicking ? '处理中...' : '确认踢出' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { merchantApi } from '../../api/services'
import type { MerchantItem } from '../../api/types'
import { ApiError } from '../../api/request'
import {
  getEnumLabel,
  MERCHANT_LEVEL_LABEL,
  MERCHANT_STATUS,
  MERCHANT_STATUS_LABEL
} from '../../constants/enums'

const merchants = ref<MerchantItem[]>([])
const loading = ref(false)
const error = ref('')
const keyword = ref('')
const page = ref(1)
const totalPages = ref(1)
const kickTarget = ref<MerchantItem | null>(null)
const kickReason = ref('')
const kickError = ref('')
const kicking = ref(false)
const kickingId = ref('')

async function load(pageNo = 1) {
  loading.value = true
  error.value = ''
  try {
    const res = await merchantApi.list({
      page: pageNo,
      pageSize: 20,
      keyword: keyword.value.trim() || undefined,
      sort: '+rankOrder'
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

function reload() {
  load(1)
}

function changePage(next: number) {
  load(next)
}

function openKick(item: MerchantItem) {
  kickTarget.value = item
  kickReason.value = ''
  kickError.value = ''
}

function closeKick() {
  kickTarget.value = null
}

async function confirmKick() {
  if (!kickTarget.value) return
  const reason = kickReason.value.trim()
  if (!reason) {
    kickError.value = '请填写踢出原因'
    return
  }
  kicking.value = true
  kickError.value = ''
  kickingId.value = kickTarget.value.id
  try {
    await merchantApi.kick(kickTarget.value.id, { reason, notifyMerchant: true })
    closeKick()
    await load(page.value)
  } catch (e) {
    kickError.value = e instanceof ApiError ? e.message : '踢出失败'
  } finally {
    kicking.value = false
    kickingId.value = ''
  }
}

onMounted(() => load(1))
</script>

<style scoped>
.page { max-width: 1200px; }
.header { margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.toolbar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.input { padding: 8px 12px; border: 1px solid #e8e8ec; border-radius: 8px; min-width: 220px; }
.btnPrimary { padding: 10px 18px; border-radius: 8px; background: #5c5c9e; color: #fff; border: none; cursor: pointer; }
.btnPrimary:hover { background: #52529a; }
.panel { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table th, .table td { padding: 12px 10px; border-bottom: 1px solid #f0f0f3; text-align: left; }
.table th { color: #8c8c9a; font-weight: 500; }
.loading, .empty, .error { font-size: 14px; color: #8c8c9a; padding: 12px 0; }
.error { color: #e05c5c; }
.btnDanger { padding: 6px 12px; border-radius: 6px; background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e; cursor: pointer; }
.btnDanger:disabled { opacity: 0.5; cursor: not-allowed; }
.pager { display: flex; align-items: center; gap: 12px; margin-top: 16px; font-size: 14px; }
.btnGhost { padding: 8px 14px; border-radius: 8px; border: 1px solid #e8e8ec; background: #fff; color: #5c5c66; font-size: 14px; cursor: pointer; }
.btnGhost:hover { border-color: #5c5c9e; color: #5c5c9e; }
.modalOverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { width: 420px; max-width: calc(100vw - 32px); background: #fff; border-radius: 12px; overflow: hidden; }
.modalHeader { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f0f0f3; }
.modalTitle { font-size: 16px; font-weight: 600; }
.modalClose { border: none; background: none; font-size: 22px; cursor: pointer; color: #8c8c9a; }
.modalBody { padding: 20px; }
.modalFooter { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 20px; border-top: 1px solid #f0f0f3; }
.hint { font-size: 14px; color: #5c5c66; margin-bottom: 16px; }
.field { margin-bottom: 8px; }
.label { display: block; font-size: 13px; color: #8c8c9a; margin-bottom: 6px; }
.textarea { width: 100%; padding: 8px 12px; border: 1px solid #e8e8ec; border-radius: 8px; resize: vertical; box-sizing: border-box; }
</style>
