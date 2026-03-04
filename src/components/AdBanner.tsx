import { useState } from 'react'
import './AdBanner.scss'

interface Ad {
  id: string
  imageUrl: string
  targetUrl: string
  width: number
  height: number
}

interface AdBannerProps {
  position: 'top' | 'bottom' | 'sidebar'
  adData?: Ad
  isLoading?: boolean
}

export default function AdBanner({ position, adData, isLoading = false }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible || !adData) {
    return null
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleClick = () => {
    if (adData.targetUrl) {
      window.open(adData.targetUrl, '_blank')
    }
  }

  return (
    <div className={`ad-banner ad-banner-${position}`}>
      <div className="ad-container">
        {isLoading ? (
          <div className="ad-skeleton" />
        ) : (
          <>
            <img
              src={adData.imageUrl}
              alt="Advertisement"
              className="ad-image"
              onClick={handleClick}
              style={{
                width: `${adData.width}px`,
                height: `${adData.height}px`
              }}
            />
            <button
              className="ad-close"
              onClick={handleClose}
              title="关闭广告"
              aria-label="关闭广告"
            >
              ×
            </button>
          </>
        )}
      </div>
    </div>
  )
}
