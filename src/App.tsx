import { useState, useCallback, useEffect } from 'react';
import type { AppMode, Settings, VisualEffect } from './types';
import { useAudioDetector } from './hooks/useAudioDetector';
import { useCountdownTimer } from './hooks/useCountdownTimer';
import { useRandomCountdown } from './hooks/useRandomCountdown';
import { loadSettings, saveSettings } from './utils/storage';
import { closeAudioCtx } from './utils/beep';
import { CounterDial } from './components/CounterDial';
import { VolumeMeter } from './components/VolumeMeter';
import { ControlBar } from './components/ControlBar';
import { ModeTabs } from './components/ModeTabs';
import { SettingsPanel } from './components/SettingsPanel';
import { ParticleEffect } from './components/ParticleEffect';
import './App.css';

const EFFECT_OPTIONS: { key: VisualEffect; label: string; icon: string }[] = [
  { key: 'none', label: '关闭特效', icon: '✕' },
  { key: 'snow', label: '飘雪', icon: '❄' },
  { key: 'sakura', label: '樱花', icon: '🌸' },
  { key: 'rain', label: '雨点', icon: '🌧' },
];

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [effectMenuOpen, setEffectMenuOpen] = useState(false);
  const [orientationBlocked, setOrientationBlocked] = useState(false);

  const voice = useAudioDetector(settings);
  const countdown = useCountdownTimer(settings);
  const random = useRandomCountdown(settings);

  const isVoice = settings.mode === 'voice';
  const isCountdown = settings.mode === 'countdown';
  const isRandom = isCountdown && settings.countdownMode === 'random';

  const activeCountdown = isRandom ? random : countdown;
  const activeMode = isCountdown ? activeCountdown : voice;

  const { status, count, isFlashing } = activeMode;
  const displayTarget = isCountdown ? activeCountdown.total : settings.target;

  const handleModeChange = useCallback((newMode: AppMode) => {
    if (newMode === settings.mode) return;
    voice.reset();
    countdown.reset();
    random.reset();
    closeAudioCtx();
    const next = { ...settings, mode: newMode };
    setSettings(next);
    saveSettings(next);
  }, [settings, voice, countdown, random]);

  const handleSettingsChange = useCallback((s: Settings) => {
    setSettings(s);
    saveSettings(s);
  }, []);

  const handleEffectChange = useCallback((v: VisualEffect) => {
    setSettings((prev) => {
      const next = { ...prev, visualEffect: v };
      saveSettings(next);
      return next;
    });
    setEffectMenuOpen(false);
  }, []);

  const handleStart = useCallback(async () => {
    if (isCountdown) {
      if (isRandom) {
        random.start();
      } else {
        countdown.start();
      }
    } else {
      try {
        await voice.startListening();
      } catch {
        // Error logged in hook
      }
    }
  }, [isCountdown, isRandom, random, countdown, voice]);

  const isRunning = status === 'listening' || status === 'paused';
  const currentEffect = EFFECT_OPTIONS.find((e) => e.key === settings.visualEffect) || EFFECT_OPTIONS[0];

  // PWA service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }, []);

  // Mobile orientation lock
  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth < 1024;
      const isLandscape = window.innerWidth > window.innerHeight;
      setOrientationBlocked(isMobile && isLandscape);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    const isMobile = window.innerWidth < 1024;
    if (isMobile && 'orientation' in screen && typeof (screen.orientation as any).lock === 'function') {
      (screen.orientation as any).lock('portrait').catch(() => {});
    }

    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  return (
    <>
      {orientationBlocked && (
        <div className="rotate-overlay">
          <div className="rotate-icon">📱</div>
          <div className="rotate-text">请竖屏使用</div>
          <div className="rotate-sub">旋转设备以获得最佳体验</div>
        </div>
      )}
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
              reverse={isCountdown}
            />
          </section>

          {isVoice && (
            <section className="section-volume">
              <VolumeMeter
                dbLevel={voice.dbLevel}
                threshold={settings.threshold}
                baseline={voice.baseline}
              />
            </section>
          )}

          {/* Visual effect selector */}
          <section className="section-effect">
            <div className="effect-toggle">
              <button
                className="effect-btn"
                onClick={() => setEffectMenuOpen(!effectMenuOpen)}
                title={currentEffect.label}
              >
                <span className="effect-icon">{currentEffect.icon}</span>
                <span className="effect-label">{currentEffect.label}</span>
              </button>
              {effectMenuOpen && (
                <div className="effect-menu">
                  {EFFECT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      className={`effect-option ${settings.visualEffect === opt.key ? 'active' : ''}`}
                      onClick={() => handleEffectChange(opt.key)}
                    >
                      <span className="effect-icon">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

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
            <button
              className={`panel-tab-only ${showSettings ? 'active' : ''}`}
              onClick={() => setShowSettings(!showSettings)}
            >
              设置
            </button>

            {showSettings && (
              <div className="panel-content">
                <SettingsPanel
                  settings={settings}
                  baseline={voice.baseline}
                  onChange={handleSettingsChange}
                  onCalibrate={voice.calibrate}
                  disabled={isRunning}
                />
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
