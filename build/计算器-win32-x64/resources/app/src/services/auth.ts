// 客户端与服务端约定的密钥（需安全存储）
const SECRET_KEY = '7530bfb1ad6c41627b0f0620078fa5ed'
const API_BASE_URL = 'https://api-web.kunqiongai.com'

interface SignedNonce {
  nonce: string
  timestamp: number
  signature: string
}

interface ApiResponse<T> {
  code: number
  msg: string
  time: number
  data: T
}

interface TokenData {
  token: string
}

interface UserInfo {
  avatar: string
  nickname: string
}

interface UserInfoData {
  user_info: UserInfo
}

interface LoginUrlData {
  login_url: string
}

/**
 * 生成HMAC-SHA256签名（浏览器兼容版本）
 */
async function generateHmacSha256(message: string, key: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(key)
  const messageData = encoder.encode(message)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  const signatureArray = Array.from(new Uint8Array(signature))
  const base64Signature = btoa(String.fromCharCode(...signatureArray))

  return base64Signature
}

/**
 * 生成UUID（浏览器兼容版本）
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // 备用方案
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 生成带签名的临时会话ID（nonce）
 * 返回：包含nonce、timestamp、signature的对象
 */
export async function generateSignedNonce(): Promise<SignedNonce> {
  // 1. 生成随机nonce（基础唯一标识）
  const nonce = generateUUID().replace(/-/g, '')

  // 2. 生成时间戳（秒级），用于防重放攻击
  const timestamp = Math.floor(Date.now() / 1000)

  // 3. 构造待签名的字符串（nonce + 时间戳，用分隔符区分）
  const message = `${nonce}|${timestamp}`

  // 4. HMAC-SHA256签名
  const signature = await generateHmacSha256(message, SECRET_KEY)

  // 5. 返回组合数据
  return {
    nonce,
    timestamp,
    signature
  }
}

/**
 * 将带签名的nonce编码为URL安全的字符串
 */
export function encodeSignedNonce(signedNonce: SignedNonce): string {
  // 先转为JSON字符串，再base64编码
  const jsonStr = JSON.stringify(signedNonce)
  // 使用浏览器兼容的 btoa 替代 Buffer
  let urlSafeStr = btoa(unescape(encodeURIComponent(jsonStr)))
  // 替换base64中的URL不安全字符
  urlSafeStr = urlSafeStr.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  return urlSafeStr
}

/**
 * 获取网页端登录地址
 */
export async function getWebLoginUrl(): Promise<string> {
  const url = `${API_BASE_URL}/soft_desktop/get_web_login_url`
  const response = await fetch(url, {
    method: 'POST'
  })
  const result: ApiResponse<LoginUrlData> = await response.json()
  if (result.code === 1) {
    return result.data.login_url
  } else {
    throw new Error(`获取登录地址失败：${result.msg}`)
  }
}

/**
 * 轮询获取Token
 */
export async function pollToken(
  encodedNonce: string,
  timeout: number = 300,
  onCancel?: () => boolean
): Promise<string> {
  const startTime = Date.now()
  const pollUrl = `${API_BASE_URL}/user/desktop_get_token`

  while (Date.now() - startTime < timeout * 1000) {
    // 检查是否被取消
    if (onCancel?.()) {
      throw new Error('登录已取消')
    }

    try {
      const params = new URLSearchParams({
        client_type: 'desktop',
        client_nonce: encodedNonce
      })

      const response = await fetch(pollUrl, {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      const result: ApiResponse<TokenData> = await response.json()

      if (result.code === 1) {
        return result.data.token
      }

      // 等待2秒后继续轮询
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('轮询失败：', error)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  throw new Error('登录超时')
}

/**
 * 检查是否登录
 */
export async function checkLogin(token: string): Promise<boolean> {
  const url = `${API_BASE_URL}/user/check_login`
  const params = new URLSearchParams({ token })

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const result: ApiResponse<unknown> = await response.json()
    return result.code === 1
  } catch (error) {
    console.error('检查登录失败：', error)
    return false
  }
}

/**
 * 获取用户信息
 */
export async function getUserInfo(token: string): Promise<UserInfo> {
  const url = `${API_BASE_URL}/soft_desktop/get_user_info`
  const params = new URLSearchParams({})

  const response = await fetch(url, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'token': token
    }
  })

  const result: ApiResponse<UserInfoData> = await response.json()
  if (result.code === 1) {
    return result.data.user_info
  } else {
    throw new Error(`获取用户信息失败：${result.msg}`)
  }
}

/**
 * 退出登录
 */
export async function logout(token: string): Promise<void> {
  const url = `${API_BASE_URL}/logout`
  const params = new URLSearchParams({})

  const response = await fetch(url, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'token': token
    }
  })

  const result: ApiResponse<null> = await response.json()
  if (result.code !== 1) {
    throw new Error(`退出登录失败：${result.msg}`)
  }
}
