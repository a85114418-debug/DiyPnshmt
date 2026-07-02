import type { AppStatus } from '../types';
import './ControlBar.css';

interface Props {
  status: AppStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export function ControlBar({ status, onStart, onPause, onResume, onReset }: Props) {
  return (
    <div className="control-bar">
      {status === 'idle' && (
        <button className="btn-primary" onClick={onStart}>
          开始
        </button>
      )}

      {status === 'listening' && (
        <>
          <button className="btn-secondary" onClick={onPause}>
            暂停
          </button>
          <button className="btn-secondary" onClick={onReset}>
            重置
          </button>
        </>
      )}

      {status === 'paused' && (
        <>
          <button className="btn-primary" onClick={onResume}>
            继续
          </button>
          <button className="btn-secondary" onClick={onReset}>
            重置
          </button>
        </>
      )}

      {status === 'finished' && (
        <button className="btn-primary" onClick={onReset}>
          重新开始
        </button>
      )}
    </div>
  );
}
