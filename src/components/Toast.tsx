import { useTranslation } from 'react-i18next'
import './Toast.scss'

interface ToastProps {
  message: string
  visible: boolean
  onClose: () => void
}

export default function Toast({ message, visible, onClose }: ToastProps) {
  const { t } = useTranslation()
  if (!visible) return null

  return (
    <div className="toast-overlay">
      <div className="toast-container">
        <div className="toast-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={onClose}>{t('common.confirm')}</button>
      </div>
    </div>
  )
}
