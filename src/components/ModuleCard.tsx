import { useNavigate } from 'react-router-dom'
import type { ModuleItem } from '@/config/modules'
import ModuleIcon from './ModuleIcon'
import './ModuleCard.scss'

interface ModuleCardProps {
  module: ModuleItem
}

export default function ModuleCard({ module }: ModuleCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(module.route)
  }

  return (
    <div className="module-card" onClick={handleClick}>
      <div className="card-icon">
        <ModuleIcon name={module.icon} />
      </div>
      <span className="card-name">{module.name}</span>
    </div>
  )
}
