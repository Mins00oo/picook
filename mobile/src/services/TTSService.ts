import * as Speech from 'expo-speech';

class TTSService {
  private speed: number = 1.0;

  setSpeed(speed: number) {
    this.speed = speed;
  }

  async speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      Speech.speak(text, {
        language: 'ko-KR',
        rate: this.speed,
        onDone: resolve,
        onStopped: resolve,
        onError: () => resolve(),
      });
    });
  }

  stop() {
    Speech.stop();
  }

  async isSpeaking(): Promise<boolean> {
    return Speech.isSpeakingAsync();
  }
}

export const ttsService = new TTSService();
