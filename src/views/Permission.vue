<template>
  <AppLayout>
    <div class="page">
      <h1 class="title">权限配置</h1>
      <p class="desc">为物业工作人员和管理员配置访问权限。</p>
      <section class="rolePreset">
        <h3 class="title">角色快捷预设</h3>
        <div class="list">
          <button v-for="role in roleList" :key="role.code" class="btn" :class="{ active: activeRole.code === role.code }" @click="selectRole(role)">
            {{ role.name }}
          </button>
        </div>
      </section>
      <div class="main">
        <section class="accountList">
          <h3 class="title">账号列表</h3>
          <div class="items">
            <div v-for="account in accountList" :key="account.id" class="item" :class="{ active: activeAccount.id === account.id }" @click="selectAccount(account)">
              <div class="avatar">{{ account.initials }}</div>
              <div class="info">
                <div class="name">{{ account.name }}</div>
                <div class="role">{{ account.role }}</div>
              </div>
            </div>
          </div>
        </section>
        <section class="config">
          <div class="header">
            <h3 class="title">权限配置区</h3>
            <div class="search">
              <IconSvg name="search" class="searchIcon" />
              <input v-model="keyword" type="text" placeholder="搜索权限..." />
            </div>
          </div>
          <div class="body">
            <div v-for="group in filteredGroups" :key="group.category" class="group">
              <h4 class="groupTitle">{{ group.category }}</h4>
              <div class="items">
                <label v-for="item in group.items" :key="item.code" class="item">
                  <span class="checkbox">
                    <input type="checkbox" :checked="item.checked" @change="togglePermission(group.category, item.code)" />
                    <span class="checkmark"><IconSvg v-if="item.checked" name="check" /></span>
                  </span>
                  <span class="name">{{ item.name }}</span>
                </label>
              </div>
            </div>
          </div>
          <div class="footer">
            <button class="btnReset" @click="resetPermissions">重置为预设</button>
            <button class="btnSave" @click="savePermissions"><IconSvg name="save" /><span>保存权限</span></button>
          </div>
        </section>
      </div>
      <section class="log">
        <h3 class="title">权限变更日志</h3>
        <table class="table">
          <thead><tr><th>时间</th><th>操作人</th><th>目标账号</th><th>变更内容</th></tr></thead>
          <tbody>
            <tr v-for="(log, index) in logList" :key="index">
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
const { permissionList, logList, accountList, activeAccount, roleList, activeRole } = storeToRefs(store)
const { togglePermission, resetPermissions, savePermissions, selectRole, selectAccount, load } = store

onMounted(() => {
  load()
})

const keyword = ref('')
const filteredGroups = computed(() => {
  if (!keyword.value) return permissionList.value
  return permissionList.value
    .map(group => ({ category: group.category, items: group.items.filter(item => item.name.includes(keyword.value)) }))
    .filter(group => group.items.length)
})
</script>


