import './CounterDial.css';

interface Props {
  count: number;
  target: number;
  isFlashing: boolean;
}

export function CounterDial({ count, target, isFlashing }: Props) {
  const progress = target > 0 ? (count / target) * 100 : 0;
  const circumference = 2 * Math.PI * 140;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`counter-dial ${isFlashing ? 'flashing' : ''}`}>
      <svg className="counter-ring" viewBox="0 0 300 300">
        <circle
          className="ring-track"
          cx="150"
          cy="150"
          r="140"
        />
        <circle
          className="ring-progress"
          cx="150"
          cy="150"
          r="140"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="counter-content">
        <div className="counter-number">{count}</div>
        <div className="counter-target">/ {target}</div>
      </div>
    </div>
  );
}
