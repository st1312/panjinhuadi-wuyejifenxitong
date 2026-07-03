import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '../api/services'
import { configureRequest } from '../api/request'
import type { UserProfile } from '../api/types'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  hasValidSession,
  setTokens
} from './tokenStore'

const AUTH_KEY = 'wuyejifen_auth'
const PROFILE_KEY = 'userProfile'
const COMPANY_KEY = 'propertyCompanyId'

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<UserProfile | null>(readProfile())
  const propertyCompanyId = ref(readCompanyId())
  const isLoggedIn = ref(!!localStorage.getItem(AUTH_KEY) && hasValidSession())
  const username = ref(profile.value?.name || localStorage.getItem('wuyejifen_user') || '')

  configureRequest({
    getTokens: () => ({
      accessToken: getAccessToken(),
      refreshToken: getRefreshToken()
    }),
    getPropertyCompanyId: () => propertyCompanyId.value || readCompanyId(),
    refreshTokens: async () => {
      const token = getRefreshToken()
      if (!token) return false
      try {
        const data = await authApi.refreshToken(token)
        setTokens(data.accessToken, data.refreshToken, true)
        return true
      } catch {
        return false
      }
    },
    onUnauthorized: () => {
      logout()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    },
    onForbidden: () => {
      // 403 仅提示，不跳转登录
    }
  })

  function readProfile(): UserProfile | null {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as UserProfile
    } catch {
      return null
    }
  }

  function readCompanyId() {
    const stored = localStorage.getItem(COMPANY_KEY)
    if (stored) return stored
    return readProfile()?.propertyCompanyId || import.meta.env.VITE_PROPERTY_COMPANY_ID || ''
  }

  function setSession(
    access: string,
    refresh: string,
    user: UserProfile | null,
    companyId: string,
    remember: boolean
  ) {
    setTokens(access, refresh, remember)
    profile.value = user
    propertyCompanyId.value = companyId
    username.value = user?.name || username.value

    if (remember) {
      localStorage.setItem(AUTH_KEY, '1')
      localStorage.setItem(COMPANY_KEY, companyId)
      if (user) localStorage.setItem(PROFILE_KEY, JSON.stringify(user))
      if (user?.name) localStorage.setItem('wuyejifen_user', user.name)
    }
    isLoggedIn.value = true
  }

  async function login(phone: string, password: string, remember = true) {
    const data = await authApi.adminLogin(phone, password)
    const user = data.resident || null
    setSession(
      data.accessToken,
      data.refreshToken,
      user,
      user?.propertyCompanyId || propertyCompanyId.value,
      remember
    )
    try {
      profile.value = await authApi.profile()
      username.value = profile.value.name
      if (profile.value.propertyCompanyId) {
        propertyCompanyId.value = profile.value.propertyCompanyId
        localStorage.setItem(COMPANY_KEY, profile.value.propertyCompanyId)
      }
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile.value))
    } catch {
      // profile 获取失败不影响登录
    }
    return true
  }

  function logout() {
    clearTokens()
    profile.value = null
    isLoggedIn.value = false
    username.value = ''
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(PROFILE_KEY)
    localStorage.removeItem('wuyejifen_user')
  }

  return {
    isLoggedIn,
    username,
    accessToken: getAccessToken,
    refreshToken: getRefreshToken,
    profile,
    propertyCompanyId,
    login,
    logout
  }
})
