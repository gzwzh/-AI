import { API_BASE_URL, API_ENDPOINTS } from '@/config/api'

interface ApiResponse<T> {
  code: number
  msg: string
  time: number
  data: T
}

interface FeedbackUrlData {
  url: string
}

/**
 * 获取问题反馈页面链接
 * @param softNumber 软件编号
 */
export async function getFeedbackUrl(softNumber: string): Promise<string | null> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.GET_FEEDBACK_URL}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        // Content-Type is none according to docs, but fetch might need empty body or specific handling
        // Docs say Content-Type: none. Usually this means no header or text/plain. 
        // But for consistency with other APIs, let's try without setting Content-Type first or observe other API calls.
        // Wait, other APIs use urlencoded. The docs for this one say "Content-Type: none".
        // Let's assume standard fetch behavior.
      }
    })

    const result: ApiResponse<FeedbackUrlData> = await response.json()

    if (result.code === 1) {
      // API returns URL like "https://www.kunqiongai.com/feedback?soft_number="
      // We need to append the softNumber
      return `${result.data.url}${softNumber}`
    } else {
      console.error(`获取问题反馈链接失败：${result.msg}`)
      return null
    }
  } catch (error) {
    console.error('获取问题反馈链接失败：', error)
    return null
  }
}
