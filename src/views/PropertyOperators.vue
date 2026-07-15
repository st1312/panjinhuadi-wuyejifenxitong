<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">物业操作员</h1>
        <p class="desc">物业领导创建管理员账号，并分配管辖小区/楼栋与权限预设</p>
      </div>
      <button type="button" class="btnPrimary" @click="openCreate">创建管理员</button>
    </div>

    <div class="panel">
      <div v-if="loading" class="hint">加载中...</div>
      <p v-else-if="error" class="error">{{ error }}</p>
      <table v-else-if="list.length" class="table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>手机号</th>
            <th>管辖小区</th>
            <th>管辖楼栋</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td>{{ item.name || '—' }}</td>
            <td>{{ item.phone || '—' }}</td>
            <td>{{ formatList(item.communityIds) }}</td>
            <td>{{ formatList(item.buildingNos) }}</td>
            <td>{{ item.status || item.statusCode || '—' }}</td>
            <td class="actions">
              <button type="button" class="linkBtn" @click="openScope(item)">改范围</button>
              <button
                type="button"
                class="linkBtn"
                @click="toggleStatus(item)"
              >
                {{ isActive(item) ? '停用' : '启用' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="hint">暂无操作员</p>
    </div>

    <Teleport to="body">
      <div v-if="modalOpen" class="modalOverlay" @click.self="modalOpen = false">
        <div class="modal">
          <div class="modalHeader">
            <h3 class="modalTitle">{{ editingId ? '更新管辖范围' : '创建管理员' }}</h3>
            <button type="button" class="modalClose" @click="modalOpen = false">&times;</button>
          </div>
          <div class="modalBody">
            <template v-if="!editingId">
              <div class="field">
                <label class="label">姓名</label>
                <input v-model="form.name" class="input" />
              </div>
              <div class="field">
                <label class="label">手机号</label>
                <input v-model="form.phone" class="input" />
              </div>
              <div class="field">
                <label class="label">初始密码</label>
                <input v-model="form.password" type="password" class="input" />
              </div>
            </template>
            <div class="field">
              <label class="label">管辖小区 ID（逗号分隔，空=全公司）</label>
              <input v-model="form.communityIdsText" class="input" placeholder="com_001,com_002" />
            </div>
            <div class="field">
              <label class="label">管辖楼栋（逗号分隔，空=不限）</label>
              <input v-model="form.buildingNosText" class="input" placeholder="1号楼,2号楼" />
            </div>
            <div class="field">
              <label class="label">权限预设编码（可选）</label>
              <input v-model="form.permissionPresetCode" class="input" placeholder="如 property_operator_default" />
            </div>
            <p v-if="formError" class="error">{{ formError }}</p>
            <div class="modalFooter">
              <button type="button" class="btnSecondary" @click="modalOpen = false">取消</button>
              <button type="button" class="btnPrimary" :disabled="saving" @click="submit">
                {{ saving ? '保存中...' : '保存' }}
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
import { propertyOperatorApi } from '../api/services'
import { ApiError } from '../api/request'
import type { PropertyOperatorItem } from '../api/types'
import { ENTITY_STATUS } from '../constants/enums'

const loading = ref(false)
const error = ref('')
const list = ref<PropertyOperatorItem[]>([])

const modalOpen = ref(false)
const editingId = ref('')
const saving = ref(false)
const formError = ref('')
const form = ref({
  name: '',
  phone: '',
  password: '',
  communityIdsText: '',
  buildingNosText: '',
  permissionPresetCode: ''
})

function resolveError(e: unknown) {
  if (e instanceof ApiError) return e.message
  if (e instanceof Error) return e.message
  return '操作失败'
}

function parseCsv(text: string) {
  return text
    .split(/[,，\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function formatList(list?: string[]) {
  if (!list?.length) return '全部'
  return list.join('、')
}

function isActive(item: PropertyOperatorItem) {
  const code = item.statusCode || item.status
  return code === ENTITY_STATUS.ACTIVE || code === '启用' || code === 'active'
}

async function loadList() {
  loading.value = true
  error.value = ''
  try {
    const res = await propertyOperatorApi.list({ page: 1, pageSize: 100 })
    list.value = res.list || []
  } catch (e) {
    error.value = resolveError(e)
    list.value = []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = ''
  form.value = {
    name: '',
    phone: '',
    password: '',
    communityIdsText: '',
    buildingNosText: '',
    permissionPresetCode: ''
  }
  formError.value = ''
  modalOpen.value = true
}

function openScope(item: PropertyOperatorItem) {
  editingId.value = item.id
  form.value = {
    name: item.name || '',
    phone: item.phone || '',
    password: '',
    communityIdsText: (item.communityIds || []).join(','),
    buildingNosText: (item.buildingNos || []).join(','),
    permissionPresetCode: item.permissionPresetCode || ''
  }
  formError.value = ''
  modalOpen.value = true
}

async function submit() {
  formError.value = ''
  const communityIds = parseCsv(form.value.communityIdsText)
  const buildingNos = parseCsv(form.value.buildingNosText)
  saving.value = true
  try {
    if (editingId.value) {
      await propertyOperatorApi.updateScope(editingId.value, {
        communityIds: communityIds.length ? communityIds : undefined,
        buildingNos: buildingNos.length ? buildingNos : undefined,
        permissionPresetCode: form.value.permissionPresetCode.trim() || undefined
      })
    } else {
      if (!form.value.name.trim() || !form.value.phone.trim() || !form.value.password) {
        formError.value = '请填写姓名、手机号和初始密码'
        return
      }
      await propertyOperatorApi.create({
        name: form.value.name.trim(),
        phone: form.value.phone.trim(),
        password: form.value.password,
        communityIds: communityIds.length ? communityIds : undefined,
        buildingNos: buildingNos.length ? buildingNos : undefined,
        permissionPresetCode: form.value.permissionPresetCode.trim() || undefined
      })
    }
    modalOpen.value = false
    await loadList()
  } catch (e) {
    formError.value = resolveError(e)
  } finally {
    saving.value = false
  }
}

async function toggleStatus(item: PropertyOperatorItem) {
  const next = isActive(item) ? 'disabled' : ENTITY_STATUS.ACTIVE
  try {
    await propertyOperatorApi.updateStatus(item.id, next)
    await loadList()
  } catch (e) {
    error.value = resolveError(e)
  }
}

onMounted(loadList)
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
.panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ececf2;
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
.actions {
  display: flex;
  gap: 12px;
}
.hint {
  color: #8c8c9a;
}
.error {
  color: #d14343;
  font-size: 13px;
}
.linkBtn,
.btnPrimary,
.btnSecondary {
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
.input {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px 10px;
  font: inherit;
}
</style>
