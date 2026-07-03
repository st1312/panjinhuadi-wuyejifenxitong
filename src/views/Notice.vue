<template>
  <AppLayout>
    <div class="page">
      <div class="header">
        <div>
          <h1 class="title">通告发布</h1>
          <p class="desc">发布新的物业通告或查看历史发布记录</p>
        </div>
        <div class="actions">
          <button class="btnSecondary">存为草稿</button>
          <button class="btnPrimary"><IconSvg name="play" /><span>立即发布</span></button>
        </div>
      </div>
      <div class="grid">
        <div class="card">
          <div class="header">
            <IconSvg name="edit" class="icon" />
            <span>内容编辑</span>
          </div>
          <div class="form">
            <div class="field">
              <label class="label">发布身份</label>
              <div class="select">
                <span>物业管理处</span>
                <IconSvg name="chevronDown" />
              </div>
            </div>
            <div class="field">
              <label class="label">通告标题</label>
              <input type="text" class="input" placeholder="输入简洁明了的通告标题" />
            </div>
            <div class="field">
              <label class="label">详细内容</label>
              <div class="editor">
                <div class="toolbar">
                  <button class="btn active">B</button>
                  <button class="btn">I</button>
                  <button class="btn">☰</button>
                  <button class="btn">▢</button>
                  <button class="btn">🔗</button>
                </div>
                <textarea class="content" placeholder="在此输入通告正文..."></textarea>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="header">
            <IconSvg name="target" class="icon" />
            <span>定向推送设置</span>
          </div>
          <div class="form">
            <div class="field">
              <label class="label">覆盖楼栋</label>
              <div class="checkboxGroup">
                <label class="checkbox">
                  <input type="checkbox" checked />
                  <span class="checkmark"><IconSvg name="check" /></span>
                  <span>全部</span>
                </label>
                <label v-for="b in ['A栋','B栋','C栋','D栋','商铺']" :key="b" class="checkbox">
                  <input type="checkbox" />
                  <span class="checkmark"></span>
                  <span>{{ b }}</span>
                </label>
              </div>
            </div>
            <div class="field">
              <div class="rangeHeader">
                <label class="label">目标年龄段</label>
                <span class="value">18 - 65 岁</span>
              </div>
              <div class="slider">
                <div class="track"></div>
                <div class="thumb" style="left: 0%"></div>
                <div class="thumb" style="left: 100%"></div>
              </div>
              <div class="inputs">
                <input type="number" class="input" value="18" />
                <span>至</span>
                <input type="number" class="input" value="65" />
              </div>
            </div>
            <div class="field">
              <label class="label">目标性别</label>
              <div class="genderGroup">
                <button class="btn active">不限</button>
                <button class="btn">男</button>
                <button class="btn">女</button>
              </div>
            </div>
            <div class="infoBox">
              <IconSvg name="info" />
              <span>基于当前设置，通告预计将覆盖 <strong>1,248</strong> 名住户。建议在大数据高峰时段发布以获得更高点击率。</span>
            </div>
          </div>
        </div>
      </div>
      <div class="history">
        <div class="head">
          <div class="header">
            <IconSvg name="history" class="icon" />
            <span>已发布列表</span>
          </div>
          <div class="search">
            <IconSvg name="search" />
            <input type="text" placeholder="搜索通告标题..." />
          </div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>发布时间</th>
              <th>标题</th>
              <th>覆盖范围</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" style="text-align:center;padding:24px;color:#8c8c9a">加载中...</td>
            </tr>
            <template v-else>
            <tr v-for="notice in notices" :key="notice.id">
              <td>{{ notice.publishTime }}</td>
              <td>
                <div class="cellTitle">{{ notice.title }}</div>
                <div class="cellPublisher">发布人：{{ notice.publisher }}</div>
              </td>
              <td>
                <div class="scope">
                  <span v-for="(item, index) in notice.scope" :key="index" class="tag">{{ item }}</span>
                </div>
              </td>
              <td>
                <span class="status" :class="notice.status === 'published' ? 'published' : 'withdrawn'">
                  {{ notice.status === 'published' ? '已发布' : '已撤回' }}
                </span>
              </td>
              <td><button class="detail">查看详情</button></td>
            </tr>
            </template>
          </tbody>
        </table>
        <div class="footer">
          <span class="total">显示第 1 至 {{ notices.length }} 条，共 {{ noticesTotal }} 条记录</span>
          <div class="pagination">
            <button class="pageBtn" disabled>&lt;</button>
            <button class="pageBtn active">1</button>
            <button class="pageBtn">2</button>
            <button class="pageBtn">3</button>
            <button class="pageBtn">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import IconSvg from '../components/IconSvg.vue'
