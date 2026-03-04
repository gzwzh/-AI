/**
 * 广告服务
 * 用于获取和管理广告数据
 */

const API_BASE_URL = 'https://api-web.kunqiongai.com'

interface Ad {
  soft_number: number
  adv_position: string
  adv_url: string
  target_url: string
  width: number
  height: number
}

interface ApiResponse<T> {
  code: number
  msg: string
  time: number
  data: T
}

/**
 * 获取广告
 * @param softNumber 软件编号
 * @param advPosition 广告位置
 */
export async function getAds(softNumber: string, advPosition: string): Promise<Ad[]> {
  const url = `${API_BASE_URL}/soft_desktop/get_adv`
  const params = new URLSearchParams({
    soft_number: softNumber,
    adv_position: advPosition
  })

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const result: ApiResponse<Ad[]> = await response.json()

    if (result.code === 1) {
      return result.data
    } else {
      console.error(`获取广告失败：${result.msg}`)
      return []
    }
  } catch (error) {
    console.error('获取广告失败：', error)
    return []
  }
}

/**
 * 获取顶部广告
 */
export async function getTopAd(softNumber: string): Promise<Ad | null> {
  const ads = await getAds(softNumber, 'adv_position_01')
  return ads.length > 0 ? ads[0] : null
}

/**
 * 获取底部广告
 */
export async function getBottomAd(softNumber: string): Promise<Ad | null> {
  const ads = await getAds(softNumber, 'adv_position_02')
  return ads.length > 0 ? ads[0] : null
}

/**
 * 获取侧边栏广告
 */
export async function getSidebarAd(softNumber: string): Promise<Ad | null> {
  const ads = await getAds(softNumber, 'adv_position_03')
  return ads.length > 0 ? ads[0] : null
}

/**
 * 获取轮播广告（位置02和03）
 */
export async function getCarouselAds(softNumber: string): Promise<Ad[]> {
  try {
    const ads02 = await getAds(softNumber, 'adv_position_02')
    const ads03 = await getAds(softNumber, 'adv_position_03')
    return [...ads02, ...ads03]
  } catch (error) {
    console.error('获取轮播广告失败：', error)
    return []
  }
}

/**
 * 转换广告数据格式
 */
export function transformAd(ad: Ad) {
  return {
    id: `${ad.soft_number}-${ad.adv_position}`,
    imageUrl: ad.adv_url,
    targetUrl: ad.target_url,
    width: ad.width,
    height: ad.height
  }
}
