type VoiceCommand = 'next' | 'repeat' | null;
type CommandCallback = (command: VoiceCommand) => void;

let Voice: any = null;

try {
  Voice = require('@react-native-voice/voice').default;
} catch {
  // Native module not available (Expo Go)
}

class STTService {
  private callback: CommandCallback | null = null;
  private isListening = false;
  private available = !!Voice;

  constructor() {
    if (!Voice) return;
    Voice.onSpeechResults = this.onResults.bind(this);
    Voice.onSpeechError = this.onError.bind(this);
  }

  private onResults(e: any) {
    const results = e.value ?? [];
    for (const text of results) {
      const lower = text.toLowerCase();
      if (lower.includes('다음') || lower.includes('next')) {
        this.callback?.('next');
        return;
      }
      if (lower.includes('반복') || lower.includes('repeat') || lower.includes('다시')) {
        this.callback?.('repeat');
        return;
      }
    }
  }

  private onError() {
    if (this.isListening && this.callback) {
      this.startListening(this.callback);
    }
  }

  async startListening(callback: CommandCallback) {
    if (!this.available) return;
    this.callback = callback;
    this.isListening = true;
    try {
      await Voice.start('ko-KR');
    } catch {
      // ignore
    }
  }

  async stopListening() {
    if (!this.available) return;
    this.isListening = false;
    this.callback = null;
    try {
      await Voice.stop();
    } catch {
      // ignore
    }
  }

  destroy() {
    this.isListening = false;
    this.callback = null;
    if (this.available) {
      Voice.destroy();
    }
  }

  isAvailable() {
    return this.available;
  }
}

export const sttService = new STTService();
