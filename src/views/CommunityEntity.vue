<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">社区多物业绑定</h1>
        <p class="desc">社区与物业公司多对多绑定，并配置社区管理员对物业的权限</p>
      </div>
      <button type="button" class="btnPrimary" @click="openCreate">创建社区</button>
    </div>

    <div class="panel">
      <div v-if="loading" class="hint">加载中...</div>
      <p v-else-if="error" class="error">{{ error }}</p>
      <table v-else-if="list.length" class="table">
        <thead>
          <tr>
            <th>社区名称</th>
            <th>管理员</th>
            <th>绑定物业数</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td>
              <div class="name">{{ item.name }}</div>
              <div class="sub">{{ item.description || item.id }}</div>
            </td>
            <td>{{ item.adminName || item.adminResidentId || '—' }}</td>
            <td>{{ item.propertyCompanyCount ?? '—' }}</td>
            <td>{{ item.createdAt || '—' }}</td>
            <td>
              <button type="button" class="linkBtn" @click="openBindings(item)">管理绑定</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="hint">暂无社区实体</p>
    </div>

    <Teleport to="body">
      <div v-if="createOpen" class="modalOverlay" @click.self="createOpen = false">
        <div class="modal">
          <div class="modalHeader">
            <h3 class="modalTitle">创建社区</h3>
            <button type="button" class="modalClose" @click="createOpen = false">&times;</button>
          </div>
          <div class="modalBody">
            <div class="field">
              <label class="label">名称</label>
              <input v-model="createForm.name" class="input" maxlength="100" />
            </div>
            <div class="field">
              <label class="label">描述</label>
              <textarea v-model="createForm.description" class="textarea" rows="3" />
            </div>
            <div class="field">
              <label class="label">社区管理员</label>
              <select
                v-model="createForm.adminResidentId"
                class="input"
                :disabled="operatorsLoading"
              >
                <option value="">
                  {{ operatorsLoading ? '加载管理员中...' : '请选择管理员（可选）' }}
                </option>
                <option
                  v-for="op in operators"
                  :key="op.id"
                  :value="op.residentId || op.id"
                >
                  {{ formatOperatorLabel(op) }}
                </option>
              </select>
              <p v-if="operatorsError" class="fieldHint error">{{ operatorsError }}</p>
            </div>
            <p v-if="createError" class="error">{{ createError }}</p>
            <div class="modalFooter">
              <button type="button" class="btnSecondary" @click="createOpen = false">取消</button>
              <button type="button" class="btnPrimary" :disabled="creating" @click="submitCreate">
                {{ creating ? '创建中...' : '创建' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="bindOpen" class="modalOverlay" @click.self="bindOpen = false">
        <div class="modal modalWide">
          <div class="modalHeader">
            <h3 class="modalTitle">绑定物业 — {{ currentEntity?.name }}</h3>
            <button type="button" class="modalClose" @click="bindOpen = false">&times;</button>
          </div>
          <div class="modalBody">
            <div class="bindForm">
              <select v-model="bindForm.propertyCompanyId" class="input">
                <option value="">选择物业公司</option>
                <option v-for="pc in propertyCompanies" :key="pc.id" :value="pc.id">
                  {{ pc.name || pc.id }}
                </option>
              </select>
              <select v-model="bindForm.permissionLevel" class="input">
                <option
                  v-for="opt in COMMUNITY_PERMISSION_LEVEL_OPTIONS"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
              <button type="button" class="btnPrimary" :disabled="binding" @click="submitBind">
                {{ binding ? '绑定中...' : '绑定' }}
              </button>
            </div>
            <p v-if="bindError" class="error">{{ bindError }}</p>
            <div v-if="bindingsLoading" class="hint">加载绑定列表...</div>
            <table v-else-if="bindings.length" class="table">
              <thead>
                <tr>
                  <th>物业公司</th>
                  <th>权限</th>
                  <th>绑定时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in bindings" :key="b.propertyCompanyId">
                  <td>{{ b.propertyCompanyName || b.propertyCompanyId }}</td>
                  <td>
                    <select
                      class="input sm"
                      :value="b.permissionLevel || COMMUNITY_PERMISSION_LEVEL.READ_ONLY"
                      @change="onPermissionChange(b, ($event.target as HTMLSelectElement).value)"
                    >
                      <option
                        v-for="opt in COMMUNITY_PERMISSION_LEVEL_OPTIONS"
                        :key="opt.value"
                        :value="opt.value"
                      >
                        {{ opt.label }}
                      </option>
                    </select>
                  </td>
                  <td>{{ b.boundAt || '—' }}</td>
                  <td>
                    <button type="button" class="dangerBtn" @click="unbind(b.propertyCompanyId)">
                      解绑
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="hint">暂无绑定物业</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { communityEntityApi, propertyCompanyApi, propertyOperatorApi } from '../api/services'
import { ApiError } from '../api/request'
import type {
  CommunityEntityItem,
  CommunityPropertyBindingItem,
  PropertyCompanyItem,
  PropertyOperatorItem
} from '../api/types'
import {
  COMMUNITY_PERMISSION_LEVEL,
  COMMUNITY_PERMISSION_LEVEL_OPTIONS,
  ENTITY_STATUS
} from '../constants/enums'

const loading = ref(false)
const error = ref('')
const list = ref<CommunityEntityItem[]>([])

const createOpen = ref(false)
const creating = ref(false)
const createError = ref('')
const createForm = ref({ name: '', description: '', adminResidentId: '' })
const operators = ref<PropertyOperatorItem[]>([])
const operatorsLoading = ref(false)
const operatorsError = ref('')

const bindOpen = ref(false)
const binding = ref(false)
const bindingsLoading = ref(false)
const bindError = ref('')
const currentEntity = ref<CommunityEntityItem | null>(null)
const bindings = ref<CommunityPropertyBindingItem[]>([])
const propertyCompanies = ref<PropertyCompanyItem[]>([])
const bindForm = ref({
  propertyCompanyId: '',
  permissionLevel: COMMUNITY_PERMISSION_LEVEL.READ_ONLY
})

function resolveError(e: unknown) {
  if (e instanceof ApiError) return e.message
  if (e instanceof Error) return e.message
  return '操作失败'
}

function normalizeBindings(
  data: { list: CommunityPropertyBindingItem[] } | CommunityPropertyBindingItem[]
) {
  return Array.isArray(data) ? data : data.list || []
}

async function loadList() {
  loading.value = true
  error.value = ''
  try {
    const res = await communityEntityApi.list({ page: 1, pageSize: 100 })
    list.value = res.list || []
  } catch (e) {
    error.value = resolveError(e)
    list.value = []
  } finally {
    loading.value = false
  }
}

async function loadPropertyCompanies() {
  try {
    const res = await propertyCompanyApi.list({ page: 1, pageSize: 100 })
    propertyCompanies.value = res.list || []
  } catch (e) {
    console.error(e)
  }
}

function formatOperatorLabel(op: PropertyOperatorItem) {
  const name = op.name || '未命名'
  const phone = op.phone ? `（${op.phone}）` : ''
  return `${name}${phone}`
}

async function loadOperators() {
  operatorsLoading.value = true
  operatorsError.value = ''
  try {
    const res = await propertyOperatorApi.list({
      page: 1,
      pageSize: 100,
      status: ENTITY_STATUS.ACTIVE
    })
    operators.value = res.list || []
  } catch (e) {
    operators.value = []
    operatorsError.value = resolveError(e) || '管理员列表加载失败'
  } finally {
    operatorsLoading.value = false
  }
}

function openCreate() {
  createForm.value = { name: '', description: '', adminResidentId: '' }
  createError.value = ''
  createOpen.value = true
  loadOperators()
}

async function submitCreate() {
  if (!createForm.value.name.trim()) {
    createError.value = '请填写社区名称'
    return
  }
  creating.value = true
  createError.value = ''
  try {
    await communityEntityApi.create({
      name: createForm.value.name.trim(),
      description: createForm.value.description.trim() || undefined,
      adminResidentId: createForm.value.adminResidentId.trim() || undefined
    })
    createOpen.value = false
    await loadList()
  } catch (e) {
    createError.value = resolveError(e)
  } finally {
    creating.value = false
  }
}

async function openBindings(item: CommunityEntityItem) {
  currentEntity.value = item
  bindOpen.value = true
  bindError.value = ''
  bindForm.value = {
    propertyCompanyId: '',
    permissionLevel: COMMUNITY_PERMISSION_LEVEL.READ_ONLY
  }
  bindingsLoading.value = true
  try {
    const data = await communityEntityApi.propertyCompanies(item.id)
    bindings.value = normalizeBindings(data)
  } catch (e) {
    bindError.value = resolveError(e)
    bindings.value = []
  } finally {
    bindingsLoading.value = false
  }
}

async function submitBind() {
  if (!currentEntity.value || !bindForm.value.propertyCompanyId) {
    bindError.value = '请选择物业公司'
    return
  }
  binding.value = true
  bindError.value = ''
  try {
    await communityEntityApi.bindProperty(currentEntity.value.id, {
      propertyCompanyId: bindForm.value.propertyCompanyId,
      permissionLevel: bindForm.value.permissionLevel
    })
    await openBindings(currentEntity.value)
    await loadList()
  } catch (e) {
    bindError.value = resolveError(e)
  } finally {
    binding.value = false
  }
}

async function unbind(propertyCompanyId: string) {
  if (!currentEntity.value) return
  if (!confirm('确认解绑该物业公司？')) return
  try {
    await communityEntityApi.unbindProperty(currentEntity.value.id, propertyCompanyId)
    await openBindings(currentEntity.value)
    await loadList()
  } catch (e) {
    bindError.value = resolveError(e)
  }
}

async function onPermissionChange(item: CommunityPropertyBindingItem, level: string) {
  if (!currentEntity.value) return
  try {
    await communityEntityApi.updatePermissions(currentEntity.value.id, item.propertyCompanyId, {
      permissionLevel: level,
      allowedModules: item.allowedModules
    })
    item.permissionLevel = level
  } catch (e) {
    bindError.value = resolveError(e)
  }
}

onMounted(async () => {
  await Promise.all([loadList(), loadPropertyCompanies()])
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
.panel,
.modal {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ececf2;
}
.panel {
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
.name {
  font-weight: 600;
}
.sub {
  color: #8c8c9a;
  font-size: 12px;
}
.hint {
  color: #8c8c9a;
  font-size: 13px;
}
.error {
  color: #d14343;
  font-size: 13px;
}
.linkBtn,
.btnPrimary,
.btnSecondary,
.dangerBtn {
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
  font: inherit;
}
.linkBtn {
  background: transparent;
  color: #2f6bff;
  padding: 0;
}
.btnPrimary {
  background: #2f6bff;
  color: #fff;
}
.btnSecondary {
  background: #f2f3f7;
}
.dangerBtn {
  background: transparent;
  color: #d14343;
  padding: 0;
}
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
  width: min(520px, 100%);
  max-height: 90vh;
  overflow: auto;
}
.modalWide {
  width: min(860px, 100%);
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
  font-size: 16px;
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
.fieldHint {
  margin: 0;
  font-size: 12px;
  color: #8c8c9a;
}
.input,
.textarea {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px 10px;
  font: inherit;
}
.input.sm {
  width: 120px;
}
.bindForm {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
