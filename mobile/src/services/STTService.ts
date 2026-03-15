import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';

type VoiceCommand = 'next' | 'repeat' | null;
type CommandCallback = (command: VoiceCommand) => void;

class STTService {
  private callback: CommandCallback | null = null;
  private isListening = false;

  constructor() {
    Voice.onSpeechResults = this.onResults.bind(this);
    Voice.onSpeechError = this.onError.bind(this);
  }

  private onResults(e: SpeechResultsEvent) {
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
    // Silently restart if still supposed to be listening
    if (this.isListening) {
      this.startListening(this.callback!);
    }
  }

  async startListening(callback: CommandCallback) {
    this.callback = callback;
    this.isListening = true;
    try {
      await Voice.start('ko-KR');
    } catch {
      // Voice might not be available in simulator
    }
  }

  async stopListening() {
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
    Voice.destroy();
  }
}

export const sttService = new STTService();
