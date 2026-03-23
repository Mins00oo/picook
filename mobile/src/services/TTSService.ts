import * as Speech from 'expo-speech';

class TTSService {
  private speed: number = 1.0;
  private audioModeReady = false;
  private paused = false;

  setSpeed(speed: number) {
    this.speed = speed;
  }

  /**
   * iOS 무음 모드에서도 TTS가 나오도록 오디오 세션을 설정한다.
   * 첫 speak() 호출 시 자동으로 1회 실행된다.
   * expo-audio는 네이티브 모듈이므로 lazy-load 처리.
   */
  private async ensureAudioMode() {
    if (this.audioModeReady) return;
    try {
      const { AudioModule } = require('expo-audio');
      AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        shouldRouteThroughEarpiece: false,
      });
      this.audioModeReady = true;
    } catch {
      // 네이티브 모듈 미설치 또는 실패 — TTS 시도는 계속
    }
  }

  async speak(text: string): Promise<void> {
    await this.ensureAudioMode();
    this.paused = false;
    return new Promise((resolve) => {
      Speech.speak(text, {
        language: 'ko-KR',
        rate: this.speed,
        onDone: () => { this.paused = false; resolve(); },
        onStopped: () => { this.paused = false; resolve(); },
        onError: () => { this.paused = false; resolve(); },
      });
    });
  }

  /** 음성을 일시정지한다. resume()으로 이어서 재생 가능. */
  pause() {
    Speech.pause();
    this.paused = true;
  }

  /** 일시정지된 음성을 이어서 재생한다. */
  resume() {
    if (this.paused) {
      Speech.resume();
      this.paused = false;
    }
  }

  /** 음성을 완전히 중단한다. 이어서 재생 불가. */
  stop() {
    Speech.stop();
    this.paused = false;
  }

  isPaused(): boolean {
    return this.paused;
  }

  async isSpeaking(): Promise<boolean> {
    return Speech.isSpeakingAsync();
  }
}

export const ttsService = new TTSService();
