import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Animated, Alert } from 'react-native';
import { createRoute, useNavigation } from '@granite-js/react-native';
import { getTossShareLink, share } from '@apps-in-toss/native-modules';
import { InlineAd, loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/framework';
import {
  getTodayQuote,
  getRerollQuote,
  MBTI_LIST,
} from '../src/data/quotes';
import {
  getRerolledQuote,
  setRerolledQuote,
  recordVisitAndGetStreak,
  type StreakData,
} from '../src/storage';

export const Route = createRoute('/result', {
  validateParams: (params: unknown) => params as { mbtiType: string },
  component: ResultScreen,
});

// ── 광고 그룹 ID (TODO: 실제 ID로 교체) ──
const AD_GROUP_BANNER = '__PLACEHOLDER_AD_GROUP_ID__';
const AD_GROUP_REWARDED = '__PLACEHOLDER_REWARDED_AD_ID__';

/** 콜백 기반 전면 광고를 Promise로 래핑 */
function showRewardedAdAsync(adGroupId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // 사전 로딩 (심사 필수: 재생 시점에 실시간 로딩 금지)
    loadFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          // 로딩 완료 → 광고 표시
          showFullScreenAd({
            options: { adGroupId },
            onEvent: (showEvent) => {
              if (showEvent.type === 'userEarnedReward') {
                resolve(true);
              } else if (showEvent.type === 'dismissed') {
                // 보상 없이 닫힘
                resolve(false);
              }
            },
            onError: (err) => reject(err),
          });
        }
      },
      onError: (err) => reject(err),
    });
  });
}

