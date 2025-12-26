import { Link } from 'react-router-dom'
import type { ModuleItem } from '@/config/modules'
import ModuleIcon from './ModuleIcon'
import './ModuleCard.scss'

interface ModuleCardProps {
  module: ModuleItem
}

export default function ModuleCard({ module }: ModuleCardProps) {
  return (
    <Link to={module.route} className="module-card">
      <div className="card-icon">
        <ModuleIcon name={module.icon} />
      </div>
      <span className="card-name">{module.name}</span>
    </Link>
  )
}
