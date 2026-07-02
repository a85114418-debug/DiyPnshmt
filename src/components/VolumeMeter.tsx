import './VolumeMeter.css';

interface Props {
  dbLevel: number;
  threshold: number;
  baseline: number;
}

export function VolumeMeter({ dbLevel, threshold, baseline }: Props) {
  const effectiveThreshold = threshold + baseline;
  const percentage = Math.min(100, (dbLevel / 100) * 100);
  const isTriggered = dbLevel > effectiveThreshold;

  return (
    <div className="volume-meter">
      <div className="meter-label">
        <span>音量</span>
        <span className="meter-value">{dbLevel.toFixed(1)} dB</span>
      </div>
      <div className="meter-bar">
        <div
          className={`meter-fill ${isTriggered ? 'triggered' : ''}`}
          style={{ width: `${percentage}%` }}
        />
        <div
          className="meter-threshold"
          style={{ left: `${Math.min(100, (effectiveThreshold / 100) * 100)}%` }}
        />
      </div>
      <div className="meter-info">
        <span>阈值: {threshold} dB</span>
        <span>基线: {baseline.toFixed(1)} dB</span>
      </div>
    </div>
  );
}
