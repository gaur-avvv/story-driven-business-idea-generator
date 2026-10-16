import React from 'react';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';
import { useTheme } from '../hooks/useTheme';
import { t, Language } from '../utils/i18n';

interface ThemeToggleProps {
  language: Language;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ language }) => {
  const { theme, cycleTheme } = useTheme();

  const icon = theme === 'light' ? 'sun' : theme === 'dark' ? 'moon' : 'monitor';
  const label = theme === 'light'
    ? t(language, 'themeLight')
    : theme === 'dark'
      ? t(language, 'themeDark')
      : t(language, 'themeSystem');

  return (
    <Tooltip text={label}>
      <button
        onClick={cycleTheme}
        className="p-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all border border-transparent hover:border-white/30 shadow-sm hover:shadow-md"
        aria-label={label}
      >
        <Icon name={icon} className="w-5 h-5" />
      </button>
    </Tooltip>
  );
};
