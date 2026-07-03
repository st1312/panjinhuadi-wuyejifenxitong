import { defineStore } from 'pinia'
import { ref } from 'vue'
import { permissionApi } from '../api/services'
import { mapPermissionLogs, normalizePermissionGroups, normalizeRolePresets } from '../api/mappers'

export interface Role {
  code: string
  name: string
}

export interface Account {
  id: string
  name: string
  initials: string
  role: string
}

export interface PermissionItem {
  code: string
  name: string
  checked: boolean
}

export interface PermissionCategory {
  category: string
  items: PermissionItem[]
}

export interface Log {
  time: string
  operator: string
  target: string
  content: string
}

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || '?'
}

export const usePermissionStore = defineStore('permission', () => {
  const roleList = ref<Role[]>([])
  const accountList = ref<Account[]>([])
  const permissionList = ref<PermissionCategory[]>([])
  const logList = ref<Log[]>([])
  const activeAccount = ref<Account>({ id: '', name: '', initials: '', role: '' })
  const activeRole = ref<Role>({ code: '', name: '' })
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      const [permissions, roles, coordinators, sectors, individuals, logs] = await Promise.all([
        permissionApi.permissions(),
        permissionApi.rolePresets(),
        permissionApi.coordinators(),
        permissionApi.sectorLeaders(),
        permissionApi.individualLeaders(),
        permissionApi.changeLogs()
      ])

      roleList.value = normalizeRolePresets(roles)
      permissionList.value = normalizePermissionGroups(permissions)

      const leaders = [
        ...(coordinators.list || []),
        ...(sectors.list || []),
        ...(individuals.list || [])
      ]

      accountList.value = leaders.map(item => ({
        id: item.id,
        name: item.name,
        initials: initials(item.name),
        role: item.roleName || item.role || item.sector || '负责人'
      }))

      if (!accountList.value.length && roleList.value.length) {
        accountList.value = roleList.value.map(role => ({
          id: role.code,
          name: role.name,
          initials: initials(role.name),
          role: role.name
        }))
      }

      logList.value = mapPermissionLogs(logs.list || [])

      if (accountList.value.length) {
        selectAccount(accountList.value[0])
      } else if (roleList.value.length) {
        activeRole.value = roleList.value[0]
      }
    } finally {
      loading.value = false
    }
  }

  async function selectAccount(account: Account) {
    activeAccount.value = account
    const target = roleList.value.find(item => item.name === account.role)
    if (target) activeRole.value = target
    try {
      const data = await permissionApi.userPermissions(account.id)
      const groups = normalizePermissionGroups(
        Array.isArray(data) ? data : data.permissions || []
      )
      if (groups.length) permissionList.value = groups
    } catch {
      // 保留当前权限列表
    }
  }

  function selectRole(role: Role) {
    activeRole.value = role
  }

  function togglePermission(category: string, code: string) {
    const group = permissionList.value.find(item => item.category === category)
    if (!group) return
    const item = group.items.find(item => item.code === code)
    if (item) item.checked = !item.checked
  }

  async function resetPermissions() {
    if (!activeAccount.value.id) return
    await selectAccount(activeAccount.value)
  }

  async function savePermissions() {
    if (!activeAccount.value.id) return
    const permissionIds = permissionList.value
      .flatMap(group => group.items)
      .filter(item => item.checked)
      .map(item => item.code)
    await permissionApi.grantPermissions(activeAccount.value.id, permissionIds)
    const logs = await permissionApi.changeLogs()
    logList.value = mapPermissionLogs(logs.list || [])
  }

  return {
    roleList,
    accountList,
    permissionList,
    logList,
    activeAccount,
    activeRole,
    loading,
    load,
    selectAccount,
    selectRole,
    togglePermission,
    resetPermissions,
    savePermissions
  }
})
