import type { RecipeStep } from '../types/recipe';
import type { CoachingStatus } from '../types/coaching';

export type CoachingEvent =
  | { type: 'STEP_CHANGED'; step: number }
  | { type: 'STATUS_CHANGED'; status: CoachingStatus }
  | { type: 'TIMER_TICK'; remaining: number }
  | { type: 'TIMER_DONE' }
  | { type: 'COMPLETED' };

type EventListener = (event: CoachingEvent) => void;

export class CoachingEngine {
  private steps: RecipeStep[] = [];
  private currentStep = 0;
  private status: CoachingStatus = 'IDLE';
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private remainingSeconds = 0;
  private listeners: EventListener[] = [];

  init(steps: RecipeStep[]) {
    this.steps = steps;
    this.currentStep = 0;
    this.status = 'IDLE';
    this.clearTimer();
  }

  start() {
    this.status = 'PLAYING';
    this.emit({ type: 'STATUS_CHANGED', status: 'PLAYING' });
    this.emit({ type: 'STEP_CHANGED', step: 0 });
    this.processCurrentStep();
  }

  next() {
    if (this.currentStep >= this.steps.length - 1) {
      this.complete();
      return;
    }
    this.clearTimer();
    this.currentStep++;
    this.emit({ type: 'STEP_CHANGED', step: this.currentStep });
    this.processCurrentStep();
  }

  prev() {
    if (this.currentStep <= 0) return;
    this.clearTimer();
    this.currentStep--;
    this.status = 'PLAYING';
    this.emit({ type: 'STATUS_CHANGED', status: 'PLAYING' });
    this.emit({ type: 'STEP_CHANGED', step: this.currentStep });
    this.processCurrentStep();
  }

  repeat() {
    this.clearTimer();
    this.emit({ type: 'STEP_CHANGED', step: this.currentStep });
    this.processCurrentStep();
  }

  pause() {
    this.status = 'PAUSED';
    this.clearTimer();
    this.emit({ type: 'STATUS_CHANGED', status: 'PAUSED' });
  }

  resume() {
    this.status = 'PLAYING';
    this.emit({ type: 'STATUS_CHANGED', status: 'PLAYING' });
    this.processCurrentStep();
  }

  private processCurrentStep() {
    const step = this.steps[this.currentStep];
    if (!step) return;

    if (step.stepType === 'WAIT' && step.durationSeconds) {
      this.startTimer(step.durationSeconds);
    }
  }

  private startTimer(seconds: number) {
    this.clearTimer();
    this.remainingSeconds = seconds;
    this.status = 'WAITING';
    this.emit({ type: 'STATUS_CHANGED', status: 'WAITING' });

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.emit({ type: 'TIMER_TICK', remaining: this.remainingSeconds });

      if (this.remainingSeconds <= 0) {
        this.clearTimer();
        this.emit({ type: 'TIMER_DONE' });
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private complete() {
    this.clearTimer();
    this.status = 'COMPLETED';
    this.emit({ type: 'STATUS_CHANGED', status: 'COMPLETED' });
    this.emit({ type: 'COMPLETED' });
  }

  on(listener: EventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(event: CoachingEvent) {
    this.listeners.forEach((l) => l(event));
  }

  getCurrentStep() {
    return this.steps[this.currentStep];
  }

  getStepIndex() {
    return this.currentStep;
  }

  getTotalSteps() {
    return this.steps.length;
  }

  getStatus() {
    return this.status;
  }

  getRemainingSeconds() {
    return this.remainingSeconds;
  }

  destroy() {
    this.clearTimer();
    this.listeners = [];
  }
}
