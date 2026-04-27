import type { TimePeriod } from '../api/recipeApi';

// 5구간 매핑 (확정 정책)
// 아침 06-10 / 점심 10-14 / 오후 14-17 / 저녁 17-21 / 야식 21-06
export function getCurrentPeriod(now: Date = new Date()): TimePeriod {
  const h = now.getHours();
  if (h >= 6 && h < 10) return 'breakfast';
  if (h >= 10 && h < 14) return 'lunch';
  if (h >= 14 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'dinner';
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
    greetingKicker: '오늘 아침은 가볍게',
    sectionKicker: '아침',
    sectionEmoji: '🌅',
    sectionTitle: '아침 한 끼',
  },
  lunch: {
    greetingKicker: '오늘 점심은 든든하게',
    sectionKicker: '점심',
    sectionEmoji: '🍜',
    sectionTitle: '점심 뭐 먹지?',
  },
  afternoon: {
    greetingKicker: '오후엔 가볍게',
    sectionKicker: '오후',
    sectionEmoji: '🍵',
    sectionTitle: '오후 한 입',
  },
  dinner: {
    greetingKicker: '오늘 저녁은 따뜻하게',
    sectionKicker: '저녁',
    sectionEmoji: '🍲',
    sectionTitle: '저녁에 어울리는 한 끼',
  },
  midnight: {
    greetingKicker: '오늘 밤은 한 입만',
    sectionKicker: '야식',
    sectionEmoji: '🌙',
    sectionTitle: '야식 땡길 땐',
  },
};
