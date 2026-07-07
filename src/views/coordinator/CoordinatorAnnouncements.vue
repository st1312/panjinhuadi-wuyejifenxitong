<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">统筹公告</h1>
        <p class="desc">发布平台级公告（platform_announcement）</p>
      </div>
      <button class="btnPrimary" @click="openCreate">发布公告</button>
    </div>

    <div class="panel">
      <div v-if="loading" class="loading">加载中...</div>
      <p v-else-if="error" class="error">{{ error }}</p>
      <table v-else-if="notices.length" class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>状态</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in notices" :key="item.id">
            <td>{{ item.title }}</td>
            <td>{{ getEnumLabel(ANNOUNCEMENT_STATUS_LABEL, item.status) }}</td>
            <td>{{ item.publishedAt || item.createdAt || '—' }}</td>
            <td>
              <button class="btnGhostSm" @click="openEdit(item.id)">编辑</button>
              <button
                class="btnDangerSm"
                :disabled="removingId === item.id"
                @click="removeNotice(item.id)"
              >
                删除
              </button>
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
              <input v-model="form.title" class="input" placeholder="公告标题" />
            </div>
            <div class="field">
              <label class="label">内容</label>
              <textarea v-model="form.content" class="textarea" rows="6" placeholder="公告正文" />
            </div>
          </div>
          <div class="modalFooter">
            <button class="btnGhost" @click="closeModal">取消</button>
            <button class="btnGhost" :disabled="submitting" @click="submit(ANNOUNCEMENT_STATUS.DRAFT)">
              存草稿
            </button>
            <button class="btnPrimary" :disabled="submitting" @click="submit(ANNOUNCEMENT_STATUS.PUBLISHED)">
              {{ submitting ? '提交中...' : '立即发布' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { announcementApi } from '../../api/services'
import type { AnnouncementItem } from '../../api/types'
import { ApiError } from '../../api/request'
import {
  ANNOUNCEMENT_STATUS,
  ANNOUNCEMENT_STATUS_LABEL,
  ANNOUNCEMENT_TYPE,
  getEnumLabel
} from '../../constants/enums'
import { useAuthStore } from '../../stores/auth'

const DEFAULT_COMMUNITY_ID = import.meta.env.VITE_COMMUNITY_ID || 'com_demo001'

const auth = useAuthStore()
const notices = ref<AnnouncementItem[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)
const modalOpen = ref(false)
const editingId = ref('')
const submitting = ref(false)
const formError = ref('')
const removingId = ref('')

const form = reactive({
  title: '',
  content: ''
})

async function load(pageNo = 1) {
  loading.value = true
  error.value = ''
  try {
    const res = await announcementApi.list({
      page: pageNo,
      pageSize: 20,
      announcementType: ANNOUNCEMENT_TYPE.PLATFORM,
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
  editingId.value = ''
  form.title = ''
  form.content = ''
  formError.value = ''
  modalOpen.value = true
}

async function openEdit(id: string) {
  formError.value = ''
  try {
    const data = await announcementApi.get(id)
    editingId.value = id
    form.title = data.title || ''
    form.content = data.content || ''
    modalOpen.value = true
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : '公告详情加载失败'
  }
}

function closeModal() {
  modalOpen.value = false
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
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      announcementType: ANNOUNCEMENT_TYPE.PLATFORM,
      status,
      communityId: DEFAULT_COMMUNITY_ID,
      propertyCompanyId: auth.propertyCompanyId || undefined
    }
    if (editingId.value) {
      await announcementApi.update(editingId.value, payload)
    } else {
      await announcementApi.create(payload)
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
  if (!confirm('确认删除该公告？')) return
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

onMounted(() => load(1))
</script>

<style scoped>
.page { max-width: 1200px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.btnPrimary { padding: 10px 18px; border-radius: 8px; background: #5c5c9e; color: #fff; border: none; cursor: pointer; }
.panel { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table th, .table td { padding: 12px 10px; border-bottom: 1px solid #f0f0f3; text-align: left; }
.table th { color: #8c8c9a; font-weight: 500; }
.btnGhostSm, .btnDangerSm { padding: 6px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; margin-right: 6px; }
.btnGhostSm { border: 1px solid #e8e8ec; background: #fff; }
.btnDangerSm { border: 1px solid #ffa39e; background: #fff1f0; color: #cf1322; }
.loading, .empty, .error { font-size: 14px; color: #8c8c9a; padding: 12px 0; }
.error { color: #e05c5c; }
.pager { display: flex; align-items: center; gap: 12px; margin-top: 16px; font-size: 14px; }
.btnGhost { padding: 8px 14px; border-radius: 8px; border: 1px solid #e8e8ec; background: #fff; cursor: pointer; }
.modalOverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { width: 520px; max-width: calc(100vw - 32px); background: #fff; border-radius: 12px; overflow: hidden; }
.modalHeader { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f0f0f3; }
.modalTitle { font-size: 16px; font-weight: 600; }
.modalClose { border: none; background: none; font-size: 22px; cursor: pointer; color: #8c8c9a; }
.modalBody { padding: 20px; }
.modalFooter { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 20px; border-top: 1px solid #f0f0f3; }
.field { margin-bottom: 14px; }
.label { display: block; font-size: 13px; color: #8c8c9a; margin-bottom: 6px; }
.input { width: 100%; padding: 8px 12px; border: 1px solid #e8e8ec; border-radius: 8px; box-sizing: border-box; }
.textarea { width: 100%; padding: 8px 12px; border: 1px solid #e8e8ec; border-radius: 8px; resize: vertical; box-sizing: border-box; }
</style>
