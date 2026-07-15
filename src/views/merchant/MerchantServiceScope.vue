<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">服务范围与消息服务</h1>
        <p class="desc">选择可服务的小区，并配置用户消息服务（接修窗帘等需求）</p>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="cardHead">服务小区</div>
        <div v-if="scopeLoading" class="hint">加载中...</div>
        <template v-else>
          <label class="checkbox">
            <input v-model="serveAll" type="checkbox" @change="onServeAllChange" />
            <span>服务全部小区（本物业挂接下）</span>
          </label>
          <div class="checkboxGroup">
            <label v-for="c in communities" :key="c.communityId" class="checkbox">
              <input
                v-model="selectedIds"
                type="checkbox"
                :value="c.communityId"
                :disabled="serveAll"
              />
              <span>{{ c.communityName || c.communityId }}</span>
            </label>
          </div>
          <p v-if="scopeError" class="error">{{ scopeError }}</p>
          <p v-if="scopeSuccess" class="success">{{ scopeSuccess }}</p>
          <button type="button" class="btnPrimary" :disabled="scopeSaving" @click="saveScope">
            {{ scopeSaving ? '保存中...' : '保存服务范围' }}
          </button>
        </template>
      </div>

      <div class="card">
        <div class="cardHead">用户消息服务</div>
        <div class="field">
          <label class="checkbox">
            <input v-model="msgForm.enabled" type="checkbox" />
            <span>开通用户消息服务（接收服务需求）</span>
          </label>
        </div>
        <div class="field">
          <label class="label">服务半径</label>
          <select v-model="msgForm.serviceRadius" class="input" :disabled="!msgForm.enabled">
            <option v-for="opt in SERVICE_RADIUS_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div class="field">
          <label class="label">服务分类</label>
          <div class="checkboxGroup">
            <label v-for="cat in categories" :key="cat.id" class="checkbox">
              <input
                v-model="msgForm.categoryIds"
                type="checkbox"
                :value="cat.id"
                :disabled="!msgForm.enabled"
              />
              <span>{{ cat.name }}</span>
            </label>
          </div>
          <p v-if="!categories.length" class="hint">暂无分类字典，可先开通后由后台配置</p>
        </div>
        <p v-if="msgError" class="error">{{ msgError }}</p>
        <p v-if="msgSuccess" class="success">{{ msgSuccess }}</p>
        <button type="button" class="btnPrimary" :disabled="msgSaving" @click="saveMessageService">
          {{ msgSaving ? '保存中...' : '保存消息服务' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { merchantPortalApi, serviceCategoryApi } from '../../api/services'
import { ApiError } from '../../api/request'
import type { MerchantServiceScopeCommunity, ServiceCategoryDictItem } from '../../api/types'
import { SERVICE_RADIUS, SERVICE_RADIUS_OPTIONS, getPhase2ErrorMessage } from '../../constants/enums'

const scopeLoading = ref(false)
const scopeSaving = ref(false)
const scopeError = ref('')
const scopeSuccess = ref('')
const serveAll = ref(false)
const selectedIds = ref<string[]>([])
const communities = ref<MerchantServiceScopeCommunity[]>([])

const categories = ref<ServiceCategoryDictItem[]>([])
const msgForm = ref({
  enabled: false,
  serviceRadius: SERVICE_RADIUS.KM3,
  categoryIds: [] as string[]
})
const msgSaving = ref(false)
const msgError = ref('')
const msgSuccess = ref('')

function resolveError(e: unknown) {
  if (e instanceof ApiError) return getPhase2ErrorMessage(e.code, e.message)
  if (e instanceof Error) return e.message
  return '操作失败'
}

function onServeAllChange() {
  if (serveAll.value) selectedIds.value = []
}

async function loadScope() {
  scopeLoading.value = true
  scopeError.value = ''
  try {
    const data = await merchantPortalApi.getServiceScope()
    serveAll.value = !!data.serveAllCommunities
    communities.value = data.communities || []
    selectedIds.value = (data.communities || [])
      .filter((c) => c.selected)
      .map((c) => c.communityId)
  } catch (e) {
    scopeError.value = resolveError(e)
  } finally {
    scopeLoading.value = false
  }
}

async function loadCategories() {
  try {
    const data = await serviceCategoryApi.list()
    categories.value = Array.isArray(data) ? data : data.list || []
  } catch (e) {
    console.error(e)
  }
}

async function saveScope() {
  scopeSaving.value = true
  scopeError.value = ''
  scopeSuccess.value = ''
  try {
    await merchantPortalApi.updateServiceScope({
      serveAllCommunities: serveAll.value,
      communityIds: serveAll.value ? undefined : [...selectedIds.value]
    })
    scopeSuccess.value = '服务范围已保存'
    await loadScope()
  } catch (e) {
    scopeError.value = resolveError(e)
  } finally {
    scopeSaving.value = false
  }
}

async function saveMessageService() {
  msgSaving.value = true
  msgError.value = ''
  msgSuccess.value = ''
  try {
    await merchantPortalApi.updateMessageService({
      enabled: msgForm.value.enabled,
      serviceRadius: msgForm.value.serviceRadius,
      categoryIds: msgForm.value.categoryIds.length ? [...msgForm.value.categoryIds] : undefined
    })
    msgSuccess.value = '消息服务配置已保存'
  } catch (e) {
    msgError.value = resolveError(e)
  } finally {
    msgSaving.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadScope(), loadCategories()])
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.header .title {
  margin: 0;
  font-size: 22px;
}
.desc {
  margin: 6px 0 0;
  color: #8c8c9a;
  font-size: 13px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
.card {
  background: #fff;
  border: 1px solid #ececf2;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cardHead {
  font-weight: 600;
}
.checkboxGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
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
.input {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px 10px;
  font: inherit;
}
.btnPrimary {
  align-self: flex-start;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  background: #2f6bff;
  color: #fff;
  cursor: pointer;
  font: inherit;
}
.hint {
  color: #8c8c9a;
  font-size: 13px;
}
.error {
  color: #d14343;
  font-size: 13px;
}
.success {
  color: #1f8a4c;
  font-size: 13px;
}
</style>
