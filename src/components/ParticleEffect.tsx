import type { VisualEffect } from '../types';

interface Props {
  effect: VisualEffect;
}

export function ParticleEffect({ effect }: Props) {
  if (effect === 'none') return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 0,
    }}>
      <p style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#ccc',
        fontSize: '14px'
      }}>
        {effect === 'snow' && '❄️ 飘雪特效'}
        {effect === 'sakura' && '🌸 樱花特效'}
        {effect === 'rain' && '🌧️ 雨点特效'}
        （开发中）
      </p>
    </div>
  );
}
