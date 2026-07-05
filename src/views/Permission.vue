<template>
  <AppLayout>
    <div class="page">
      <h1 class="title">权限配置</h1>
      <p class="desc">基于共享权限池为账号分配权限，可通过角色快捷预设一键配置后再微调。</p>

      <section class="rolePreset">
        <div class="sectionHead">
          <h3 class="sectionTitle">角色快捷预设</h3>
          <p class="sectionHint">选择账号后点击预设，一键勾选对应权限组合，保存后立即生效</p>
        </div>
        <div class="list">
          <button
            v-for="preset in roleList"
            :key="preset.id"
            class="btn"
            :class="{ active: activePresetId === preset.id }"
            @click="applyPreset(preset)"
          >
            {{ preset.name }}
          </button>
        </div>
      </section>

      <div v-if="loading && !accountList.length" class="loadingBlock">加载中...</div>
      <p v-else-if="error" class="error">{{ error }}</p>

      <div v-else class="main">
        <section class="accountList">
          <h3 class="sectionTitle">账号列表</h3>
          <div class="accountSearch">
            <IconSvg name="search" class="searchIcon" />
            <input
              v-model="accountKeyword"
              type="search"
              placeholder="搜索姓名/手机号..."
              @keydown.enter="searchAccounts(accountKeyword)"
              @input="onAccountSearchInput"
            />
          </div>
          <div v-if="!accountList.length" class="emptyHint">暂无账号</div>
          <div v-else class="items">
            <div
              v-for="account in accountList"
              :key="account.id"
              class="item"
              :class="{ active: activeAccount?.id === account.id }"
              @click="selectAccount(account)"
            >
              <div class="avatar">{{ account.initials }}</div>
              <div class="info">
                <div class="name">{{ account.name }}</div>
                <div class="role">{{ account.role }}</div>
                <div class="meta">{{ account.phone }} · {{ account.permissionCount }} 项权限</div>
              </div>
            </div>
          </div>
        </section>

        <section class="config">
          <div class="header">
            <div>
              <h3 class="sectionTitle">权限配置区</h3>
              <p v-if="activeAccount" class="configHint">
                当前账号：{{ activeAccount.name }}
                <span v-if="activePresetName"> · 预设：{{ activePresetName }}</span>
              </p>
              <p v-else class="configHint">请先从左侧选择账号</p>
            </div>
            <div class="search">
              <IconSvg name="search" class="searchIcon" />
              <input v-model="keyword" type="search" placeholder="搜索权限..." />
            </div>
          </div>

          <div v-if="!activeAccount" class="emptyConfig">选择账号后可配置权限</div>
          <div v-else class="body">
            <div v-for="group in filteredGroups" :key="group.category" class="group">
              <h4 class="groupTitle">{{ group.category }}</h4>
              <div class="items">
                <label v-for="item in group.items" :key="item.code" class="permItem">
                  <span class="checkbox">
                    <input
                      type="checkbox"
                      :checked="item.checked"
                      @change="togglePermission(group.category, item.code)"
                    />
                    <span class="checkmark"><IconSvg v-if="item.checked" name="check" /></span>
                  </span>
                  <span class="permText">
                    <span class="name">{{ item.name }}</span>
                    <span v-if="item.description" class="desc">{{ item.description }}</span>
                    <span class="code">{{ item.code }}</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <p v-if="saveMessage" class="success">{{ saveMessage }}</p>
          <div class="footer">
            <button class="btnReset" :disabled="!activeAccount || saving" @click="resetPermissions">
              恢复当前生效
            </button>
            <button class="btnSave" :disabled="!activeAccount || saving" @click="savePermissions">
              <IconSvg name="save" />
              <span>{{ saving ? '保存中...' : '保存权限' }}</span>
            </button>
          </div>
        </section>
      </div>

      <section class="log">
        <h3 class="sectionTitle">权限变更日志</h3>
        <table class="table">
          <thead>
            <tr>
              <th>时间</th>
              <th>操作人</th>
              <th>目标账号</th>
              <th>变更内容</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!logList.length">
              <td colspan="4" class="emptyCell">暂无变更记录</td>
            </tr>
            <tr v-for="log in logList" :key="log.id">
              <td>{{ log.time }}</td>
              <td>{{ log.operator }}</td>
              <td>{{ log.target }}</td>
              <td>{{ log.content }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePermissionStore } from '../stores/permission'
import AppLayout from '../layouts/AppLayout.vue'
import IconSvg from '../components/IconSvg.vue'

const store = usePermissionStore()
const {
  permissionList,
  logList,
  accountList,
  activeAccount,
  roleList,
  activePresetId,
  activePresetName,
  loading,
  saving,
  error,
  saveMessage
} = storeToRefs(store)
const {
  togglePermission,
  resetPermissions,
  savePermissions,
  applyPreset,
  selectAccount,
  searchAccounts,
  load
} = store

const keyword = ref('')
const accountKeyword = ref('')
let accountSearchTimer: ReturnType<typeof setTimeout>

const filteredGroups = computed(() => {
  if (!keyword.value.trim()) return permissionList.value
  const q = keyword.value.trim().toLowerCase()
  return permissionList.value
    .map(group => ({
      category: group.category,
      items: group.items.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      )
    }))
    .filter(group => group.items.length)
})

