import CryptoJS from 'crypto-js'
import i18n from '@/i18n'
import { API_BASE_URL, SECRET_KEY, API_ENDPOINTS, POLL_CONFIG } from '@/config/api'

export interface SignedNonce {
  nonce: string
  timestamp: number
  signature: string
}

export interface UserInfo {
  avatar: string
  nickname: string
}

export interface LoginResponse {
  code: number
  msg: string
  data: any
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function generateSignedNonce(): SignedNonce {
  const nonce = generateUUID().replace(/-/g, '')
  const timestamp = Math.floor(Date.now() / 1000)
  const message = `${nonce}|${timestamp}`
  const hmacHash = CryptoJS.HmacSHA256(message, SECRET_KEY)
  const signature = CryptoJS.enc.Base64.stringify(hmacHash)

  return {
    nonce,
    timestamp,
    signature
  }
}


export function encodeSignedNonce(signedNonce: SignedNonce): string {
  const jsonStr = JSON.stringify(signedNonce)
  let urlSafeStr = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(jsonStr))
  // 替换base64中的URL不安全字符
  urlSafeStr = urlSafeStr.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  return urlSafeStr
}

export async function getWebLoginUrl(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_WEB_LOGIN_URL}`, {
      method: 'POST'
    })
    const result: LoginResponse = await response.json()
    if (result.code === 1) {
      return result.data.login_url
    } else {
      throw new Error(`${i18n.t('auth.get_login_url_failed')}：${result.msg}`)
    }
  } catch (error) {
    throw new Error(`${i18n.t('auth.get_login_url_failed')}：${error}`)
  }
}

export async function pollToken(
  encodedNonce: string,
  timeout: number = POLL_CONFIG.TIMEOUT,
  onCancel?: () => boolean
): Promise<string> {
  const startTime = Date.now()
  const pollUrl = `${API_BASE_URL}${API_ENDPOINTS.GET_TOKEN}`

  while (Date.now() - startTime < timeout * 1000) {
    if (onCancel && onCancel()) {
      throw new Error(i18n.t('auth.login_cancelled'))
    }

    try {
      const url = `${pollUrl}?client_type=desktop&client_nonce=${encodeURIComponent(encodedNonce)}`
      const response = await fetch(url, {
        method: 'POST'
      })

      const result: LoginResponse = await response.json()

      if (result.code === 1) {
        return result.data.token
      } else {
        console.log(`轮询异常：${result.msg}`)
      }
    } catch (error) {
      console.log(`轮询失败：${error}`)
    }

    await new Promise(resolve => setTimeout(resolve, POLL_CONFIG.INTERVAL))
  }

  throw new Error(i18n.t('auth.login_timeout'))
}

export async function checkLogin(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHECK_LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `token=${token}`
    })

    if (!response.ok) {
      return false
    }

    const result: LoginResponse = await response.json()
    return result.code === 1
  } catch (error) {
    console.error('检查登录异常：', error)
    return false
  }
}

export async function getUserInfo(token: string): Promise<UserInfo> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_USER_INFO}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      token
    }
  })

  const result: LoginResponse = await response.json()
  if (result.code === 1) {
    return result.data.user_info
  } else {
    throw new Error(`${i18n.t('auth.get_user_info_failed')}：${result.msg}`)
  }
}

export async function logout(token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      token
    }
  })

  const result: LoginResponse = await response.json()
  if (result.code !== 1) {
    throw new Error(`${i18n.t('auth.logout_failed')}：${result.msg}`)
  }
}
