# DiyPnshmt - Design Specification

**Date:** 2026-07-02
**Status:** Draft
**Deploy:** https://a85114418-debug.github.io/DiyPnshmt/

## 1. Overview

DiyPnshmt is a web-based counter tool with three counting modes, a recording-session system, voice announcements via Web Speech API, and a visual design based on Apple's design language. Built with React 18 + TypeScript + Vite, deployed to GitHub Pages.

### 1.1 Modes

| Mode | Mechanism | Feedback |
|------|-----------|----------|
| Voice Detection (声控计数) | Microphone listens → above threshold → count +1 | Beep sound (3 types) |
| Countdown (倒计时) | Timer decrements at fixed/random intervals → count -1 | Beep sound (3 types) |
| Voice Announce (语音报数) | Same trigger logic as Voice Detection | Female TTS speaks the number |

Modes are independent tabs. Mode switching resets all state.

### 1.2 Recording Sessions (replaces old log system)

A recording session is a user-initiated data collection span:

1. User creates a session (names it, e.g. "跳绳训练")
2. User clicks "Start Recording"
3. User clicks "Start" on the main control bar
4. Counting proceeds in any mode (user can switch modes mid-session)
5. User clicks "End Recording"
6. Summary saved: session name, start/end time, duration, positive counts, countdown counts, total

Sessions persist in localStorage. History panel lists sessions reverse-chronologically with detail view and delete.

---

## 2. Design System (Apple-inspired)

### 2.1 Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--clr-primary` | #0066cc | Single interactive accent (links, primary buttons, focus) |
| `--clr-primary-focus` | #0071e3 | Focus ring |
| `--clr-canvas` | #ffffff | Main background, cards |
| `--clr-parchment` | #f5f5f7 | Alternating section background, footer |
| `--clr-surface-dark-1` | #272729 | Dark tile |
| `--clr-surface-black` | #000000 | Nav bar |
| `--clr-ink` | #1d1d1f | Headlines, body text |
| `--clr-ink-muted` | #7a7a7a | Secondary text, disabled |
| `--clr-hairline` | #e0e0e0 | Card borders |
| `--clr-divider-soft` | #f0f0f0 | Soft dividers |
| `--clr-on-primary` | #ffffff | Text on primary buttons |
| `--clr-on-dark` | #ffffff | Text on dark surfaces |

### 2.2 Typography

Font stack: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
(No Google Fonts dependency — system fonts only, for speed and offline compatibility.)

| Token | Size | Weight | Line-height | Letter-spacing |
|-------|------|--------|-------------|----------------|
| Counter number | 96px | 600 | 1.0 | -0.02em |
| Mode label | 21px | 600 | 1.19 | 0 |
| Body | 17px | 400 | 1.47 | -0.022em |
| Caption | 14px | 400 | 1.43 | -0.016em |
| Fine print | 12px | 400 | 1.0 | -0.01em |

### 2.3 Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--rds-none` | 0 | Full-bleed sections |
| `--rds-sm` | 8px | Utility buttons |
| `--rds-md` | 11px | Secondary capsules |
| `--rds-lg` | 18px | Cards |
| `--rds-pill` | 9999px | Primary buttons, inputs |

### 2.4 Spacing

| Token | Value |
|-------|-------|
| `--sp-xxs` | 4px |
| `--sp-xs` | 8px |
| `--sp-sm` | 12px |
| `--sp-md` | 17px |
| `--sp-lg` | 24px |
| `--sp-xl` | 32px |
| `--sp-xxl` | 48px |
| `--sp-section` | 80px |

### 2.5 Component Specs

**Primary Button (pill)**
- bg: `--clr-primary`, text: `--clr-on-primary`
- radius: `--rds-pill`, padding: 11px 22px
- active: `transform: scale(0.95)`, focus: 2px solid `--clr-primary-focus`

**Secondary Button (ghost pill)**
- bg: transparent, text: `--clr-primary`, border: 1px `--clr-primary`
- radius: `--rds-pill`, padding: 11px 22px

**Card**
- bg: `--clr-canvas`, border: 1px `--clr-hairline`
- radius: `--rds-lg`, padding: `--sp-lg`

**Tabs**
- Inactive: transparent bg, `--clr-ink-muted` text
- Active: `--clr-primary` text, 2px bottom border

**Counter Dial**
- Large central number: 96px, weight 600
- Progress ring: `--clr-primary` stroke on `--clr-divider-soft` track
- Flash animation on count change: 300ms scale pulse + ring glow

---

## 3. Architecture

### 3.1 Directory Structure

```
DiyPnshmt/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── manifest.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── App.css
    ├── design-tokens.css          # All CSS custom properties
    ├── types/
    │   └── index.ts
    ├── utils/
    │   ├── audio.ts               # Web Audio API (volume detection)
    │   ├── beep.ts                # Beep sound generation
    │   ├── speech.ts              # Web Speech API (voice announcement)
    │   └── storage.ts             # localStorage helpers
    ├── hooks/
    │   ├── useAudioDetector.ts    # Voice detection mode
    │   ├── useCountdownTimer.ts    # Fixed countdown mode
    │   ├── useRandomCountdown.ts   # Random countdown mode
    │   ├── useSpeechSynthesis.ts   # Voice announcement logic
    │   └── useRecordingSession.ts  # Recording session state
    └── components/
        ├── CounterDial.tsx/.css    # Progress ring + number display
        ├── VolumeMeter.tsx/.css    # Real-time volume bar
        ├── ControlBar.tsx/.css     # Start/Pause/Resume/Reset
        ├── ModeTabs.tsx/.css       # Mode switcher
        ├── SettingsPanel.tsx/.css   # Settings per mode
        ├── VoiceSettings.tsx/.css   # Language + voice selection
        ├── EffectSwitcher.tsx/.css  # Visual effect selector
        ├── SessionRecorder.tsx/.css # Create/start/end recording
        ├── HistoryPanel.tsx/.css    # Past sessions list + detail
        └── ParticleEffect.tsx/.css  # Snow/sakura/rain particles
```

