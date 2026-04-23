import type { TimePeriod } from '../api/recipeApi';

// 4구간 매핑 (확정 정책)
// 아침 05-10 / 점심 10-14 / 저녁 14-21 / 야식 21-05
export function getCurrentPeriod(now: Date = new Date()): TimePeriod {
  const h = now.getHours();
  if (h >= 5 && h < 10) return 'breakfast';
  if (h >= 10 && h < 14) return 'lunch';
  if (h >= 14 && h < 21) return 'dinner';
  return 'midnight';
}

export interface TimeCopy {
  greetingKicker: string;     // 홈 캐릭터 인사말 앞 단어 ("아침이네요!")
  sectionKicker: string;      // "아침", "점심" 등 짧은 pill 텍스트
  sectionEmoji: string;       // pill 앞에 붙는 이모지 (🌅 🍜 🍲 🌙)
  sectionTitle: string;       // 시간대별 추천 섹션 타이틀
}

export const TIME_COPY: Record<TimePeriod, TimeCopy> = {
  breakfast: {
    greetingKicker: '아침이네요',
    sectionKicker: '아침',
    sectionEmoji: '🌅',
    sectionTitle: '아침 한 끼',
  },
  lunch: {
    greetingKicker: '점심이네요',
    sectionKicker: '점심',
    sectionEmoji: '🍜',
    sectionTitle: '점심 뭐 먹지?',
  },
  dinner: {
    greetingKicker: '저녁이네요',
    sectionKicker: '저녁',
    sectionEmoji: '🍲',
    sectionTitle: '저녁에 어울리는 한 끼',
  },
  midnight: {
    greetingKicker: '야식 시간이네요',
    sectionKicker: '야식',
    sectionEmoji: '🌙',
    sectionTitle: '야식 땡길 땐',
  },
};
