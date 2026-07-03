import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '../api/services'
import { configureRequest } from '../api/request'
import type { UserProfile } from '../api/types'

const AUTH_KEY = 'wuyejifen_auth'
const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'
const PROFILE_KEY = 'userProfile'
const COMPANY_KEY = 'propertyCompanyId'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem(ACCESS_KEY) || '')
  const refreshToken = ref(localStorage.getItem(REFRESH_KEY) || '')
  const profile = ref<UserProfile | null>(readProfile())
  const propertyCompanyId = ref(readCompanyId())

  const isLoggedIn = ref(!!localStorage.getItem(AUTH_KEY) && !!accessToken.value)
  const username = ref(profile.value?.name || localStorage.getItem('wuyejifen_user') || '')

  configureRequest({
    getTokens: () => ({
      accessToken: accessToken.value || localStorage.getItem(ACCESS_KEY) || '',
      refreshToken: refreshToken.value || localStorage.getItem(REFRESH_KEY) || ''
    }),
    getPropertyCompanyId: () => propertyCompanyId.value || readCompanyId(),
    refreshTokens: async () => {
      const token = refreshToken.value || localStorage.getItem(REFRESH_KEY) || ''
      if (!token) return false
      try {
        const data = await authApi.refreshToken(token)
        setSession(data.accessToken, data.refreshToken, profile.value, propertyCompanyId.value, true)
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
    accessToken.value = access
    refreshToken.value = refresh
    profile.value = user
    propertyCompanyId.value = companyId
    username.value = user?.name || username.value

    if (remember) {
      localStorage.setItem(AUTH_KEY, '1')
      localStorage.setItem(ACCESS_KEY, access)
      localStorage.setItem(REFRESH_KEY, refresh)
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
    accessToken.value = ''
    refreshToken.value = ''
    profile.value = null
    isLoggedIn.value = false
    username.value = ''
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(PROFILE_KEY)
    localStorage.removeItem('wuyejifen_user')
  }

  return {
    isLoggedIn,
    username,
    accessToken,
    refreshToken,
    profile,
    propertyCompanyId,
    login,
    logout
  }
})
