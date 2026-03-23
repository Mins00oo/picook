class AudioService {
  private player: any = null;

  async playNotification() {
    try {
      const { createAudioPlayer } = require('expo-audio');
      this.player = createAudioPlayer({ uri: '' });
    } catch {
      // 네이티브 모듈 미설치 또는 asset 없음 — silently fail
    }
  }

  async stop() {
    try {
      this.player?.remove();
      this.player = null;
    } catch {
      // ignore
    }
  }
}

export const audioService = new AudioService();
