import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class TimerManager {
  private timerId: ReturnType<typeof setInterval> | null = null;
  private remaining = 0;
  private onTick: ((remaining: number) => void) | null = null;
  private onComplete: (() => void) | null = null;

  start(
    seconds: number,
    onTick: (remaining: number) => void,
    onComplete: () => void,
  ) {
    this.stop();
    this.remaining = seconds;
    this.onTick = onTick;
    this.onComplete = onComplete;

    this.timerId = setInterval(() => {
      this.remaining--;
      this.onTick?.(this.remaining);

      if (this.remaining <= 0) {
        this.stop();
        this.scheduleLocalNotification();
        this.onComplete?.();
      }
    }, 1000);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  getRemainingSeconds() {
    return this.remaining;
  }

  private async scheduleLocalNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Picook',
          body: '타이머가 완료되었어요! 다음 단계로 이동하세요.',
          sound: true,
        },
        trigger: null,
      });
    } catch {
      // Permissions might not be granted
    }
  }

  destroy() {
    this.stop();
    this.onTick = null;
    this.onComplete = null;
  }
}
