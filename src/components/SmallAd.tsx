import { useEffect, useState } from 'react'
import { getTopAd, transformAd } from '@/services/ads'
import './SmallAd.scss'

interface Ad {
  id: string
  imageUrl: string
  targetUrl: string
  width: number
  height: number
}

export default function SmallAd() {
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAd = async () => {
      try {
        setLoading(true)
        const softNumber = '10006' // 全能计算器
        const adData = await getTopAd(softNumber)
        if (adData) {
          const transformedAd = transformAd(adData)
          setAd(transformedAd)
        }
      } catch (error) {
        console.error('加载小广告失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAd()
  }, [])

  if (loading || !ad) {
    return null
  }

  const handleClick = () => {
    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank')
    }
  }

  return (
    <div className="small-ad" onClick={handleClick}>
      <img src={ad.imageUrl} alt="Advertisement" className="small-ad-image" />
    </div>
  )
}
