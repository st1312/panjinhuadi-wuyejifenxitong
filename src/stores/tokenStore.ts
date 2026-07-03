/** Access / Refresh Token 内存存储（规范：不写入 localStorage） */

const SESSION_ACCESS_KEY = 'accessToken'
const SESSION_REFRESH_KEY = 'refreshToken'

let accessToken = ''
let refreshToken = ''

function readSession(key: string) {
  if (typeof sessionStorage === 'undefined') return ''
  return sessionStorage.getItem(key) || ''
}

export function initTokensFromSession() {
  accessToken = readSession(SESSION_ACCESS_KEY)
  refreshToken = readSession(SESSION_REFRESH_KEY)
}

export function getAccessToken() {
  return accessToken
}

export function getRefreshToken() {
  return refreshToken
}

export function setTokens(access: string, refresh: string, persistSession = true) {
  accessToken = access
  refreshToken = refresh
  if (!persistSession || typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(SESSION_ACCESS_KEY, access)
  sessionStorage.setItem(SESSION_REFRESH_KEY, refresh)
}

export function clearTokens() {
  accessToken = ''
  refreshToken = ''
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(SESSION_ACCESS_KEY)
  sessionStorage.removeItem(SESSION_REFRESH_KEY)
}

export function hasValidSession() {
  return !!accessToken || !!refreshToken
}

initTokensFromSession()
