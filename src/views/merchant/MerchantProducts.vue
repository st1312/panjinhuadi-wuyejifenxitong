<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">商品管理</h1>
        <p class="desc">维护店铺商品与库存</p>
      </div>
      <button class="btnPrimary" @click="openCreate">新增商品</button>
    </div>

    <div class="panel">
      <div v-if="loading" class="loading">加载中...</div>
      <p v-else-if="error" class="error">{{ error }}</p>
      <template v-else>
        <table v-if="products.length" class="table">
          <thead>
            <tr>
              <th>名称</th>
              <th>分类</th>
              <th>价格</th>
              <th>会员价</th>
              <th>库存</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in products" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.category || '—' }}</td>
              <td>¥{{ formatMoney(item.price) }}</td>
              <td>{{ item.memberPrice != null ? `¥${formatMoney(item.memberPrice)}` : '—' }}</td>
              <td>{{ item.stock ?? '—' }}</td>
              <td>{{ item.status === ENTITY_STATUS.ACTIVE ? '上架' : item.status || '—' }}</td>
              <td><button class="linkBtn" @click="openEdit(item)">编辑</button></td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">暂无商品，点击右上角新增</p>
      </template>
    </div>

    <Teleport to="body">
      <div v-if="modalOpen" class="modalOverlay" @click.self="closeModal">
        <div class="modal">
          <div class="modalHeader">
            <h3 class="modalTitle">{{ editingId ? '编辑商品' : '新增商品' }}</h3>
            <button class="modalClose" @click="closeModal">&times;</button>
          </div>
          <div class="modalBody">
            <p v-if="formError" class="error">{{ formError }}</p>
            <div class="field">
              <label class="label">商品名称</label>
              <input v-model="form.name" class="input" placeholder="请输入商品名称" />
            </div>
            <div class="field">
              <label class="label">分类</label>
              <input v-model="form.category" class="input" placeholder="如：饮料" />
            </div>
            <div class="fieldRow">
              <div class="field">
                <label class="label">价格</label>
                <input v-model.number="form.price" type="number" min="0.01" step="0.01" class="input" />
              </div>
              <div class="field">
                <label class="label">会员价</label>
                <input v-model.number="form.memberPrice" type="number" min="0.01" step="0.01" class="input" />
              </div>
            </div>
            <div class="fieldRow">
              <div class="field">
                <label class="label">积分价</label>
                <input v-model.number="form.pointPrice" type="number" min="1" class="input" />
              </div>
              <div class="field">
                <label class="label">库存</label>
                <input v-model.number="form.stock" type="number" min="0" class="input" />
              </div>
            </div>
            <div class="field">
              <label class="label">描述</label>
              <textarea v-model="form.description" class="textarea" rows="3" />
            </div>
          </div>
          <div class="modalFooter">
            <button class="btnSecondary" @click="closeModal">取消</button>
            <button class="btnPrimary" :disabled="submitting" @click="submit">{{ submitting ? '保存中...' : '保存' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { merchantPortalApi } from '../../api/services'
import type { ProductItem } from '../../api/types'
import { ApiError } from '../../api/request'
import { ENTITY_STATUS } from '../../constants/enums'

const products = ref<ProductItem[]>([])
const merchantId = ref('')
const loading = ref(false)
const error = ref('')
const modalOpen = ref(false)
const editingId = ref('')
const submitting = ref(false)
const formError = ref('')
const form = reactive({
  name: '',
  category: '',
  price: 0,
  memberPrice: undefined as number | undefined,
  pointPrice: undefined as number | undefined,
  stock: 0,
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
    const shop = await merchantPortalApi.my()
    merchantId.value = shop.id
    const res = await merchantPortalApi.products({
      merchantId: shop.id,
      page: 1,
      pageSize: 100,
      sort: '-createdAt'
    })
    products.value = res.list?.length ? res.list : shop.products || []
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '商品加载失败'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.name = ''
  form.category = ''
  form.price = 0
  form.memberPrice = undefined
  form.pointPrice = undefined
  form.stock = 0
  form.description = ''
  formError.value = ''
}

function openCreate() {
  editingId.value = ''
  resetForm()
  modalOpen.value = true
}

function openEdit(item: ProductItem) {
  editingId.value = item.id
  form.name = item.name
  form.category = item.category || ''
  form.price = item.price || 0
  form.memberPrice = item.memberPrice
  form.pointPrice = item.pointPrice
  form.stock = item.stock || 0
  form.description = item.description || ''
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

async function submit() {
  if (!form.name.trim()) {
    formError.value = '请输入商品名称'
    return
  }
  if (!form.price || form.price <= 0) {
    formError.value = '请输入有效价格'
    return
  }
  submitting.value = true
  formError.value = ''
  try {
    const payload = {
      name: form.name.trim(),
      category: form.category || undefined,
      price: form.price,
      memberPrice: form.memberPrice,
      pointPrice: form.pointPrice,
      stock: form.stock,
      description: form.description || undefined,
      status: ENTITY_STATUS.ACTIVE
    }
    if (editingId.value) {
      await merchantPortalApi.updateProduct(editingId.value, payload)
    } else {
      await merchantPortalApi.createProduct(payload)
    }
    closeModal()
    await load()
  } catch (e) {
    formError.value = e instanceof ApiError ? e.message : '保存失败'
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
.linkBtn { color: #5c5c9e; cursor: pointer; }
.modalOverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { width: 520px; max-width: calc(100vw - 32px); background: #fff; border-radius: 12px; overflow: hidden; }
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