function onAccountSearchInput() {
  clearTimeout(accountSearchTimer)
  accountSearchTimer = setTimeout(() => searchAccounts(accountKeyword.value.trim()), 300)
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.page { max-width: 1200px; }
.page > .title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.page > .desc { font-size: 14px; color: #8c8c9a; margin-bottom: 24px; }
.main { display: flex; gap: 24px; margin-bottom: 24px; align-items: stretch; }
.loadingBlock, .emptyHint, .emptyConfig, .emptyCell { text-align: center; color: #8c8c9a; padding: 24px; font-size: 14px; }
.error { color: #e05c5c; font-size: 14px; margin-bottom: 16px; }
.success { color: #3aaf7d; font-size: 13px; margin-bottom: 12px; }

.sectionTitle { font-size: 15px; font-weight: 500; color: #1f1f2e; margin-bottom: 0; }
.sectionHint, .configHint { font-size: 12px; color: #8c8c9a; margin-top: 6px; }

.rolePreset { background: #ffffff; border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 24px; }
.sectionHead { margin-bottom: 16px; }
.rolePreset .list { display: flex; flex-wrap: wrap; gap: 12px; }
.rolePreset .btn { padding: 8px 16px; border-radius: 8px; border: 1px solid #e8e8ec; background: #ffffff; color: #5c5c66; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.rolePreset .btn:hover { border-color: #5c5c9e; color: #5c5c9e; }
.rolePreset .btn.active { background: #5c5c9e; border-color: #5c5c9e; color: #ffffff; }

.accountList { background: #ffffff; border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); width: 280px; flex-shrink: 0; align-self: flex-start; }
.accountList .sectionTitle { margin-bottom: 12px; }
.accountSearch { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid #e8e8ec; border-radius: 8px; background: #fafafc; margin-bottom: 12px; }
.accountSearch .searchIcon { width: 16px; height: 16px; color: #8c8c9a; }
.accountSearch input { flex: 1; border: none; background: transparent; font-size: 13px; outline: none; }
.accountList .items { display: flex; flex-direction: column; gap: 8px; max-height: 520px; overflow-y: auto; }
.accountList .item { display: flex; align-items: center; padding: 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.accountList .item:hover { background: #f4f5f7; }
.accountList .item.active { background: #5c5c9e; }
.accountList .avatar { width: 40px; height: 40px; border-radius: 50%; background: #f4f5f7; color: #5c5c66; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; margin-right: 12px; flex-shrink: 0; }
.accountList .item.active .avatar { background: rgba(255,255,255,0.2); color: #ffffff; }
.accountList .name { font-size: 14px; font-weight: 500; color: #1f1f2e; line-height: 20px; }
.accountList .item.active .name { color: #ffffff; }
.accountList .role { font-size: 12px; color: #8c8c9a; line-height: 18px; }
.accountList .item.active .role { color: rgba(255,255,255,0.85); }
.accountList .meta { font-size: 11px; color: #b0b0b9; margin-top: 2px; }
.accountList .item.active .meta { color: rgba(255,255,255,0.7); }

.config { background: #ffffff; border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 420px; }
.config .header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.config .search { display: flex; align-items: center; width: 220px; height: 36px; border: 1px solid #e8e8ec; border-radius: 8px; padding: 0 12px; background: #ffffff; flex-shrink: 0; }
.config .search:focus-within { border-color: #5c5c9e; }
.config .searchIcon { width: 16px; height: 16px; color: #8c8c9a; margin-right: 8px; }
.config .search input { flex: 1; font-size: 14px; color: #1f1f2e; border: none; outline: none; background: transparent; }
.config .body { flex: 1; display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; min-height: 260px; overflow-y: auto; }
.config .group { display: flex; flex-direction: column; gap: 12px; }
.config .groupTitle { font-size: 14px; font-weight: 500; color: #5c5c66; margin-bottom: 4px; }
.config .items { display: flex; flex-direction: column; gap: 10px; }
.permItem { display: flex; align-items: flex-start; cursor: pointer; }
.checkbox { position: relative; width: 18px; height: 18px; margin-right: 10px; margin-top: 2px; flex-shrink: 0; }
.checkbox input { position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; z-index: 1; }
.checkmark { position: absolute; inset: 0; border: 2px solid #d0d0d8; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #ffffff; transition: all 0.2s; }
.checkbox input:checked + .checkmark { background: #5c5c9e; border-color: #5c5c9e; }
.checkmark svg { width: 14px; height: 14px; }
.permText { display: flex; flex-direction: column; gap: 2px; }
.permText .name { font-size: 14px; color: #1f1f2e; }
.permText .desc { font-size: 12px; color: #8c8c9a; }
.permText .code { font-size: 11px; color: #b0b0b9; font-family: monospace; }
.config .footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f0f0f3; }
.btnReset { padding: 10px 20px; border-radius: 8px; border: 1px solid #e8e8ec; background: #ffffff; color: #5c5c66; font-size: 14px; cursor: pointer; }
.btnReset:disabled { opacity: 0.5; cursor: not-allowed; }
.btnSave { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 8px; background: #5c5c9e; color: #ffffff; font-size: 14px; border: none; cursor: pointer; }
.btnSave:disabled { opacity: 0.6; cursor: not-allowed; }
.btnSave svg { width: 16px; height: 16px; }

.log { background: #ffffff; border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 24px; }
.log .sectionTitle { margin-bottom: 16px; }
.log .table { font-size: 14px; width: 100%; }
.log .table thead th { text-align: left; padding: 12px 16px; color: #8c8c9a; font-weight: 500; background: #fafafc; border-bottom: 1px solid #f0f0f3; }
.log .table tbody td { padding: 16px; color: #1f1f2e; border-bottom: 1px solid #f0f0f3; vertical-align: top; }
.log .table tbody tr:last-child td { border-bottom: none; }

@media (max-width: 900px) {
  .main { flex-direction: column; }
  .accountList { width: 100%; }
  .config .body { grid-template-columns: 1fr; }
  .config .header { flex-direction: column; }
  .config .search { width: 100%; }
}
</style>