### 3.2 Data Flow

```
App (state owner)
├── settings: Settings          (localStorage persisted)
├── activeSession: Session | null
│
├── useAudioDetector(settings)    → voice mode state + actions
├── useCountdownTimer(settings)   → countdown mode state + actions
├── useRandomCountdown(settings)  → random countdown state + actions
├── useSpeechSynthesis(settings)  → TTS speak function
├── useRecordingSession()         → session CRUD + current session
│
└── → passes state down to UI components via props
```

### 3.3 Types

```ts
type AppMode = 'voice' | 'countdown' | 'announce';
type CountdownMode = 'fixed' | 'random';
type AppStatus = 'idle' | 'listening' | 'paused' | 'finished';
type SoundType = 'beep' | 'double-beep' | 'chime';
type VisualEffect = 'none' | 'snow' | 'sakura' | 'rain';
type VoiceLang = 'zh' | 'en';
type VoiceStyle = 'sweet' | 'mature';

interface Settings {
  mode: AppMode;
  // Voice detection
  threshold: number;      // 0-100 dB
  target: number;         // 1-9999
  initialCount: number;   // 0-9998
  cooldownMs: number;     // 200-5000
  // Countdown
  countdownMode: CountdownMode;
  countdownTotal: number;
  countdownInterval: number;
  randomCountdownTotal?: number;
  randomRangeMin?: number;
  randomRangeMax?: number;
  randomFrequency: number;
  // Voice announce
  voiceLang: VoiceLang;
  voiceStyle: VoiceStyle;
  selectedVoiceURI: string;  // specific SpeechSynthesisVoice URI
  // Sound
  soundType: SoundType;
  soundVolume: number;     // 0-1
  // Visual
  visualEffect: VisualEffect;
}

interface RecordingSession {
  id: string;
  name: string;
  startedAt: number;
  endedAt: number | null;
  positiveCount: number;    // voice/announce increments
  countdownCount: number;   // countdown decrements
  totalCount: number;
  modesUsed: AppMode[];
}
```

---

## 4. Component Details

### 4.1 CounterDial
- SVG ring: track (gray, 12px stroke) + progress (primary blue, 12px stroke, round caps)
- Center: large number (96px), target below (17px caption)
- Progress = count / target, percentage shown on ring
- Flash: on count change → number scales 1.08x for 300ms, ring glows

### 4.2 ModeTabs
- Three pills: 声控计数 / 倒计时 / 语音报数
- Active: primary blue text + bottom border
- Click switches app mode, resets all state

### 4.3 ControlBar
- Four buttons: Start / Pause / Resume / Reset
- Context-sensitive: show only relevant buttons based on status
- Start: pill primary button
- Pause/Resume/Reset: secondary ghost pills

### 4.4 SettingsPanel
- Content changes based on current mode
- Voice mode: threshold slider, target, initial count, cooldown
- Countdown mode: sub-mode tabs, total, interval, random range
- Announce mode: same as voice + language/vocie selector
- Sound section (all modes): sound type dropdown, volume slider

### 4.5 VoiceSettings
- Language toggle: 中文 / English (two pill buttons)
- Voice dropdown: lists all available SpeechSynthesisVoice filtered by selected language
- Each voice shows: name (e.g. "Microsoft Xiaoxiao - Chinese (Simplified)")

### 4.6 SessionRecorder
- When no active session: input field + "New Session" button
- When session active: session name displayed, "End Recording" button
- Session state indicator (recording dot animation)

### 4.7 HistoryPanel
- Session list: name, date, duration, count summary
- Click to expand: full detail view
- Delete button per session (with confirmation)

### 4.8 ParticleEffect
- Canvas-based particle system
- Three effects: snow (white circles drifting down), sakura (pink petals), rain (blue lines)
- Runs in background, low CPU via requestAnimationFrame

---

## 5. Technical Notes

### 5.1 Web Speech API
- `window.speechSynthesis.getVoices()` returns available voices
- Filter by `voice.lang.startsWith('zh')` or `.startsWith('en')`
- User selects a specific voice, URI stored in settings
- Fallback: if selected voice unavailable, use first matching language voice
- Speak on each count trigger: `speakCount(n, lang, voice)`

### 5.2 localStorage Keys
- `diyPnshmt_settings` — Settings object
- `diyPnshmt_sessions` — RecordingSession[]

### 5.3 GitHub Pages
- Vite `base: '/DiyPnshmt/'`
- `npm run deploy` → `vite build && gh-pages -d dist`
- .nojekyll file in public/ to allow underscore-prefixed files

### 5.4 Mobile
- Portrait lock on mobile (< 1024px)
- PWA: manifest.json + service worker
- Touch-friendly: 44px minimum touch targets

---

## 6. Implementation Order

1. Project scaffold: Vite + React + TS, directory structure
2. Design tokens CSS file
3. Types definitions
4. Utils: audio.ts, beep.ts, speech.ts, storage.ts
5. Hooks: useAudioDetector, useCountdownTimer, useRandomCountdown, useSpeechSynthesis, useRecordingSession
6. Components: CounterDial, ModeTabs, ControlBar, VolumeMeter
7. Components: SettingsPanel, VoiceSettings, EffectSwitcher
8. Components: SessionRecorder, HistoryPanel
9. Components: ParticleEffect
10. App.tsx assembly + App.css
11. Build, test, deploy
