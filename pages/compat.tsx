import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, useWindowDimensions } from 'react-native';
import { createRoute, useNavigation } from '@granite-js/react-native';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/framework';
import { MBTI_LIST, type MbtiType } from '../src/data/quotes';

export const Route = createRoute('/compat', {
  validateParams: (params: unknown) => params as { myType: string; partnerType: string },
  component: CompatScreen,
});

// ── 광고 그룹 ID (TODO: 실제 ID로 교체) ──
const AD_GROUP_REWARDED_COMPAT = '__PLACEHOLDER_REWARDED_COMPAT_AD_ID__';

/** 콜백 기반 전면 광고를 Promise로 래핑 */
function showRewardedAdAsync(adGroupId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    loadFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          showFullScreenAd({
            options: { adGroupId },
            onEvent: (showEvent) => {
              if (showEvent.type === 'userEarnedReward') {
                resolve(true);
              } else if (showEvent.type === 'dismissed') {
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

function CompatScreen() {
  const navigation = useNavigation();
  const { myType } = Route.useParams();
  const { width } = useWindowDimensions();
  const myInfo = MBTI_LIST.find((m) => m.type === myType);

  const [isAdLoading, setIsAdLoading] = useState(false);

  const buttonSize = (width - 32 - 8 * 3) / 4;

  // 상대 MBTI 선택 → 광고 → 결과 화면으로 이동
  const handleSelectPartner = useCallback(async (partnerType: string) => {
    if (isAdLoading) return;
    setIsAdLoading(true);

    try {
      const rewarded = await showRewardedAdAsync(AD_GROUP_REWARDED_COMPAT);

      if (!rewarded) return;

      // 광고 시청 완료 → 결과 화면으로 이동
      navigation.navigate('/compat-result', { myType, partnerType });
    } catch {
      Alert.alert('안내', '광고를 불러올 수 없어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsAdLoading(false);
    }
  }, [isAdLoading, myType, navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* 헤더 */}
        <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 24, gap: 4 }}>
          <Text style={{ fontSize: 28 }}>{myInfo?.emoji ?? '✨'}</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#1a1a1a' }}>
            {myType} 궁합 한마디
          </Text>
          <Text style={{ fontSize: 13, color: '#9ca3af' }}>
            상대의 MBTI를 선택하세요
          </Text>
        </View>

        {/* MBTI 선택 그리드 */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {MBTI_LIST.map((item: MbtiType) => (
            <Pressable
              key={item.type}
              style={({ pressed }) => ({
                width: buttonSize,
                height: buttonSize,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: pressed ? '#6C5CE7' : '#d1d5db',
                backgroundColor: pressed ? '#F8F7FF' : 'transparent',
                alignItems: 'center' as const,
                justifyContent: 'center' as const,
                gap: 2,
                opacity: isAdLoading ? 0.5 : 1,
              })}
              onPress={() => handleSelectPartner(item.type)}
              disabled={isAdLoading}
            >
              <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1a1a1a' }}>
                {item.type}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 하단 버튼 */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 32,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          backgroundColor: '#ffffff',
        }}
      >
        <Pressable
          style={({ pressed }) => ({
            height: 50,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center' as const,
            backgroundColor: pressed ? '#e5e7eb' : '#f3f4f6',
            borderWidth: 1,
            borderColor: '#d1d5db',
          })}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#374151' }}>돌아가기</Text>
        </Pressable>
      </View>
    </View>
  );
}
