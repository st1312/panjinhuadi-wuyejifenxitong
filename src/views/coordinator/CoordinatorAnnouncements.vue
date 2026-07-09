<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">统筹公告</h1>
        <p class="desc">发布平台级公告</p>
      </div>
      <button class="btnPrimary" @click="openCreate">发布公告</button>
    </div>

    <div class="toolbar">
      <select v-model="statusFilter" class="input">
        <option v-for="opt in ANNOUNCEMENT_LIST_STATUS_OPTIONS" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <button class="btnGhost" :disabled="loading" @click="load(page)">刷新</button>
    </div>

    <div class="panel">
      <div v-if="loading" class="loading">加载中...</div>
      <p v-else-if="error" class="error">{{ error }}</p>
      <table v-else-if="displayNotices.length" class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>推送范围</th>
            <th>状态</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in displayNotices" :key="item.id">
            <td>
              <div class="cellTitle">{{ item.title }}</div>
            </td>
            <td>
              <div class="cellSub">{{ formatAnnouncementTargetRoles(item.targetRoles) }}</div>
              <div class="cellSub muted">{{ formatBuildings(item.targetBuildings) }}</div>
            </td>
            <td>
              <span class="statusTag" :class="item.status">{{ getEnumLabel(ANNOUNCEMENT_STATUS_LABEL, item.status) }}</span>
            </td>
            <td>{{ item.publishedAt || item.createdAt || '—' }}</td>
            <td class="actions">
              <div class="actionsInner">
                <button class="linkBtn" @click="openDetail(item.id)">详情</button>
                <button
                  v-if="item.status !== ANNOUNCEMENT_STATUS.ARCHIVED"
                  class="linkBtn"
                  @click="openEdit(item.id)"
                >
                  编辑
                </button>
                <button
                  v-if="item.status !== ANNOUNCEMENT_STATUS.ARCHIVED"
                  class="linkBtn danger"
                  :disabled="removingId === item.id"
                  @click="removeNotice(item.id)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">暂无公告</p>
    </div>

    <div v-if="totalPages > 1" class="pager">
      <button class="btnGhost" :disabled="page <= 1 || loading" @click="changePage(page - 1)">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button class="btnGhost" :disabled="page >= totalPages || loading" @click="changePage(page + 1)">下一页</button>
    </div>

    <Teleport to="body">
      <div v-if="detailOpen" class="modalOverlay" @click.self="closeDetail">
        <div class="modal">
          <div class="modalHeader">
            <h3 class="modalTitle">公告详情</h3>
            <button class="modalClose" @click="closeDetail">&times;</button>
          </div>
          <div class="modalBody">
            <div v-if="detailLoading" class="loading">加载中...</div>
            <p v-else-if="detailError" class="error">{{ detailError }}</p>
            <template v-else-if="detailData">
              <dl class="metaList">
                <div class="metaItem"><dt>状态</dt><dd>{{ getEnumLabel(ANNOUNCEMENT_STATUS_LABEL, detailData.status) }}</dd></div>
                <div class="metaItem"><dt>目标群体</dt><dd>{{ formatAnnouncementTargetRoles(detailData.targetRoles) }}</dd></div>
                <div class="metaItem"><dt>覆盖楼栋</dt><dd>{{ formatBuildings(detailData.targetBuildings) }}</dd></div>
                <div class="metaItem"><dt>信息收集</dt><dd>{{ detailData.collectEnabled ? '已启用' : '未启用' }}</dd></div>
                <div class="metaItem"><dt>发布时间</dt><dd>{{ detailData.publishedAt || '—' }}</dd></div>
              </dl>
              <div v-if="detailData.content" class="contentBlock">
                <div class="label">正文</div>
                <p>{{ detailData.content }}</p>
              </div>
            </template>
          </div>
          <div class="modalFooter">
            <button class="btnGhost" @click="closeDetail">关闭</button>
            <button
              v-if="detailData && detailData.status !== ANNOUNCEMENT_STATUS.ARCHIVED"
              class="btnPrimary"
              @click="openEditFromDetail"
            >
              编辑
            </button>
          </div>
        </div>
      </div>

      <div v-if="modalOpen" class="modalOverlay" @click.self="closeModal">
        <div class="modal">
          <div class="modalHeader">
            <h3 class="modalTitle">{{ editingId ? '编辑公告' : '发布公告' }}</h3>
            <button class="modalClose" @click="closeModal">&times;</button>
          </div>
          <div class="modalBody">
            <p v-if="formError" class="error">{{ formError }}</p>

            <div class="field">
              <label class="label">标题</label>
              <input v-model="form.title" class="input" maxlength="200" placeholder="公告标题" />
            </div>
            <div class="field">
              <label class="label">内容</label>
              <textarea v-model="form.content" class="textarea" rows="4" placeholder="公告正文" />
            </div>

            <div class="field">
              <label class="label">目标群体</label>
              <select v-model="form.selectedTargetRoles" class="input multi" multiple size="5">
                <option v-for="opt in ANNOUNCEMENT_TARGET_ROLE_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
              <p class="hint">不选表示全部角色；Windows 按住 Ctrl 多选</p>
            </div>

            <div class="field">
              <label class="label">覆盖楼栋</label>
              <select v-model="form.selectedBuildings" class="input multi" multiple size="4">
                <option v-for="building in buildingOptions" :key="building" :value="building">
                  {{ building }}
                </option>
              </select>
              <p class="hint">不选表示全部楼栋</p>
            </div>

            <button type="button" class="toggleMore" @click="showMore = !showMore">
              {{ showMore ? '收起更多设置' : '更多设置（封面 / 信息收集）' }}
            </button>

            <div v-if="showMore" class="moreBlock">
              <div class="field">
                <label class="label">封面图片 URL</label>
                <textarea v-model="form.coverUrlsText" class="textarea" rows="2" placeholder="每行一个，可选" />
              </div>
              <label class="inlineCheck">
                <input v-model="form.collectEnabled" type="checkbox" />
                <span>启用信息收集</span>
              </label>
              <div v-if="form.collectEnabled" class="field">
                <label class="label">收集字段</label>
                <div v-for="(field, index) in form.collectFields" :key="index" class="collectRow">
                  <input v-model="field.label" class="input" placeholder="显示名称" />
                  <select v-model="field.type" class="input typeSelect">
                    <option v-for="opt in ANNOUNCEMENT_COLLECT_FIELD_TYPE_OPTIONS" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                  <button type="button" class="linkBtn danger" @click="removeCollectField(index)">删除</button>
                </div>
                <button type="button" class="linkBtn" @click="addCollectField">+ 添加字段</button>
              </div>
            </div>
          </div>
          <div class="modalFooter">
            <button class="btnGhost" @click="closeModal">取消</button>
            <button class="btnGhost" :disabled="submitting" @click="submit(ANNOUNCEMENT_STATUS.DRAFT)">存草稿</button>
            <button class="btnPrimary" :disabled="submitting" @click="submit(ANNOUNCEMENT_STATUS.PUBLISHED)">
              {{ submitting ? '提交中...' : '发布' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { announcementApi, residentApi } from '../../api/services'
import type { AnnouncementCollectField, AnnouncementCreatePayload, AnnouncementItem, AnnouncementUpdatePayload, ResidentItem } from '../../api/types'
import { ApiError } from '../../api/request'
import {
  ANNOUNCEMENT_COLLECT_FIELD_TYPE_OPTIONS,
  ANNOUNCEMENT_LIST_STATUS_OPTIONS,
  ANNOUNCEMENT_STATUS,
  ANNOUNCEMENT_STATUS_LABEL,
  ANNOUNCEMENT_TARGET_ROLE_OPTIONS,
  ANNOUNCEMENT_TYPE,
  formatAnnouncementTargetRoles,
  getEnumLabel,
  USER_ROLE
} from '../../constants/enums'
import { useAuthStore } from '../../stores/auth'

const DEFAULT_COMMUNITY_ID = import.meta.env.VITE_COMMUNITY_ID || 'com_demo001'
const DEFAULT_COLLECT_FIELDS: AnnouncementCollectField[] = [
  { name: 'needWater', label: '是否需要储水', type: 'boolean' },
  { name: 'contactPhone', label: '联系电话', type: 'text' }
]

const auth = useAuthStore()
const notices = ref<AnnouncementItem[]>([])
const loading = ref(false)
const error = ref('')
const statusFilter = ref('')
const page = ref(1)
const totalPages = ref(1)
const modalOpen = ref(false)
const editingId = ref('')
const submitting = ref(false)
const formError = ref('')
const removingId = ref('')
const buildingOptions = ref<string[]>([])
const showMore = ref(false)

const detailOpen = ref(false)
const detailLoading = ref(false)
const detailError = ref('')
const detailData = ref<AnnouncementItem | null>(null)

const form = reactive({
  title: '',
  content: '',
  selectedTargetRoles: [USER_ROLE.RESIDENT] as string[],
  selectedBuildings: [] as string[],
  coverUrlsText: '',
  collectEnabled: false,
  collectFields: [] as AnnouncementCollectField[]
})

const displayNotices = computed(() => {
  if (!statusFilter.value) return notices.value
  return notices.value.filter((item) => item.status === statusFilter.value)
})

function formatBuildings(buildings?: string[]) {
  return buildings?.length ? buildings.join('、') : '全部楼栋'
}

function resetForm() {
  editingId.value = ''
  form.title = ''
  form.content = ''
  form.selectedTargetRoles = [USER_ROLE.RESIDENT]
  form.selectedBuildings = []
  form.coverUrlsText = ''
  form.collectEnabled = false
  form.collectFields = []
  showMore.value = false
  formError.value = ''
}

function applyDetailToForm(data: AnnouncementItem) {
  editingId.value = data.id
  form.title = data.title || ''
  form.content = data.content || ''
  form.selectedBuildings = data.targetBuildings ? [...data.targetBuildings] : []
  form.selectedTargetRoles = data.targetRoles?.length ? [...data.targetRoles] : []
  form.coverUrlsText = data.coverUrls?.join('\n') || ''
  form.collectEnabled = !!data.collectEnabled
  form.collectFields = data.collectFields?.length ? data.collectFields.map((f) => ({ ...f })) : []
  showMore.value = !!(form.coverUrlsText || form.collectEnabled)
}

watch(
  () => form.collectEnabled,
  (enabled) => {
    if (enabled && !form.collectFields.length) {
      form.collectFields = DEFAULT_COLLECT_FIELDS.map((field) => ({ ...field }))
    }
  }
)

function addCollectField() {
  form.collectFields.push({
    name: `field_${form.collectFields.length + 1}`,
    label: '',
    type: 'text'
  })
}

function removeCollectField(index: number) {
  form.collectFields.splice(index, 1)
}

function parseCoverUrls(text: string) {
  return text.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
}

function buildTargetBuildings() {
  if (!form.selectedBuildings.length) return undefined
  return [...form.selectedBuildings]
}

function buildTargetRoles() {
  if (!form.selectedTargetRoles.length) return undefined
  return [...form.selectedTargetRoles]
}

function buildCollectFields() {
  if (!form.collectEnabled) return undefined
  const fields = form.collectFields
    .map((field, index) => ({
      name: field.name.trim() || `field_${index + 1}`,
      label: field.label.trim() || `字段${index + 1}`,
      type: field.type || 'text'
    }))
    .filter((field) => field.label)
  return fields.length ? fields : undefined
}

function buildCreatePayload(status: string): AnnouncementCreatePayload {
  const payload: AnnouncementCreatePayload = {
    title: form.title.trim(),
    content: form.content.trim(),
    announcementType: ANNOUNCEMENT_TYPE.PLATFORM,
    status,
    communityId: DEFAULT_COMMUNITY_ID,
    collectEnabled: form.collectEnabled || undefined
  }
  const buildings = buildTargetBuildings()
  if (buildings?.length) payload.targetBuildings = buildings
  const targetRoles = buildTargetRoles()
  if (targetRoles?.length) payload.targetRoles = targetRoles
  const coverUrls = parseCoverUrls(form.coverUrlsText)
  if (coverUrls.length) payload.coverUrls = coverUrls
  const collectFields = buildCollectFields()
  if (collectFields?.length) payload.collectFields = collectFields
  if (auth.propertyCompanyId) payload.propertyCompanyId = auth.propertyCompanyId
  return payload
}

function buildUpdatePayload(status: string): AnnouncementUpdatePayload {
  return {
    title: form.title.trim(),
    content: form.content.trim(),
    announcementType: ANNOUNCEMENT_TYPE.PLATFORM,
    status,
    collectEnabled: form.collectEnabled,
    targetBuildings: buildTargetBuildings() ?? [],
    targetRoles: buildTargetRoles() ?? [],
    coverUrls: parseCoverUrls(form.coverUrlsText),
    collectFields: buildCollectFields() ?? []
  }
}

async function loadBuildingOptions() {
  try {
    const res = await residentApi.list({
      page: 1,
      pageSize: 100,
      propertyCompanyId: auth.propertyCompanyId || undefined
    })
    const set = new Set<string>()
    ;(res.list || []).forEach((item: ResidentItem) => {
      if (item.building) set.add(item.building)
    })
    buildingOptions.value = Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-CN'))
  } catch {
    buildingOptions.value = []
  }
}

async function load(pageNo = 1) {
  loading.value = true
  error.value = ''
  try {
    const res = await announcementApi.list({
      page: pageNo,
      pageSize: 20,
      announcementType: ANNOUNCEMENT_TYPE.PLATFORM,
      communityId: DEFAULT_COMMUNITY_ID,
      sort: '-publishedAt'
    })
    notices.value = res.list || []
    page.value = res.pagination?.page || pageNo
    totalPages.value = res.pagination?.totalPages || 1
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '公告列表加载失败'
  } finally {
    loading.value = false
  }
}

function changePage(next: number) {
  load(next)
}

function openCreate() {
  resetForm()
  modalOpen.value = true
}

async function openEdit(id: string) {
  formError.value = ''
  try {
    const data = await announcementApi.get(id)
    applyDetailToForm(data)
    modalOpen.value = true
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '公告详情加载失败'
  }
}

function openEditFromDetail() {
  if (!detailData.value) return
  closeDetail()
  applyDetailToForm(detailData.value)
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  submitting.value = false
}

async function openDetail(id: string) {
  detailOpen.value = true
  detailLoading.value = true
  detailError.value = ''
  detailData.value = null
  try {
    detailData.value = await announcementApi.get(id)
  } catch (e) {
    detailError.value = e instanceof ApiError ? e.message : '详情加载失败'
  } finally {
    detailLoading.value = false
  }
}

function closeDetail() {
  detailOpen.value = false
  detailData.value = null
}

async function submit(status: string) {
  if (!form.title.trim()) {
    formError.value = '请填写标题'
    return
  }
  if (!form.content.trim()) {
    formError.value = '请填写内容'
    return
  }
  submitting.value = true
  formError.value = ''
  try {
    if (editingId.value) {
      await announcementApi.update(editingId.value, buildUpdatePayload(status))
    } else {
      await announcementApi.create(buildCreatePayload(status))
    }
    closeModal()
    await load(page.value)
  } catch (e) {
    formError.value = e instanceof ApiError ? e.message : '发布失败，请确认是否有公告发布权限'
  } finally {
    submitting.value = false
  }
}

async function removeNotice(id: string) {
  if (!confirm('确认删除该公告？删除后将归档。')) return
  removingId.value = id
  try {
    await announcementApi.remove(id)
    await load(page.value)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '删除失败'
  } finally {
    removingId.value = ''
  }
}

onMounted(async () => {
  await loadBuildingOptions()
  await load(1)
})
</script>

<style scoped>
.page { max-width: 1200px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.toolbar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.input { padding: 8px 12px; border: 1px solid #e8e8ec; border-radius: 8px; background: #fff; font-size: 14px; box-sizing: border-box; }
.input.multi { width: 100%; padding: 4px; }
.btnPrimary { padding: 10px 18px; border-radius: 8px; background: #5c5c9e; color: #fff; border: none; cursor: pointer; font-size: 14px; }
.btnGhost { padding: 8px 14px; border-radius: 8px; border: 1px solid #e8e8ec; background: #fff; cursor: pointer; font-size: 14px; }
.panel { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table th, .table td { padding: 12px 10px; text-align: left; vertical-align: middle; }
.table th { color: #8c8c9a; font-weight: 500; border-bottom: 1px solid #f0f0f3; }
.table tbody tr { border-bottom: 1px solid #f0f0f3; }
.table tbody td { border-bottom: none; }
.cellTitle { font-weight: 500; color: #1f1f2e; }
.cellSub { font-size: 13px; color: #5c5c66; margin-top: 2px; }
.cellSub.muted { color: #8c8c9a; }
.statusTag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.statusTag.published { background: #e6f7ef; color: #389e6d; }
.statusTag.draft { background: #fff7e6; color: #d48806; }
.statusTag.archived { background: #f5f5f5; color: #8c8c9a; }
.actions { height: 1px; }
.actionsInner {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}
.linkBtn {
  padding: 0;
  border: none;
  background: none;
  color: #5c5c9e;
  font-size: 13px;
  line-height: 1.4;
  cursor: pointer;
  text-decoration: none;
  flex-shrink: 0;
}
.linkBtn.danger { color: #cf1322; }
.linkBtn:disabled { opacity: 0.5; cursor: not-allowed; }
.loading, .empty, .error { font-size: 14px; color: #8c8c9a; padding: 12px 0; }
.error { color: #e05c5c; }
.pager { display: flex; align-items: center; gap: 12px; margin-top: 16px; font-size: 14px; }
.modalOverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px; }
.modal { width: 520px; max-width: 100%; background: #fff; border-radius: 12px; overflow: hidden; max-height: 90vh; display: flex; flex-direction: column; }
.modalHeader { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f0f0f3; flex-shrink: 0; }
.modalTitle { font-size: 16px; font-weight: 600; margin: 0; }
.modalClose { border: none; background: none; font-size: 22px; cursor: pointer; color: #8c8c9a; line-height: 1; }
.modalBody { padding: 20px; overflow-y: auto; flex: 1; }
.modalFooter { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 20px; border-top: 1px solid #f0f0f3; flex-shrink: 0; }
.field { margin-bottom: 14px; }
.label { display: block; font-size: 13px; color: #8c8c9a; margin-bottom: 6px; }
.textarea { width: 100%; padding: 8px 12px; border: 1px solid #e8e8ec; border-radius: 8px; resize: vertical; box-sizing: border-box; font-family: inherit; font-size: 14px; }
.hint { font-size: 12px; color: #8c8c9a; margin: 6px 0 0; }
.toggleMore { width: 100%; padding: 10px 0; border: none; background: none; color: #5c5c9e; font-size: 13px; cursor: pointer; text-align: left; border-top: 1px solid #f0f0f3; margin-top: 4px; }
.moreBlock { padding-top: 12px; }
.inlineCheck { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #5c5c66; margin-bottom: 12px; cursor: pointer; }
.collectRow { display: grid; grid-template-columns: 1fr 100px auto; gap: 8px; align-items: center; margin-bottom: 8px; }
.typeSelect { min-width: 0; }
.metaList { margin: 0 0 16px; }
.metaItem { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f0f0f3; font-size: 14px; }
.metaItem dt { width: 72px; flex-shrink: 0; color: #8c8c9a; margin: 0; }
.metaItem dd { margin: 0; color: #1f1f2e; flex: 1; }
.contentBlock .label { font-size: 13px; color: #8c8c9a; margin-bottom: 8px; }
.contentBlock p { margin: 0; font-size: 14px; line-height: 1.7; white-space: pre-wrap; color: #1f1f2e; }
</style>
