import type { Settings } from '../types';

interface Props {
  settings: Settings;
}

export function SettingsPanel({ settings }: Props) {
  return (
    <div style={{ padding: '24px' }}>
      <h3>设置面板</h3>
      <p>阈值: {settings.threshold} dB</p>
      <p>目标: {settings.target}</p>
      <p>音效: {settings.soundType}</p>
      <p style={{ color: '#999', fontSize: '14px' }}>（详细设置面板开发中）</p>
    </div>
  );
}
