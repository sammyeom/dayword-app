// MBTI 유형 정보 및 오늘의 한마디 데이터

import { QUOTES_ISTJ, QUOTES_ISFJ, QUOTES_INFJ, QUOTES_INTJ } from './quotes-group1';
import { QUOTES_ISTP, QUOTES_ISFP, QUOTES_INFP, QUOTES_INTP } from './quotes-group2';
import { QUOTES_ESTP, QUOTES_ESFP, QUOTES_ENFP, QUOTES_ENTP } from './quotes-group3';
import { QUOTES_ESTJ, QUOTES_ESFJ, QUOTES_ENFJ, QUOTES_ENTJ } from './quotes-group4';

export interface MbtiType {
  type: string;
  name: string;
  emoji: string;
}

export const MBTI_LIST: MbtiType[] = [
  { type: 'ISTJ', name: '논리주의자', emoji: '🏛️' },
  { type: 'ISFJ', name: '수호자', emoji: '🛡️' },
  { type: 'INFJ', name: '옹호자', emoji: '🌌' },
  { type: 'INTJ', name: '전략가', emoji: '🎯' },
  { type: 'ISTP', name: '재주꾼', emoji: '🔧' },
  { type: 'ISFP', name: '예술가', emoji: '🎨' },
  { type: 'INFP', name: '중재자', emoji: '🌿' },
  { type: 'INTP', name: '사색가', emoji: '🔬' },
  { type: 'ESTP', name: '사업가', emoji: '🏄' },
  { type: 'ESFP', name: '연예인', emoji: '🎭' },
  { type: 'ENFP', name: '활동가', emoji: '🌟' },
  { type: 'ENTP', name: '변론가', emoji: '⚡' },
  { type: 'ESTJ', name: '관리자', emoji: '📋' },
  { type: 'ESFJ', name: '외교관', emoji: '🤝' },
  { type: 'ENFJ', name: '선도자', emoji: '🌈' },
  { type: 'ENTJ', name: '통솔자', emoji: '👑' },
];

// MBTI별 100개 문구
const QUOTES: Record<string, string[]> = {
  ISTJ: QUOTES_ISTJ,
  ISFJ: QUOTES_ISFJ,
  INFJ: QUOTES_INFJ,
  INTJ: QUOTES_INTJ,
  ISTP: QUOTES_ISTP,
  ISFP: QUOTES_ISFP,
  INFP: QUOTES_INFP,
  INTP: QUOTES_INTP,
  ESTP: QUOTES_ESTP,
  ESFP: QUOTES_ESFP,
  ENFP: QUOTES_ENFP,
  ENTP: QUOTES_ENTP,
  ESTJ: QUOTES_ESTJ,
  ESFJ: QUOTES_ESFJ,
  ENFJ: QUOTES_ENFJ,
  ENTJ: QUOTES_ENTJ,
};

// 날짜 기반 시드로 오늘의 문구 인덱스 계산
function getDateSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

function getTodayString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 오늘의 한마디 인덱스 (0~99)
export function getTodayQuoteIndex(mbtiType: string, offsetDays = 0): number {
  const dateStr = getTodayString(offsetDays);
  const seed = getDateSeed(dateStr + mbtiType);
  const quotes = QUOTES[mbtiType];
  const count = quotes ? quotes.length : 100;
  return seed % count;
}

// 오늘의 한마디 가져오기
export function getTodayQuote(mbtiType: string, offsetDays = 0): string {
  const quotes = QUOTES[mbtiType];
  if (!quotes) return '오늘도 좋은 하루 보내세요!';
  const idx = getTodayQuoteIndex(mbtiType, offsetDays);
  return quotes[idx] ?? '오늘도 좋은 하루 보내세요!';
}

// 다시 뽑기 — 오늘 문구 제외하고 랜덤 1개
export function getRerollQuote(mbtiType: string): string {
  const quotes = QUOTES[mbtiType];
  if (!quotes) return '새로운 한마디를 찾고 있어요!';
  const todayIdx = getTodayQuoteIndex(mbtiType);
  const others = quotes.filter((_, i) => i !== todayIdx);
  const randomIdx = Math.floor(Math.random() * others.length);
  return others[randomIdx] ?? '새로운 한마디를 찾고 있어요!';
}

