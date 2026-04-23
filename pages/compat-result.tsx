import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Animated, Alert } from 'react-native';
import { createRoute, useNavigation } from '@granite-js/react-native';
import { getTossShareLink, share } from '@apps-in-toss/native-modules';
import { MBTI_LIST } from '../src/data/quotes';
import { getCompatibility } from '../src/data/compatibility';

export const Route = createRoute('/compat-result', {
  validateParams: (params: unknown) => params as { myType: string; partnerType: string },
  component: CompatResultScreen,
});

function CompatResultScreen() {
  const navigation = useNavigation();
  const { myType, partnerType } = Route.useParams();
  const myInfo = MBTI_LIST.find((m) => m.type === myType);
  const partnerInfo = MBTI_LIST.find((m) => m.type === partnerType);
  const result = getCompatibility(myType, partnerType);

  // 카드 애니메이션
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // 점수에 따른 색상
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#6C5CE7';
    if (score >= 80) return '#3b82f6';
    if (score >= 60) return '#10b981';
    if (score >= 45) return '#f59e0b';
    return '#ef4444';
  };

  // 공유하기
  const handleShare = useCallback(async () => {
    try {
      const shareLink = await getTossShareLink('intoss://dayword-mbti');
      const message = `[오늘의 궁합 한마디]\n${myType} + ${partnerType} = ${result.label} (${result.score}점)\n\n"${result.quote}"\n\n💚 ${result.pro}\n⚠️ ${result.con}\n💡 ${result.tip}\n\n나도 확인하기: ${shareLink}`;
      await share({ message });
    } catch {
      Alert.alert('안내', '공유하기를 사용할 수 없어요.');
    }
  }, [myType, partnerType, result]);

  // 다른 궁합 보기 → 선택 화면으로 돌아감
  const handleTryAnother = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const scoreColor = getScoreColor(result.score);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 8 }}>
          <Text style={{ fontSize: 13, color: '#9ca3af' }}>오늘의 궁합 결과</Text>
        </View>

        {/* 결과 카드 */}
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
              alignItems: 'center',
              gap: 16,
            }}
          >
            {/* 두 MBTI 표시 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 36 }}>{myInfo?.emoji}</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a' }}>{myType}</Text>
              </View>
              <Text style={{ fontSize: 24, color: '#d1d5db' }}>+</Text>
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 36 }}>{partnerInfo?.emoji}</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a' }}>{partnerType}</Text>
              </View>
            </View>

            {/* 궁합 점수 */}
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 40, fontWeight: '800', color: scoreColor }}>
                {result.score}점
              </Text>
              <View
                style={{
                  backgroundColor: scoreColor,
                  paddingHorizontal: 14,
                  paddingVertical: 5,
                  borderRadius: 14,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>
                  {result.label}
                </Text>
              </View>
            </View>

            {/* 구분선 */}
            <View style={{ height: 1, backgroundColor: '#E8E5FF', width: '100%' }} />

            {/* 궁합 문구 */}
            <Text style={{ fontSize: 16, color: '#1a1a1a', lineHeight: 26, fontWeight: '500', textAlign: 'center' }}>
              "{result.quote}"
            </Text>

            {/* 구분선 */}
            <View style={{ height: 1, backgroundColor: '#E8E5FF', width: '100%' }} />

            {/* 잘 맞는 점 / 주의할 점 / 팁 */}
            <View style={{ gap: 12, width: '100%' }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Text style={{ fontSize: 16 }}>💚</Text>
                <Text style={{ flex: 1, fontSize: 14, color: '#374151', lineHeight: 22 }}>
                  {result.pro}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Text style={{ fontSize: 16 }}>⚠️</Text>
                <Text style={{ flex: 1, fontSize: 14, color: '#374151', lineHeight: 22 }}>
                  {result.con}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Text style={{ fontSize: 16 }}>💡</Text>
                <Text style={{ flex: 1, fontSize: 14, color: '#374151', lineHeight: 22 }}>
                  {result.tip}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* 하단 버튼 */}
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
        <Pressable
          style={({ pressed }) => ({
            height: 50,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center' as const,
            backgroundColor: pressed ? '#5A4BD1' : '#6C5CE7',
          })}
          onPress={handleShare}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#ffffff' }}>궁합 결과 공유하기</Text>
        </Pressable>
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
          onPress={handleTryAnother}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#374151' }}>다른 궁합 보기</Text>
        </Pressable>
      </View>
    </View>
  );
}
