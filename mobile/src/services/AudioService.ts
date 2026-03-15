import { Audio } from 'expo-av';

class AudioService {
  private sound: Audio.Sound | null = null;

  async playNotification() {
    try {
      // Simple beep via silence then system notification
      // In production, replace with actual notification sound asset
      const { sound } = await Audio.Sound.createAsync(
        { uri: '' },
        { shouldPlay: false },
      );
      this.sound = sound;
    } catch {
      // Asset might not exist yet — silently fail
    }
  }

  async stop() {
    try {
      await this.sound?.stopAsync();
      await this.sound?.unloadAsync();
      this.sound = null;
    } catch {
      // ignore
    }
  }
}

export const audioService = new AudioService();
