import type { AppMode } from '../types';
import './ModeTabs.css';

interface Props {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
  disabled?: boolean;
}

const MODE_OPTIONS: { key: AppMode; label: string; icon: string }[] = [
  { key: 'voice', label: '声控计数', icon: '🎤' },
  { key: 'countdown', label: '倒计时', icon: '⏱️' },
  { key: 'announce', label: '语音报数', icon: '🔊' },
];

export function ModeTabs({ mode, onChange, disabled = false }: Props) {
  return (
    <div className="mode-tabs">
      {MODE_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          className={`mode-tab ${mode === opt.key ? 'active' : ''}`}
          onClick={() => onChange(opt.key)}
          disabled={disabled}
        >
          <span className="mode-icon">{opt.icon}</span>
          <span className="mode-label">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
