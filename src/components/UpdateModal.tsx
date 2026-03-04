import { useState, useEffect } from 'react'
import './UpdateModal.scss'

interface UpdateInfo {
  has_update: boolean
  version: string
  update_log: string
  download_url: string
  package_hash: string
  is_mandatory: boolean
}

const UpdateModal = () => {
  const [showModal, setShowModal] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [currentVersion, setCurrentVersion] = useState('')

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        // Get current version
        const ver = await window.electronAPI.getAppVersion()
        setCurrentVersion(ver)

        // Check for updates
        // Software ID: 10006
        const info = await window.electronAPI.checkUpdate('10006', ver)
        
        if (info.has_update) {
          setUpdateInfo(info)
          setShowModal(true)
        }
      } catch (error) {
        console.error('Failed to check updates:', error)
      }
    }

    checkUpdate()
  }, [])

  const handleUpdate = () => {
    if (updateInfo) {
      window.electronAPI.startUpdate(updateInfo)
    }
  }

  const handleClose = () => {
    if (updateInfo?.is_mandatory) {
      return // Cannot close mandatory updates
    }
    setShowModal(false)
  }

  if (!showModal || !updateInfo) return null

  return (
    <div className="update-modal-overlay">
      <div className="update-modal">
        <h2>发现新版本</h2>
        <div className="version-info">
          <span className="current-version">当前版本 {currentVersion}</span>
          <span className="arrow">→</span>
          <span className="new-version">{updateInfo.version}</span>
        </div>
        
        {updateInfo.update_log && (
          <div className="update-log-container">
            <div className="log-title">更新内容</div>
            <div className="update-log">
              {updateInfo.update_log}
            </div>
          </div>
        )}

        <div className="actions">
          {!updateInfo.is_mandatory && (
            <button className="cancel" onClick={handleClose}>
              稍后提醒
            </button>
          )}
          <button className="confirm" onClick={handleUpdate}>
            立即更新
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpdateModal
