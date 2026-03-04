import { useEffect, useState } from 'react'
import { moduleCategories } from '@/config/modules'
import ModuleCard from '@/components/ModuleCard'
import ThemeToggle from '@/components/ThemeToggle'
import LoginButton from '@/components/LoginButton'
import AdCarousel from '@/components/AdCarousel'
import SmallAd from '@/components/SmallAd'
import { useAuthStore } from '@/stores/auth'
import { getCarouselAds, transformAd } from '@/services/ads'
import { getFeedbackUrl } from '@/services/feedback'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api'
import './Home.scss'

interface Ad {
  id: string
  imageUrl: string
  targetUrl: string
  width: number
  height: number
}

export default function Home() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const [carouselAds, setCarouselAds] = useState<Ad[]>([])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // 加载轮播广告
  useEffect(() => {
    const loadAds = async () => {
      try {
        const softNumber = '10006' // 计算器

        // 获取轮播广告（位置02和03）
        const adsData = await getCarouselAds(softNumber)
        const transformedAds = adsData.map(transformAd)
        setCarouselAds(transformedAds)
      } catch (error) {
        console.error('加载广告失败:', error)
      }
    }

    loadAds()
  }, [])

  return (
    <div className="home">
      <header className="header">
        <div className="title-container">
          <img src="计算器.png" alt="全能计算器图标" className="title-icon" />
          <h1 className="title">全能计算器</h1>
          <div className="title-divider"></div>
          <span className="title-subtext">鲲穹AI旗下产品</span>
        </div>
        <div className="header-actions">
          <SmallAd />
          <button className="custom-button" onClick={async () => {
            try {
              const url = `${API_BASE_URL}${API_ENDPOINTS.GET_CUSTOM_URL}`;
              const response = await fetch(url, {
                method: 'POST'
              });
              const result = await response.json();
              if (result.code === 1) {
                window.open(result.data.url, '_blank');
              } else {
                console.error('获取需求定制页面链接失败:', result.msg);
              }
            } catch (error) {
              console.error('获取需求定制页面链接失败:', error);
            }
          }}>
            软件定制/联系我们
          </button>
          <button className="custom-button" onClick={async () => {
            const url = await getFeedbackUrl('10006');
            if (url) {
              window.open(url, '_blank');
            }
          }}>
            问题反馈
          </button>
          <LoginButton />
          <ThemeToggle />
        </div>
      </header>

      {/* 轮播广告 */}
      {carouselAds.length > 0 && (
        <div className="carousel-wrapper">
          <AdCarousel ads={carouselAds} autoPlay={true} interval={5000} />
        </div>
      )}
      
      <main className="main">
        {moduleCategories.map((category) => (
          <section key={category.id} className="category">
            <h2 className="category-title">{category.name}</h2>
            <div className="module-grid">
              {category.modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </section>
        ))}
      </main>
      
      <footer className="footer">
        <img src="icon.ico" alt="图标" className="footer-icon" />
        <span className="footer-text">鲲穹AI旗下产品</span>
      </footer>
    </div>
  )
}
