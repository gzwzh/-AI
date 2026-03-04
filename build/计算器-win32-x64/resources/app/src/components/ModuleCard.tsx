import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ModuleItem } from '@/config/modules'
import { useAuthStore } from '@/stores/auth'
import ModuleIcon from './ModuleIcon'
import LoginPromptModal from './LoginPromptModal'
import './ModuleCard.scss'

interface ModuleCardProps {
  module: ModuleItem
}

export default function ModuleCard({ module }: ModuleCardProps) {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // 如果未登录，显示登录提示弹窗
    if (!token) {
      setShowLoginPrompt(true)
      return
    }

    // 已登录，导航到模块
    navigate(module.route)
  }

  return (
    <>
      <div className="module-card" onClick={handleClick}>
        <div className="card-icon">
          <ModuleIcon name={module.icon} />
        </div>
        <span className="card-name">{module.name}</span>
      </div>
      <LoginPromptModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </>
  )
}
