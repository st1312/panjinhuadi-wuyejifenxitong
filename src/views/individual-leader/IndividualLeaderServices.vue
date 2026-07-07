<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">我的服务</h1>
        <p class="desc">发布和管理社区服务项目</p>
      </div>
      <button class="btnPrimary" @click="openCreate">发布服务</button>
    </div>

    <div class="panel">
      <div v-if="loading" class="loading">加载中...</div>
      <p v-else-if="error" class="error">{{ error }}</p>
      <table v-else-if="services.length" class="table">
        <thead>
          <tr>
            <th>服务名称</th>
            <th>分类</th>
            <th>价格</th>
            <th>会员价</th>
            <th>单位</th>
            <th>状态</th>
            <th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in services" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ getEnumLabel(SERVICE_CATEGORY_LABEL, item.category, item.categoryName || '—') }}</td>
            <td>{{ item.price != null ? `¥${formatMoney(item.price)}` : '—' }}</td>
            <td>{{ item.memberPrice != null ? `¥${formatMoney(item.memberPrice)}` : '—' }}</td>
            <td>{{ item.priceUnit || '—' }}</td>
            <td>{{ item.status === ENTITY_STATUS.ACTIVE ? '上架' : item.status || '—' }}</td>
            <td>{{ item.createdAt || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">暂无服务，点击右上角发布</p>
    </div>

    <Teleport to="body">
      <div v-if="modalOpen" class="modalOverlay" @click.self="closeModal">
        <div class="modal">
          <div class="modalHeader">
            <h3 class="modalTitle">发布服务</h3>
            <button class="modalClose" @click="closeModal">&times;</button>
          </div>
          <div class="modalBody">
            <p v-if="formError" class="error">{{ formError }}</p>
            <div class="field">
              <label class="label">服务名称</label>
              <input v-model="form.name" class="input" placeholder="如：家电维修" />
            </div>
            <div class="field">
              <label class="label">服务分类</label>
              <select v-model="form.category" class="input">
                <option v-for="opt in SERVICE_CATEGORY_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div class="fieldRow">
              <div class="field">
                <label class="label">价格</label>
                <input v-model.number="form.price" type="number" min="0" step="0.01" class="input" />
              </div>
              <div class="field">
                <label class="label">会员价</label>
                <input v-model.number="form.memberPrice" type="number" min="0" step="0.01" class="input" />
              </div>
            </div>
            <div class="field">
              <label class="label">价格单位</label>
              <input v-model="form.priceUnit" class="input" placeholder="次 / 月 / 年" />
            </div>
            <div class="field">
              <label class="label">服务描述</label>
              <textarea v-model="form.description" class="textarea" rows="3" />
            </div>
          </div>
          <div class="modalFooter">
            <button class="btnSecondary" @click="closeModal">取消</button>
            <button class="btnPrimary" :disabled="submitting" @click="submit">
              {{ submitting ? '发布中...' : '确认发布' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { serviceApi } from '../../api/services'
import type { CommunityServiceItem } from '../../api/types'
import { ApiError } from '../../api/request'
import {
  ENTITY_STATUS,
  getEnumLabel,
  SERVICE_CATEGORY,
  SERVICE_CATEGORY_LABEL,
  SERVICE_CATEGORY_OPTIONS
} from '../../constants/enums'

const services = ref<CommunityServiceItem[]>([])
const loading = ref(false)
const error = ref('')
const modalOpen = ref(false)
const submitting = ref(false)
const formError = ref('')
const form = reactive({
  name: '',
  category: SERVICE_CATEGORY.CLEANING_REPAIR,
  price: undefined as number | undefined,
  memberPrice: undefined as number | undefined,
  priceUnit: '次',
  description: ''
})

function formatMoney(value?: number) {
  if (value === undefined || value === null) return '0.00'
  return Number(value).toFixed(2)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await serviceApi.list({ mine: true, page: 1, pageSize: 100, sort: '-createdAt' })
    services.value = res.list || []
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '服务加载失败'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.name = ''
  form.category = SERVICE_CATEGORY.CLEANING_REPAIR
  form.price = undefined
  form.memberPrice = undefined
  form.priceUnit = '次'
  form.description = ''
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

async function submit() {
  if (!form.name.trim()) {
    formError.value = '请输入服务名称'
    return
  }
  submitting.value = true
  formError.value = ''
  try {
    await serviceApi.create({
      name: form.name.trim(),
      category: form.category,
      price: form.price,
      memberPrice: form.memberPrice,
      priceUnit: form.priceUnit || undefined,
      description: form.description || undefined
    })
    closeModal()
    await load()
  } catch (e) {
    formError.value = e instanceof ApiError ? e.message : '发布失败'
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.page { max-width: 1200px; }
.header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.btnPrimary { padding: 10px 18px; border-radius: 8px; background: #5c5c9e; color: #fff; border: none; cursor: pointer; }
.btnSecondary { padding: 10px 18px; border-radius: 8px; border: 1px solid #e8e8ec; background: #fff; cursor: pointer; }
.panel { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.loading, .empty, .error { text-align: center; padding: 32px 0; color: #8c8c9a; font-size: 14px; }
.error { color: #e05c5c; }
.table th, .table td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #f0f0f3; font-size: 13px; }
.modalOverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { width: 520px; max-width: calc(100vw - 32px); background: #fff; border-radius: 12px; }
.modalHeader { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f0f0f3; }
.modalTitle { font-size: 16px; font-weight: 600; }
.modalClose { font-size: 24px; color: #8c8c9a; cursor: pointer; }
.modalBody { padding: 24px; }
.modalFooter { display: flex; justify-content: flex-end; gap: 12px; padding: 0 24px 24px; }
.field { margin-bottom: 16px; }
.fieldRow { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.label { display: block; font-size: 13px; color: #5c5c66; margin-bottom: 8px; }
.input, .textarea { width: 100%; padding: 10px 12px; border: 1px solid #e8e8ec; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
.textarea { resize: vertical; font-family: inherit; }
</style>
