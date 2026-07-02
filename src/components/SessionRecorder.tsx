interface Props {
  activeSession: any;
  isRecording: boolean;
  onCreateSession: (name: string) => void;
  onStartRecording: () => void;
  onEndRecording: () => void;
}

export function SessionRecorder({ activeSession, isRecording, onCreateSession, onStartRecording, onEndRecording }: Props) {
  return (
    <div style={{ padding: '24px' }}>
      <h3>记录会话</h3>
      {!activeSession && (
        <button onClick={() => onCreateSession('新会话 ' + Date.now())}>
          创建会话
        </button>
      )}
      {activeSession && !isRecording && (
        <button onClick={onStartRecording}>开始记录</button>
      )}
      {activeSession && isRecording && (
        <button onClick={onEndRecording}>结束记录</button>
      )}
      <p style={{ color: '#999', fontSize: '14px', marginTop: '12px' }}>（详细界面开发中）</p>
    </div>
  );
}
