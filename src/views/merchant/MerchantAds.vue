<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">广告推送</h1>
        <p class="desc">每周免费 1 条；图文卡片推送到服务范围内用户的聊天列表（无需审核）</p>
      </div>
      <button type="button" class="btnPrimary" @click="openCreate">发布广告</button>
    </div>

    <div class="quotaCard" v-if="quota">
      <span>本周 {{ quota.weekStart || '—' }} ~ {{ quota.weekEnd || '—' }}</span>
      <span>免费 {{ quota.freeQuota ?? 1 }} · 已购 {{ quota.purchasedQuota ?? 0 }}</span>
      <span>已用 {{ quota.usedCount ?? 0 }} · 剩余 <strong>{{ quota.remainingCount ?? 0 }}</strong></span>
    </div>

    <div class="panel">
      <div v-if="loading" class="hint">加载中...</div>
      <p v-else-if="error" class="error">{{ error }}</p>
      <table v-else-if="list.length" class="table">
        <thead>
          <tr>
            <th>时间</th>
            <th>标题</th>
            <th>内容</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td>{{ item.createdAt || '—' }}</td>
            <td>{{ item.title }}</td>
            <td class="descCell">{{ item.content || '—' }}</td>
            <td>{{ item.status || '已发布' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="hint">暂无广告记录</p>
    </div>

    <Teleport to="body">
      <div v-if="modalOpen" class="modalOverlay" @click.self="modalOpen = false">
        <div class="modal">
          <div class="modalHeader">
            <h3 class="modalTitle">发布广告</h3>
            <button type="button" class="modalClose" @click="modalOpen = false">&times;</button>
          </div>
          <div class="modalBody">
            <div class="field">
              <label class="label">标题</label>
              <input v-model="form.title" class="input" maxlength="128" />
            </div>
            <div class="field">
              <label class="label">内容</label>
              <textarea v-model="form.content" class="textarea" rows="5" />
            </div>
            <div class="field">
              <label class="label">图片 URL（可选，每行一个）</label>
              <textarea v-model="form.imageUrlsText" class="textarea" rows="2" />
            </div>
            <div class="field">
              <label class="label">关联商品 ID（可选）</label>
              <input v-model="form.productId" class="input" placeholder="prd_xxx" />
            </div>
            <p v-if="formError" class="error">{{ formError }}</p>
            <div class="modalFooter">
              <button type="button" class="btnSecondary" @click="modalOpen = false">取消</button>
              <button type="button" class="btnPrimary" :disabled="saving" @click="submit">
                {{ saving ? '发布中...' : '发布' }}
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
import { merchantPortalApi } from '../../api/services'
import { ApiError } from '../../api/request'
import type { MerchantAdItem, MerchantAdQuota } from '../../api/types'
import { getPhase2ErrorMessage } from '../../constants/enums'

const loading = ref(false)
const error = ref('')
const list = ref<MerchantAdItem[]>([])
const quota = ref<MerchantAdQuota | null>(null)

const modalOpen = ref(false)
const saving = ref(false)
const formError = ref('')
const form = ref({
  title: '',
  content: '',
  imageUrlsText: '',
  productId: ''
})

function resolveError(e: unknown) {
  if (e instanceof ApiError) return getPhase2ErrorMessage(e.code, e.message)
  if (e instanceof Error) return e.message
  return '操作失败'
}

async function loadQuota() {
  try {
    quota.value = await merchantPortalApi.adQuota()
  } catch (e) {
    console.error(e)
  }
}

async function loadList() {
  loading.value = true
  error.value = ''
  try {
    const res = await merchantPortalApi.ads({ page: 1, pageSize: 50 })
    list.value = res.list || []
  } catch (e) {
    error.value = resolveError(e)
    list.value = []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = { title: '', content: '', imageUrlsText: '', productId: '' }
  formError.value = ''
  modalOpen.value = true
}

async function submit() {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    formError.value = '请填写标题和内容'
    return
  }
  const imageUrls = form.value.imageUrlsText
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
  saving.value = true
  formError.value = ''
  try {
    await merchantPortalApi.createAd({
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      imageUrls: imageUrls.length ? imageUrls : undefined,
      productId: form.value.productId.trim() || undefined
    })
    modalOpen.value = false
    await Promise.all([loadList(), loadQuota()])
  } catch (e) {
    formError.value = resolveError(e)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadQuota(), loadList()])
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.title {
  margin: 0;
  font-size: 22px;
}
.desc {
  margin: 6px 0 0;
  color: #8c8c9a;
  font-size: 13px;
}
.quotaCard {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: #f5f7ff;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
}
.panel {
  background: #fff;
  border: 1px solid #ececf2;
  border-radius: 12px;
  padding: 16px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.table th,
.table td {
  border-bottom: 1px solid #f0f0f5;
  padding: 10px 6px;
  text-align: left;
}
.descCell {
  max-width: 360px;
}
.hint {
  color: #8c8c9a;
}
.error {
  color: #d14343;
  font-size: 13px;
}
.btnPrimary {
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  background: #5c5c9e;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.btnPrimary:hover { background: #52529a; }
.btnPrimary:disabled { opacity: 0.6; cursor: not-allowed; }
.btnSecondary {
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid #e8e8ec;
  background: #ffffff;
  color: #5c5c66;
  font-size: 14px;
  cursor: pointer;
}
.btnSecondary:hover { border-color: #5c5c9e; color: #5c5c9e; }
.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.modal {
  background: #fff;
  border-radius: 12px;
  width: min(520px, 100%);
}
.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
}
.modalTitle {
  margin: 0;
}
.modalClose {
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
}
.modalBody {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.modalFooter {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.label {
  font-size: 13px;
  color: #666;
}
.input,
.textarea {
  border: 1px solid #e8e8ec;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  color: #1f1f2e;
  background: #ffffff;
  outline: none;
}
.input:focus,
.textarea:focus { border-color: #5c5c9e; }
</style>