import { announcementApi } from '../api/services'
import { mapAnnouncements } from '../api/mappers'

const loading = ref(true)
const notices = ref<ReturnType<typeof mapAnnouncements>>([])
const noticesTotal = ref(0)

onMounted(async () => {
  try {
    const res = await announcementApi.list({ page: 1, pageSize: 20 })
    notices.value = mapAnnouncements(res.list || [])
    noticesTotal.value = res.pagination?.total ?? notices.value.length
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page { max-width: 1200px; }
.header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.desc { font-size: 14px; color: #8c8c9a; }
.actions { display: flex; gap: 12px; }
.btnSecondary { padding: 10px 18px; border-radius: 8px; border: 1px solid #e8e8ec; background: #ffffff; color: #5c5c66; font-size: 14px; }
.btnSecondary:hover { border-color: #5c5c9e; color: #5c5c9e; }
.btnPrimary { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 8px; background: #5c5c9e; color: #ffffff; font-size: 14px; }
.btnPrimary svg { width: 16px; height: 16px; }
.grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-bottom: 20px; }

.card { background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.card .header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 500; color: #5c5c9e; margin-bottom: 20px; }
.card .icon { width: 20px; height: 20px; }
.card .field { margin-bottom: 20px; }
.card .field:last-child { margin-bottom: 0; }
.card .label { display: block; font-size: 14px; color: #5c5c66; margin-bottom: 10px; }
.card .select { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border: 1px solid #e8e8ec; border-radius: 8px; background: #fafafc; color: #1f1f2e; font-size: 14px; cursor: pointer; }
.card .select svg { width: 16px; height: 16px; color: #8c8c9a; }
.card .input { width: 100%; padding: 10px 14px; border: 1px solid #e8e8ec; border-radius: 8px; background: #fafafc; font-size: 14px; color: #1f1f2e; outline: none; }
.card .input::placeholder { color: #8c8c9a; }
.card .editor { border: 1px solid #e8e8ec; border-radius: 8px; overflow: hidden; }
.card .toolbar { display: flex; gap: 8px; padding: 8px 12px; background: #f0f0ff; border-bottom: 1px solid #e8e8ec; }
.card .toolbar .btn { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 14px; font-weight: 600; color: #5c5c66; border: none; background: transparent; }
.card .toolbar .btn.active { background: #ffffff; color: #5c5c9e; }
.card .content { width: 100%; height: 160px; padding: 14px; border: none; background: #fafafc; font-size: 14px; color: #1f1f2e; resize: vertical; outline: none; }
.card .content::placeholder { color: #8c8c9a; }
.card .checkboxGroup { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.card .checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #5c5c66; }
.card .checkbox input { position: absolute; opacity: 0; width: 0; height: 0; }
.card .checkmark { width: 18px; height: 18px; border-radius: 4px; border: 2px solid #d0d0d8; display: flex; align-items: center; justify-content: center; color: #ffffff; flex-shrink: 0; }
.card .checkbox input:checked + .checkmark { background: #5c5c9e; border-color: #5c5c9e; }
.card .checkmark svg { width: 14px; height: 14px; }
.card .rangeHeader { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.card .rangeHeader .label { margin-bottom: 0; }
.card .value { font-size: 13px; color: #5c5c9e; font-weight: 500; }
.card .slider { position: relative; height: 6px; background: #e8e8ec; border-radius: 3px; margin-bottom: 12px; }
.card .track { position: absolute; top: 0; left: 0; right: 0; height: 100%; background: #5c5c9e; border-radius: 3px; }
.card .thumb { position: absolute; top: 50%; width: 16px; height: 16px; border-radius: 50%; background: #5c5c9e; transform: translate(-50%, -50%); border: 2px solid #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.card .inputs { display: flex; align-items: center; gap: 12px; }
.card .inputs input { width: 60px; text-align: center; }
.card .inputs span { color: #8c8c9a; font-size: 14px; }
.card .genderGroup { display: flex; border: 1px solid #e8e8ec; border-radius: 8px; overflow: hidden; }
.card .genderGroup .btn { flex: 1; padding: 8px 16px; font-size: 14px; color: #5c5c66; border: none; background: #ffffff; }
.card .genderGroup .btn.active { background: #5c5c9e; color: #ffffff; }
.card .infoBox { display: flex; align-items: flex-start; gap: 10px; padding: 14px; background: #fff8e8; border-radius: 10px; font-size: 13px; color: #8c6a3a; line-height: 1.5; }
.card .infoBox svg { width: 18px; height: 18px; flex-shrink: 0; color: #f5a623; }

.history { background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.history .head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.history .header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 500; color: #5c5c9e; margin-bottom: 0; }
.history .icon { width: 20px; height: 20px; }
.history .search { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid #e8e8ec; border-radius: 8px; background: #fafafc; min-width: 220px; }
.history .search svg { width: 16px; height: 16px; color: #8c8c9a; }
.history .search input { border: none; background: transparent; font-size: 14px; color: #1f1f2e; outline: none; flex: 1; }
.history .search input::placeholder { color: #8c8c9a; }
.history .table { width: 100%; font-size: 14px; }
.history .table thead th { text-align: left; padding: 14px 24px; color: #8c8c9a; font-weight: 500; background: #fafafc; border-bottom: 1px solid #f0f0f3; }
.history .table tbody td { padding: 16px 24px; color: #1f1f2e; border-bottom: 1px solid #f0f0f3; vertical-align: middle; }
.history .table tbody tr:last-child td { border-bottom: none; }
.history .cellTitle { font-weight: 500; color: #1f1f2e; margin-bottom: 4px; }
.history .cellPublisher { font-size: 12px; color: #8c8c9a; }
.history .scope { display: flex; flex-wrap: wrap; gap: 6px; }
.history .tag { display: inline-block; padding: 3px 8px; border-radius: 10px; background: #e8f8f0; color: #3aaf7d; font-size: 12px; }
.history .status { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; }
.history .status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
.history .status.published { color: #3aaf7d; }
.history .status.published::before { background: #3aaf7d; }
.history .status.withdrawn { color: #8c8c9a; }
.history .status.withdrawn::before { background: #c8c8d0; }
.history .detail { font-size: 14px; color: #5c5c9e; }
.history .footer { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; border-top: 1px solid #f0f0f3; margin: 0 -24px -24px; }
.history .total { font-size: 13px; color: #8c8c9a; }
.history .pagination { display: flex; gap: 8px; }
.history .pageBtn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px solid #e8e8ec; background: #ffffff; color: #5c5c66; font-size: 14px; }
.history .pageBtn:disabled { color: #c8c8d0; cursor: not-allowed; }
.history .pageBtn.active { background: #5c5c9e; color: #ffffff; border-color: #5c5c9e; }

@media (max-width: 900px) {
  .header { flex-direction: column; gap: 16px; }
  .grid { grid-template-columns: 1fr; }
  .history .head { flex-direction: column; align-items: flex-start; gap: 12px; }
  .history .table { display: block; overflow-x: auto; }
}
</style>
