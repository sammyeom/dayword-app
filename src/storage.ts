import { Storage } from '@apps-in-toss/native-modules';

// ── 키 생성 ──

function rerollKey(dateStr: string): string {
  return `reroll_used_${dateStr}`;
}

// ── 날짜 유틸 ──

export function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ── 다시 뽑기 상태 ──

export async function getIsRerolledToday(): Promise<boolean> {
  const val = await Storage.getItem(rerollKey(todayString()));
  return val === 'true';
}

export async function setRerolledToday(): Promise<void> {
  await Storage.setItem(rerollKey(todayString()), 'true');
}

/** 다시 뽑기로 선택된 문구를 저장 (앱 재시작 시 복원용) */
export async function getRerolledQuote(mbtiType: string): Promise<string | null> {
  return Storage.getItem(`reroll_quote_${mbtiType}_${todayString()}`);
}

export async function setRerolledQuote(mbtiType: string, quote: string): Promise<void> {
  await Storage.setItem(`reroll_quote_${mbtiType}_${todayString()}`, quote);
}

// ── 출석 스트릭 ──

const STREAK_KEY = 'streak_data';

export interface StreakData {
  currentStreak: number;
  lastVisitDate: string;
  longestStreak: number;
  badges: string[]; // 'collector' | 'enthusiast' | 'master'
}

const BADGE_THRESHOLDS = [
  { days: 7, id: 'collector', label: '한마디 수집가' },
  { days: 30, id: 'enthusiast', label: '한마디 애호가' },
  { days: 90, id: 'master', label: '한마디 마스터' },
] as const;

export function getBadgeLabel(id: string): string {
  return BADGE_THRESHOLDS.find((b) => b.id === id)?.label ?? id;
}

export function getAllBadges() {
  return BADGE_THRESHOLDS;
}

export async function getStreakData(): Promise<StreakData> {
  const raw = await Storage.getItem(STREAK_KEY);
  if (raw) return JSON.parse(raw);
  return { currentStreak: 0, lastVisitDate: '', longestStreak: 0, badges: [] };
}

export async function recordVisitAndGetStreak(): Promise<StreakData> {
  const today = todayString();
  const data = await getStreakData();

  // 이미 오늘 방문했으면 그대로 반환
  if (data.lastVisitDate === today) return data;

  // 어제 방문했으면 연속, 아니면 리셋
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  if (data.lastVisitDate === yesterday) {
    data.currentStreak += 1;
  } else {
    data.currentStreak = 1;
  }

  data.lastVisitDate = today;
  if (data.currentStreak > data.longestStreak) {
    data.longestStreak = data.currentStreak;
  }

  // 배지 해금 체크
  for (const badge of BADGE_THRESHOLDS) {
    if (data.currentStreak >= badge.days && !data.badges.includes(badge.id)) {
      data.badges.push(badge.id);
    }
  }

  await Storage.setItem(STREAK_KEY, JSON.stringify(data));
  return data;
}
