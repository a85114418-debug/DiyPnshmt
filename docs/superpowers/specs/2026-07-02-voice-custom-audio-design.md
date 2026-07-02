# Voice Mode Beep + Custom Audio — Design

Date: 2026-07-02

## Problem

声控模式每次计数触发时没有提示音反馈，用户不确定是否已触发计数。倒计时模式已有提示音（`useCountdownTimer` 调用 `playSound()`），声控模式却没有。

用户还希望使用电脑本地的自定义音频文件，而非仅限内置合成音效。

## Design

### 1. SoundType 扩展

```ts
// types/index.ts
export type SoundType = 'beep' | 'double-beep' | 'chime' | 'custom';
```

### 2. 自定义音频播放

`public/audio/custom.mp3` — 固定路径的占位音频文件，随 git 提交。

用户替换此文件后重新构建部署，所有设备使用同一音频。

`beep.ts` 的 `playSound()` 新增 custom 分支：
- 先通过 `fetch('/audio/custom.mp3')` 获取音频数据
- 用 `AudioContext.decodeAudioData()` 解码
- 通过 `AudioBufferSourceNode` 播放

为避免每次触发都重新 fetch 和 decode，使用模块级缓存：首次加载后缓存在 `AudioBuffer` 中，后续触发直接从缓存播放。

`playFinishSound`（完成音）同理，但 custom 模式和普通触发音使用同一个文件。

### 3. 声控模式接入提示音

`useAudioDetector` 在计数触发处（`countRef.current += 1` 之后）调用 `playSound(settings.soundType, settings.soundVolume)`。

倒计时模式已有此调用，无需改动。

### 4. 设置面板

声控模式下也显示提示音类型和音量控件（当前只在倒计时设置中显示）。`SoundType` 下拉框增加"自定义音频"选项。

### 5. 文件清单

| 文件 | 改动 |
|------|------|
| `src/types/index.ts` | `SoundType` 增加 `'custom'` |
| `src/utils/beep.ts` | `playSound()`/`playFinishSound()` 增加 custom 分支，缓存 AudioBuffer |
| `src/hooks/useAudioDetector.ts` | 计数触发时调用 `playSound()` |
| `src/components/SettingsPanel.tsx` | 声控模式也显示音效选项；SOUND_OPTIONS 增加自定义音频 |
| `public/audio/custom.mp3` | **新建** — 占位音频文件 |

## Verification

1. `npm run build` 通过
2. 声控模式下，启动监听后用模拟音量触发计数，确认提示音播放
3. 切换到"自定义音频"后触发计数，确认播放的是 `custom.mp3`
4. 替换 `custom.mp3` 为其他音频文件，确认播放内容变化
5. 倒计时模式提示音功能不受影响
