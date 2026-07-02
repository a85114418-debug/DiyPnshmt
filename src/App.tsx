import { useState, useCallback } from 'react';
import type { AppMode, Settings } from './types';
import { useAudioDetector } from './hooks/useAudioDetector';
import { useCountdownTimer } from './hooks/useCountdownTimer';
import { useRandomCountdown } from './hooks/useRandomCountdown';
import { useSpeechAnnounce } from './hooks/useSpeechAnnounce';
import { useRecordingSession } from './hooks/useRecordingSession';
import { loadSettings, saveSettings } from './utils/storage';
import { closeAudioCtx } from './utils/beep';
import { CounterDial } from './components/CounterDial';
import { VolumeMeter } from './components/VolumeMeter';
import { ControlBar } from './components/ControlBar';
import { ModeTabs } from './components/ModeTabs';
import { SettingsPanel } from './components/SettingsPanel';
import { VoiceSettings } from './components/VoiceSettings';
import { SessionRecorder } from './components/SessionRecorder';
import { HistoryPanel } from './components/HistoryPanel';
import { ParticleEffect } from './components/ParticleEffect';
import './App.css';

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [activePanel, setActivePanel] = useState<'settings' | 'session' | 'history' | null>(null);

  const voice = useAudioDetector(settings);
  const countdown = useCountdownTimer(settings);
  const random = useRandomCountdown(settings);
  const announce = useSpeechAnnounce(settings);
  const recording = useRecordingSession();

  const isVoice = settings.mode === 'voice';
  const isCountdown = settings.mode === 'countdown';
  const isAnnounce = settings.mode === 'announce';
  const isRandom = isCountdown && settings.countdownMode === 'random';

  const activeCountdown = isRandom ? random : countdown;
  const activeMode = isCountdown ? activeCountdown : (isAnnounce ? announce : voice);

  const { status, count, isFlashing } = activeMode;
  const displayTarget = isCountdown ? activeCountdown.total : settings.target;

  const handleModeChange = useCallback((newMode: AppMode) => {
    if (newMode === settings.mode) return;
    voice.reset();
    countdown.reset();
    random.reset();
    announce.reset();
    closeAudioCtx();
    const next = { ...settings, mode: newMode };
    setSettings(next);
    saveSettings(next);
  }, [settings, voice, countdown, random, announce]);

  const handleSettingsChange = useCallback((s: Settings) => {
    setSettings(s);
    saveSettings(s);
  }, []);

  const handleStart = useCallback(async () => {
    if (isCountdown) {
      if (isRandom) {
        random.start();
      } else {
        countdown.start();
      }
    } else if (isAnnounce) {
      try {
        await announce.startListening();
      } catch {
        // Error logged
      }
    } else {
      try {
        await voice.startListening();
      } catch {
        // Error logged
      }
    }
  }, [isCountdown, isRandom, isAnnounce, random, countdown, announce, voice]);

  if (recording.isRecording) {
    recording.updateCount(settings.mode, count);
  }

  const isRunning = status === 'listening' || status === 'paused';

  return (
    <>
      <ParticleEffect effect={settings.visualEffect} />

      <div className="app">
        <header className="app-header">
          <h1 className="app-title">DiyPnshmt</h1>
        </header>

        <ModeTabs
          mode={settings.mode}
          onChange={handleModeChange}
          disabled={isRunning}
        />

        <main className="app-main">
          <section className="section-dial">
            <CounterDial
              count={count}
              target={displayTarget}
              isFlashing={isFlashing}
            />
          </section>

          {(isVoice || isAnnounce) && (
            <section className="section-volume">
              <VolumeMeter
                dbLevel={isVoice ? voice.dbLevel : announce.dbLevel}
                threshold={settings.threshold}
                baseline={isVoice ? voice.baseline : announce.baseline}
              />
            </section>
          )}

          {isAnnounce && (
            <section className="section-voice">
              <VoiceSettings
                lang={settings.voiceLang}
                selectedVoiceURI={settings.selectedVoiceURI}
                onLangChange={(lang) => handleSettingsChange({ ...settings, voiceLang: lang })}
                onVoiceChange={(uri) => handleSettingsChange({ ...settings, selectedVoiceURI: uri })}
              />
            </section>
          )}

          <section className="section-controls">
            <ControlBar
              status={status}
              onStart={handleStart}
              onPause={activeMode.pause}
              onResume={activeMode.resume}
              onReset={activeMode.reset}
            />
          </section>

          <section className="section-panels">
            <div className="panel-tabs">
              <button
                className={`panel-tab ${activePanel === 'settings' ? 'active' : ''}`}
                onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}
              >
                设置
              </button>
              <button
                className={`panel-tab ${activePanel === 'session' ? 'active' : ''}`}
                onClick={() => setActivePanel(activePanel === 'session' ? null : 'session')}
              >
                记录
              </button>
              <button
                className={`panel-tab ${activePanel === 'history' ? 'active' : ''}`}
                onClick={() => setActivePanel(activePanel === 'history' ? null : 'history')}
              >
                历史
              </button>
            </div>

            {activePanel === 'settings' && (
              <div className="panel-content">
                <SettingsPanel settings={settings} />
              </div>
            )}

            {activePanel === 'session' && (
              <div className="panel-content">
                <SessionRecorder
                  activeSession={recording.activeSession}
                  isRecording={recording.isRecording}
                  onCreateSession={recording.createSession}
                  onStartRecording={recording.startRecording}
                  onEndRecording={recording.endRecording}
                />
              </div>
            )}

            {activePanel === 'history' && (
              <div className="panel-content">
                <HistoryPanel
                  sessions={recording.sessions}
                  onDelete={recording.deleteSession}
                />
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