function ResultScreen() {
  const navigation = useNavigation();
  const { mbtiType } = Route.useParams();
  const mbtiInfo = MBTI_LIST.find((m) => m.type === mbtiType);

  const [quote, setQuote] = useState(() => getTodayQuote(mbtiType));
  const [showAd, setShowAd] = useState(true);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [streak, setStreak] = useState<StreakData | null>(null);

  // 카드 애니메이션
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // 초기화: 상태 복원 + 출석 기록
  useEffect(() => {
    let mounted = true;
    async function init() {
      const [savedQuote, streakData] = await Promise.all([
        getRerolledQuote(mbtiType),
        recordVisitAndGetStreak(),
      ]);
      if (!mounted) return;
      if (savedQuote) setQuote(savedQuote);
      setStreak(streakData);
    }
    init();
    return () => { mounted = false; };
  }, [mbtiType]);

  // 카드 등장 애니메이션
  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
    ]).start();
  }, [quote, fadeAnim, scaleAnim]);

  // 오늘 날짜
  const today = new Date();
  const dateLabel = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  // 최신 배지
  const latestBadge = streak?.badges[streak.badges.length - 1];

  // ── 공유하기 ──
  const handleShare = useCallback(async () => {
    try {
      const shareLink = await getTossShareLink('intoss://dayword-mbti');
      const message = `[오늘의 한마디 - ${mbtiType}]\n\n"${quote}"\n\n나도 받아보기: ${shareLink}`;
      await share({ message });
    } catch {
      Alert.alert('안내', '공유하기를 사용할 수 없어요. 잠시 후 다시 시도해주세요.');
    }
  }, [mbtiType, quote]);

  // ── 궁합 한마디 ──
  const handleCompat = useCallback(() => {
    navigation.navigate('/compat', { myType: mbtiType, partnerType: '' });
  }, [navigation, mbtiType]);

  // ── 다시 뽑기 (리워드 광고) ──
  const handleReroll = useCallback(async () => {
    if (isAdLoading) return;
    setIsAdLoading(true);

    try {
      const rewarded = await showRewardedAdAsync(AD_GROUP_REWARDED);

      if (!rewarded) {
        // 광고 끝까지 시청하지 않음 — 보상 미지급 (심사 필수: 끝까지 시청 시 보상)
        return;
      }

      // 보상 지급: 새 문구로 교체
      const newQuote = getRerollQuote(mbtiType);
      setQuote(newQuote);

      await setRerolledQuote(mbtiType, newQuote);
    } catch {
      Alert.alert('안내', '광고를 불러올 수 없어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsAdLoading(false);
    }
  }, [isAdLoading, mbtiType]);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 출석 스트릭 */}
        {streak && streak.currentStreak > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 16, gap: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#F8F7FF',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E8E5FF',
              }}
            >
              <Text style={{ fontSize: 13, color: '#6C5CE7', fontWeight: '600' }}>
                {streak.currentStreak}일 연속
              </Text>
            </View>
            {latestBadge && (
              <View style={{ backgroundColor: '#6C5CE7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 }}>
                <Text style={{ fontSize: 11, color: '#ffffff', fontWeight: '700' }}>
                  {latestBadge === 'collector' ? '수집가' : latestBadge === 'enthusiast' ? '애호가' : '마스터'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* MBTI 정보 헤더 */}
        <View style={{ alignItems: 'center', paddingTop: streak ? 12 : 32, paddingBottom: 16, gap: 4 }}>
          <Text style={{ fontSize: 36 }}>{mbtiInfo?.emoji ?? '✨'}</Text>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#1a1a1a' }}>{mbtiType}</Text>
          <Text style={{ fontSize: 14, color: '#6C5CE7', fontWeight: '600' }}>{mbtiInfo?.name ?? ''}</Text>
          <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>{dateLabel}</Text>
        </View>

        {/* 오늘의 한마디 카드 */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            marginHorizontal: 20,
            marginTop: 8,
          }}
        >
          <View
            style={{
              backgroundColor: '#F8F7FF',
              borderRadius: 20,
              padding: 28,
              borderWidth: 1,
              borderColor: '#E8E5FF',
              shadowColor: '#6C5CE7',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 14, color: '#6C5CE7', fontWeight: '600', marginBottom: 12 }}>
              오늘의 한마디
            </Text>
            <Text style={{ fontSize: 18, color: '#1a1a1a', lineHeight: 28, fontWeight: '500' }}>
              "{quote}"
            </Text>
          </View>
        </Animated.View>

        {/* 궁합 한마디 버튼 */}
        <Pressable
          style={({ pressed }) => ({
            marginHorizontal: 20,
            marginTop: 16,
            height: 48,
            borderRadius: 12,
            backgroundColor: pressed ? '#F0EDFF' : '#F8F7FF',
            borderWidth: 1,
            borderColor: '#E8E5FF',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 6,
          })}
          onPress={handleCompat}
        >
          <Text style={{ fontSize: 14, color: '#6C5CE7', fontWeight: '600' }}>
            MBTI 궁합 한마디 보기
          </Text>
        </Pressable>

        {/* 배너 광고 — 스크롤 가능 영역 내 배치 (심사 필수) */}
        {showAd && (
          <View style={{ marginHorizontal: 20, marginTop: 20, borderRadius: 12, overflow: 'hidden' }}>
            <InlineAd
              adGroupId={AD_GROUP_BANNER}
              theme="light"
              tone="blackAndWhite"
              variant="card"
              impressFallbackOnMount={true}
              onNoFill={() => setShowAd(false)}
              onAdFailedToRender={() => setShowAd(false)}
            />
          </View>
        )}
      </ScrollView>

      {/* 하단 버튼 영역 */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 32,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          backgroundColor: '#ffffff',
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            style={({ pressed }) => ({
              flex: 1,
              height: 50,
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center' as const,
              backgroundColor: pressed ? '#5A4BD1' : '#6C5CE7',
            })}
            onPress={handleShare}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#ffffff' }}>공유하기</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => ({
              flex: 1,
              height: 50,
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center' as const,
              backgroundColor: pressed ? '#2563eb' : '#3b82f6',
            })}
            onPress={handleCompat}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#ffffff' }}>궁합 한마디</Text>
          </Pressable>
        </View>
        <Pressable
          style={({ pressed }) => ({
            height: 50,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center' as const,
            backgroundColor: pressed ? '#e5e7eb' : '#f3f4f6',
            borderWidth: 1,
            borderColor: '#d1d5db',
            flexDirection: 'row',
            gap: 6,
            opacity: isAdLoading ? 0.5 : 1,
          })}
          onPress={handleReroll}
          disabled={isAdLoading}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#374151' }}>
            광고 보고 다시 뽑기
          </Text>
          <Text style={{ fontSize: 12, color: '#9ca3af' }}>무료</Text>
        </Pressable>
      </View>
    </View>
  );
}
