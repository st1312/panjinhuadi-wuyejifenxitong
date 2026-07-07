<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">积分管理</h1>
        <p class="desc">购买积分并赠送给顾客</p>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h3 class="cardTitle">购买积分</h3>
        <p v-if="purchaseMsg" :class="purchaseMsgType">{{ purchaseMsg }}</p>
        <div class="field">
          <label class="label">积分数量</label>
          <input v-model.number="purchaseForm.pointAmount" type="number" min="1" class="input" />
        </div>
        <div class="field">
          <label class="label">支付金额（元）</label>
          <input v-model.number="purchaseForm.payAmount" type="number" min="0.01" step="0.01" class="input" />
        </div>
        <button class="btnPrimary" :disabled="purchaseSubmitting" @click="submitPurchase">
          {{ purchaseSubmitting ? '提交中...' : '提交购买申请' }}
        </button>
      </div>

      <div class="card">
        <h3 class="cardTitle">赠送积分</h3>
        <p v-if="grantMsg" :class="grantMsgType">{{ grantMsg }}</p>
        <div class="field">
          <label class="label">购买记录 ID</label>
          <input v-model="grantForm.purchaseId" class="input" placeholder="已通过审核的购买记录 ID" />
        </div>
        <div class="field">
          <label class="label">顾客 ID</label>
          <input v-model="grantForm.residentId" class="input" placeholder="res_xxx" />
        </div>
        <div class="field">
          <label class="label">赠送积分</label>
          <input v-model.number="grantForm.pointAmount" type="number" min="1" class="input" />
        </div>
        <div class="field">
          <label class="label">说明</label>
          <input v-model="grantForm.description" class="input" placeholder="如：消费赠送" />
        </div>
        <button class="btnPrimary" :disabled="grantSubmitting" @click="submitGrant">
          {{ grantSubmitting ? '赠送中...' : '确认赠送' }}
        </button>
      </div>
    </div>

    <div class="panel">
      <div class="panelHeader">
        <h3 class="cardTitle">购买记录</h3>
        <select v-model="auditFilter" class="select" @change="loadPurchases(1)">
          <option value="">全部状态</option>
          <option v-for="opt in MERCHANT_AUDIT_STATUS_OPTIONS.slice(1)" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <p v-else-if="listError" class="error">{{ listError }}</p>
      <table v-else-if="purchases.length" class="table">
        <thead>
          <tr>
            <th>时间</th>
            <th>积分</th>
            <th>金额</th>
            <th>状态</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in purchases" :key="item.id">
            <td>{{ item.createdAt || '—' }}</td>
            <td>{{ item.pointAmount ?? '—' }}</td>
            <td>¥{{ formatMoney(item.payAmount) }}</td>
            <td>{{ getEnumLabel(MERCHANT_AUDIT_STATUS_LABEL, item.status) }}</td>
            <td>{{ item.auditRemark || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">暂无购买记录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { merchantPortalApi } from '../../api/services'
import type { MerchantPointPurchaseItem } from '../../api/types'
import { ApiError } from '../../api/request'
import {
  getEnumLabel,
  MERCHANT_AUDIT_STATUS_LABEL,
  MERCHANT_AUDIT_STATUS_OPTIONS
} from '../../constants/enums'

const purchases = ref<MerchantPointPurchaseItem[]>([])
const loading = ref(false)
const listError = ref('')
const auditFilter = ref('')
const purchaseSubmitting = ref(false)
const grantSubmitting = ref(false)
const purchaseMsg = ref('')
const purchaseMsgType = ref('success')
const grantMsg = ref('')
const grantMsgType = ref('success')

const purchaseForm = reactive({ pointAmount: 1000, payAmount: 100 })
const grantForm = reactive({
  purchaseId: '',
  residentId: '',
  pointAmount: 50,
  description: '消费赠送'
})

function formatMoney(value?: number) {
  if (value === undefined || value === null) return '0.00'
  return Number(value).toFixed(2)
}

async function loadPurchases(page = 1) {
  loading.value = true
  listError.value = ''
  try {
    const res = await merchantPortalApi.pointPurchases({
      page,
      pageSize: 20,
      auditStatus: auditFilter.value || undefined,
      sort: '-createdAt'
    })
    purchases.value = res.list || []
  } catch (e) {
    listError.value = e instanceof ApiError ? e.message : '记录加载失败'
  } finally {
    loading.value = false
  }
}

async function submitPurchase() {
  if (!purchaseForm.pointAmount || !purchaseForm.payAmount) {
    purchaseMsg.value = '请填写积分数量和支付金额'
    purchaseMsgType.value = 'error'
    return
  }
  purchaseSubmitting.value = true
  purchaseMsg.value = ''
  try {
    await merchantPortalApi.purchasePoints({
      pointAmount: purchaseForm.pointAmount,
      payAmount: purchaseForm.payAmount
    })
    purchaseMsg.value = '购买申请已提交，等待审核'
    purchaseMsgType.value = 'success'
    await loadPurchases(1)
  } catch (e) {
    purchaseMsg.value = e instanceof ApiError ? e.message : '提交失败'
    purchaseMsgType.value = 'error'
  } finally {
    purchaseSubmitting.value = false
  }
}

async function submitGrant() {
  if (!grantForm.purchaseId || !grantForm.residentId || !grantForm.pointAmount) {
    grantMsg.value = '请填写完整赠送信息'
    grantMsgType.value = 'error'
    return
  }
  grantSubmitting.value = true
  grantMsg.value = ''
  try {
    await merchantPortalApi.grantPoints({ ...grantForm })
    grantMsg.value = '积分赠送成功'
    grantMsgType.value = 'success'
  } catch (e) {
    grantMsg.value = e instanceof ApiError ? e.message : '赠送失败'
    grantMsgType.value = 'error'
  } finally {
    grantSubmitting.value = false
  }
}

onMounted(() => loadPurchases(1))
</script>

<style scoped>
.page { max-width: 1200px; }
.header { margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.card, .panel { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.cardTitle { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #1f1f2e; }
.field { margin-bottom: 14px; }
.label { display: block; font-size: 13px; color: #5c5c66; margin-bottom: 8px; }
.input, .select { width: 100%; padding: 10px 12px; border: 1px solid #e8e8ec; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
.btnPrimary { padding: 10px 18px; border-radius: 8px; background: #5c5c9e; color: #fff; border: none; cursor: pointer; }
.success { color: #3aaf7d; font-size: 13px; margin-bottom: 12px; }
.error { color: #e05c5c; font-size: 13px; margin-bottom: 12px; }
.panelHeader { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.panelHeader .select { width: 160px; }
.loading, .empty { text-align: center; padding: 24px 0; color: #8c8c9a; }
.table th, .table td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #f0f0f3; font-size: 13px; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
</style>