<style scoped>
.page { max-width: 1200px; }
.page > .title { font-size: 24px; font-weight: 600; color: #1f1f2e; margin-bottom: 8px; }
.page > .desc { font-size: 14px; color: #8c8c9a; margin-bottom: 24px; }
.main { display: flex; gap: 24px; margin-bottom: 24px; align-items: stretch; }

.rolePreset { background: #ffffff; border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 24px; }
.rolePreset .title { font-size: 15px; font-weight: 500; color: #1f1f2e; margin-bottom: 16px; }
.rolePreset .list { display: flex; flex-wrap: wrap; gap: 12px; }
.rolePreset .btn { padding: 8px 16px; border-radius: 8px; border: 1px solid #e8e8ec; background: #ffffff; color: #5c5c66; font-size: 14px; transition: all 0.2s; }
.rolePreset .btn:hover { border-color: #5c5c9e; color: #5c5c9e; }
.rolePreset .btn.active { background: #5c5c9e; border-color: #5c5c9e; color: #ffffff; }
.rolePreset .btn.active:hover { background: #52529a; color: #ffffff; }

.accountList { background: #ffffff; border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); width: 260px; flex-shrink: 0; align-self: flex-start; }
.accountList .title { font-size: 15px; font-weight: 500; color: #1f1f2e; margin-bottom: 16px; }
.accountList .items { display: flex; flex-direction: column; gap: 8px; }
.accountList .item { display: flex; align-items: center; padding: 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.accountList .item:hover { background: #f4f5f7; }
.accountList .item.active { background: #5c5c9e; }
.accountList .item.active:hover { background: #5c5c9e; }
.accountList .avatar { width: 40px; height: 40px; border-radius: 50%; background: #f4f5f7; color: #5c5c66; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; margin-right: 12px; }
.accountList .item.active .avatar { background: rgba(255,255,255,0.2); color: #ffffff; }
.accountList .name { font-size: 14px; font-weight: 500; color: #1f1f2e; line-height: 20px; }
.accountList .item.active .name { color: #ffffff; }
.accountList .role { font-size: 12px; color: #8c8c9a; line-height: 18px; }
.accountList .item.active .role { color: rgba(255,255,255,0.8); }

.config { background: #ffffff; border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 420px; }
.config .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.config .title { font-size: 15px; font-weight: 500; color: #1f1f2e; margin-bottom: 0; }
.config .search { display: flex; align-items: center; width: 220px; height: 36px; border: 1px solid #e8e8ec; border-radius: 8px; padding: 0 12px; background: #ffffff; transition: border-color 0.2s; }
.config .search:focus-within { border-color: #5c5c9e; }
.config .searchIcon { width: 16px; height: 16px; color: #8c8c9a; margin-right: 8px; }
.config .search input { flex: 1; font-size: 14px; color: #1f1f2e; }
.config .search input::placeholder { color: #b0b0b9; }
.config .body { flex: 1; display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; min-height: 260px; }
.config .group { display: flex; flex-direction: column; gap: 12px; }
.config .group:last-child:nth-child(odd) { grid-column: 1 / -1; }
.config .groupTitle { font-size: 14px; font-weight: 500; color: #5c5c66; margin-bottom: 4px; }
.config .items { display: flex; flex-direction: column; gap: 10px; }
.config .item { display: flex; align-items: center; cursor: pointer; }
.config .checkbox { position: relative; width: 18px; height: 18px; margin-right: 10px; flex-shrink: 0; }
.config .checkbox input { position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; z-index: 1; }
.config .checkmark { position: absolute; inset: 0; border: 2px solid #d0d0d8; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #ffffff; transition: all 0.2s; }
.config .checkbox input:checked + .checkmark { background: #5c5c9e; border-color: #5c5c9e; }
.config .checkmark svg { width: 14px; height: 14px; }
.config .name { font-size: 14px; color: #1f1f2e; }
.config .footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f0f0f3; }
.config .btnReset { padding: 10px 20px; border-radius: 8px; border: 1px solid #e8e8ec; background: #ffffff; color: #5c5c66; font-size: 14px; transition: all 0.2s; }
.config .btnReset:hover { border-color: #5c5c9e; color: #5c5c9e; }
.config .btnSave { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 8px; background: #5c5c9e; color: #ffffff; font-size: 14px; transition: background 0.2s; }
.config .btnSave:hover { background: #52529a; }
.config .btnSave svg { width: 16px; height: 16px; }

.log { background: #ffffff; border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 24px; }
.log .title { font-size: 15px; font-weight: 500; color: #1f1f2e; margin-bottom: 16px; }
.log .table { font-size: 14px; width: 100%; }
.log .table thead th { text-align: left; padding: 12px 16px; color: #8c8c9a; font-weight: 500; background: #fafafc; border-bottom: 1px solid #f0f0f3; }
.log .table thead th:first-child { border-radius: 8px 0 0 8px; }
.log .table thead th:last-child { border-radius: 0 8px 8px 0; }
.log .table tbody td { padding: 16px; color: #1f1f2e; border-bottom: 1px solid #f0f0f3; }
.log .table tbody tr:last-child td { border-bottom: none; }
</style>
