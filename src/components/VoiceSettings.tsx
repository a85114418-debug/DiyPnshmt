import type { VoiceLang } from '../types';
import { getVoicesByLang } from '../utils/speech';

interface Props {
  lang: VoiceLang;
  selectedVoiceURI: string;
  onLangChange: (lang: VoiceLang) => void;
  onVoiceChange: (uri: string) => void;
}

export function VoiceSettings({ lang, selectedVoiceURI, onLangChange, onVoiceChange }: Props) {
  const voices = getVoicesByLang(lang);

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
          语言
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onLangChange('zh')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: lang === 'zh' ? '2px solid #0066cc' : '1px solid #ccc',
              background: lang === 'zh' ? '#e6f2ff' : 'white',
              color: lang === 'zh' ? '#0066cc' : '#666',
              cursor: 'pointer'
            }}
          >
            中文
          </button>
          <button
            onClick={() => onLangChange('en')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: lang === 'en' ? '2px solid #0066cc' : '1px solid #ccc',
              background: lang === 'en' ? '#e6f2ff' : 'white',
              color: lang === 'en' ? '#0066cc' : '#666',
              cursor: 'pointer'
            }}
          >
            English
          </button>
        </div>
      </div>

      <div>
        <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
          音色
        </label>
        <select
          value={selectedVoiceURI}
          onChange={(e) => onVoiceChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
        >
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
