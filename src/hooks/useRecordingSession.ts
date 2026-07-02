import { useState, useCallback } from 'react';
import type { RecordingSession, AppMode } from '../types';
import { saveSession, loadSessions, deleteSession as deleteSessionStorage } from '../utils/storage';

export function useRecordingSession() {
  const [activeSession, setActiveSession] = useState<RecordingSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sessions, setSessions] = useState<RecordingSession[]>(loadSessions());

  const createSession = useCallback((name: string) => {
    const session: RecordingSession = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      startedAt: 0,
      endedAt: null,
      positiveCount: 0,
      countdownCount: 0,
      totalCount: 0,
      modesUsed: [],
    };
    setActiveSession(session);
  }, []);

  const startRecording = useCallback(() => {
    if (!activeSession) return;
    const updated = { ...activeSession, startedAt: Date.now() };
    setActiveSession(updated);
    setIsRecording(true);
  }, [activeSession]);

  const endRecording = useCallback(() => {
    if (!activeSession || !isRecording) return;
    const updated = { ...activeSession, endedAt: Date.now() };
    setActiveSession(null);
    setIsRecording(false);
    saveSession(updated);
    setSessions(loadSessions());
    return updated;
  }, [activeSession, isRecording]);

  const updateCount = useCallback((mode: AppMode, count: number) => {
    if (!activeSession || !isRecording) return;

    const updated = { ...activeSession };

    // Track mode usage
    if (!updated.modesUsed.includes(mode)) {
      updated.modesUsed.push(mode);
    }

    // Update counts
    if (mode === 'voice' || mode === 'announce') {
      updated.positiveCount = count;
    } else if (mode === 'countdown') {
      updated.countdownCount = count;
    }

    updated.totalCount = updated.positiveCount + updated.countdownCount;
    setActiveSession(updated);
  }, [activeSession, isRecording]);

  const deleteSession = useCallback((id: string) => {
    deleteSessionStorage(id);
    setSessions(loadSessions());
  }, []);

  const refreshSessions = useCallback(() => {
    setSessions(loadSessions());
  }, []);

  return {
    activeSession,
    isRecording,
    sessions,
    createSession,
    startRecording,
    endRecording,
    updateCount,
    deleteSession,
    refreshSessions,
  } as const;
}
