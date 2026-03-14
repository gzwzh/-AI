import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';
import WindowControls from './WindowControls';
import './ToolHeader.scss';

interface ToolHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  extraActions?: React.ReactNode;
}

const ToolHeader: React.FC<ToolHeaderProps> = ({ 
  title, 
  onBack, 
  showBack = true,
  extraActions 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <header className="tool-header">
      <div className="header-left">
        {showBack && (
          <button className="back-btn" onClick={handleBack} title={t('common.back')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        )}
        {extraActions}
      </div>
      
      <h1 className="tool-title">{title}</h1>
      
      <div className="header-right">
        <ThemeToggle />
        <WindowControls />
      </div>
    </header>
  );
};

export default ToolHeader;
