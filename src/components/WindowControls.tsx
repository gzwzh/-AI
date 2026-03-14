import React from 'react';
import { useTranslation } from 'react-i18next';
import './WindowControls.scss';

const WindowControls: React.FC = () => {
  const { t } = useTranslation();
  const isElectron = !!window.electronAPI;

  if (!isElectron) return null;

  return (
    <div className="window-controls">
      <div className="controls-divider"></div>
      <button className="control-btn minimize" onClick={() => window.electronAPI.minimize()} title={t('common.minimize')}>
        <svg viewBox="0 0 10 1" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M0 0.5H10" />
        </svg>
      </button>
      <button className="control-btn maximize" onClick={() => window.electronAPI.maximize()} title={t('common.maximize')}>
        <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="1" width="8" height="8" rx="1" />
        </svg>
      </button>
      <button className="control-btn close" onClick={() => window.electronAPI.close()} title={t('common.close')}>
        <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 1L9 9M9 1L1 9" />
        </svg>
      </button>
    </div>
  );
};

export default WindowControls;
