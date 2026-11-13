import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Languages } from 'lucide-react';

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-secondary hover:text-primary bg-surface-subdued hover:bg-surface-hover border border-border-subtle transition-all cursor-pointer select-none"
      title={language === 'en' ? 'Switch to Hindi (हिन्दी)' : 'Switch to English'}
    >
      <Languages className="w-3.5 h-3.5" />
      <span className="font-semibold text-[11px]">
        {language === 'en' ? 'EN' : 'हिन्दी'}
      </span>
    </button>
  );
};

