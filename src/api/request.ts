import { API_PATH_PREFIX, API_REMOTE_BASE_URL } from '../config/api'
import type { ApiResponse } from './types'

/** 开发走 Vite 代理（同源），生产直连远程 API */
const API_BASE_URL = import.meta.env.DEV ? API_PATH_PREFIX : API_REMOTE_BASE_URL

export class ApiError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

type TokenGetter = () => { accessToken: string; refreshToken: string }
type CompanyIdGetter = () => string
type TokenRefresher = () => Promise<boolean>
type LogoutHandler = () => void

let getTokens: TokenGetter = () => ({ accessToken: '', refreshToken: '' })
let getPropertyCompanyId: CompanyIdGetter = () => ''
let refreshTokens: TokenRefresher = async () => false
let onUnauthorized: LogoutHandler = () => {}

export function configureRequest(options: {
  getTokens: TokenGetter
  getPropertyCompanyId?: CompanyIdGetter
  refreshTokens: TokenRefresher
  onUnauthorized: LogoutHandler
}) {
  getTokens = options.getTokens
  if (options.getPropertyCompanyId) getPropertyCompanyId = options.getPropertyCompanyId
  refreshTokens = options.refreshTokens
  onUnauthorized = options.onUnauthorized
}

function withCompanyQuery(path: string) {
  if (!path.startsWith('/admin/') && !path.startsWith('/reports/') && !path.startsWith('/residents') && !path.startsWith('/merchants')) return path

  const companyId = getPropertyCompanyId()
  if (!companyId) return path

  const qIndex = path.indexOf('?')
  const pathname = qIndex >= 0 ? path.slice(0, qIndex) : path
  const search = new URLSearchParams(qIndex >= 0 ? path.slice(qIndex + 1) : '')
  if (!search.has('propertyCompanyId')) {
    search.set('propertyCompanyId', companyId)
  }
  const query = search.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text()
  if (!text) {
    throw new ApiError(res.status, '服务器无响应')
  }
  try {
    return JSON.parse(text) as ApiResponse<T>
  } catch {
    throw new ApiError(res.status, '响应解析失败')
  }
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
  retried = false
): Promise<T> {
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth) {
    const { accessToken } = getTokens()
    if (!accessToken) {
      throw new ApiError(20001, '登录已过期，请重新登录')
    }
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const res = await fetch(`${API_BASE_URL}${withCompanyQuery(path)}`, {
    ...options,
    headers
  })

  const json = await parseResponse<T>(res)

  if ((json.code === 20002 || res.status === 401) && auth && !retried) {
    const refreshed = await refreshTokens()
    if (refreshed) {
      return request<T>(path, options, auth, true)
    }
    onUnauthorized()
    throw new ApiError(json.code, json.message || '登录已过期')
  }

  if (json.code !== 0) {
    throw new ApiError(json.code, json.message || '请求失败')
  }

  return json.data
}

export async function requestRaw<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  return request<T>(path, options, auth)
}
