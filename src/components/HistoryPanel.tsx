import type { RecordingSession } from '../types';

interface Props {
  sessions: RecordingSession[];
  onDelete: (id: string) => void;
}

export function HistoryPanel({ sessions, onDelete }: Props) {
  return (
    <div style={{ padding: '24px' }}>
      <h3>历史记录</h3>
      {sessions.length === 0 ? (
        <p style={{ color: '#999' }}>暂无记录</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {sessions.map((s) => (
            <li key={s.id} style={{ marginBottom: '12px', padding: '12px', background: '#f5f5f7', borderRadius: '8px' }}>
              <strong>{s.name}</strong>
              <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>
                总数: {s.totalCount}
              </p>
              <button onClick={() => onDelete(s.id)} style={{ fontSize: '12px' }}>删除</button>
            </li>
          ))}
        </ul>
      )}
      <p style={{ color: '#999', fontSize: '14px', marginTop: '12px' }}>（详细界面开发中）</p>
    </div>
  );
}
