import { useState, useEffect } from 'react'
import './AdCarousel.scss'

interface Ad {
  id: string
  imageUrl: string
  targetUrl: string
  width: number
  height: number
}

interface AdCarouselProps {
  ads: Ad[]
  autoPlay?: boolean
  interval?: number
}

export default function AdCarousel({ ads, autoPlay = true, interval = 5000 }: AdCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  // 自动轮播
  useEffect(() => {
    if (!autoPlay || ads.length === 0 || isHovering) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, ads.length, interval, isHovering])

  if (ads.length === 0) {
    return null
  }

  const currentAd = ads[currentIndex]

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length)
  }

  const handleClick = () => {
    if (currentAd.targetUrl) {
      window.open(currentAd.targetUrl, '_blank')
    }
  }

  return (
    <div 
      className="ad-carousel"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="carousel-container">
        {/* 轮播图片 */}
        <div className="carousel-slide">
          <img
            src={currentAd.imageUrl}
            alt="Advertisement"
            className="carousel-image"
            onClick={handleClick}
          />
        </div>

        {/* 左箭头 - 鼠标悬停时显示 */}
        {ads.length > 1 && (
          <button
            className={`carousel-arrow carousel-arrow-left ${isHovering ? 'visible' : ''}`}
            onClick={handlePrevious}
            title="上一张"
            aria-label="上一张"
          >
            ‹
          </button>
        )}

        {/* 右箭头 - 鼠标悬停时显示 */}
        {ads.length > 1 && (
          <button
            className={`carousel-arrow carousel-arrow-right ${isHovering ? 'visible' : ''}`}
            onClick={handleNext}
            title="下一张"
            aria-label="下一张"
          >
            ›
          </button>
        )}

        {/* 指示点 */}
        {ads.length > 1 && (
          <div className="carousel-dots">
            {ads.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                title={`第 ${index + 1} 张`}
                aria-label={`第 ${index + 1} 张`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
