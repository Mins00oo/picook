import type { TimePeriod } from '../api/recipeApi';

// 4구간 매핑 (확정 정책)
// 아침 06-10 / 점심 10-15 / 저녁 15-21 / 야식 21-06
// (오후 구간은 저녁 추천에 흡수 — 사용자가 오후에 미리 저녁 메뉴를 검색하는 패턴 반영)
export function getCurrentPeriod(now: Date = new Date()): TimePeriod {
  const h = now.getHours();
  if (h >= 6 && h < 10) return 'breakfast';
  if (h >= 10 && h < 15) return 'lunch';
  if (h >= 15 && h < 21) return 'dinner';
  return 'midnight';
}

export interface TimeCopy {
  greetingKicker: string;     // 홈 캐릭터 인사말 (완성형 문장)
  sectionKicker: string;      // pill 텍스트
  sectionEmoji: string;       // pill 앞 이모지
  sectionTitle: string;       // 시간대별 추천 섹션 타이틀
}

export const TIME_COPY: Record<TimePeriod, TimeCopy> = {
  breakfast: {
    greetingKicker: '지금은 아침 시간이에요',
    sectionKicker: '아침',
    sectionEmoji: '🌅',
    sectionTitle: '아침에 어울리는 메뉴',
  },
  lunch: {
    greetingKicker: '지금은 점심 시간이에요',
    sectionKicker: '점심',
    sectionEmoji: '☀️',
    sectionTitle: '점심에 어울리는 메뉴',
  },
  dinner: {
    greetingKicker: '지금은 저녁 시간이에요',
    sectionKicker: '저녁',
    sectionEmoji: '🌆',
    sectionTitle: '저녁에 어울리는 메뉴',
  },
  midnight: {
    greetingKicker: '지금은 야식 시간이에요',
    sectionKicker: '야식',
    sectionEmoji: '🌙',
    sectionTitle: '야식에 어울리는 메뉴',
  },
};
