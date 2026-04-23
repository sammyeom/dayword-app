import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { createRoute, useNavigation } from '@granite-js/react-native';
import { MBTI_LIST, type MbtiType } from '../src/data/quotes';
import { getStreakData, getAllBadges, getBadgeLabel, type StreakData } from '../src/storage';

const GRID_PADDING = 16;
const GRID_GAP = 8;

export const Route = createRoute('/home', {
  validateParams: (params: unknown) => params,
  component: HomeScreen,
});

function HomeScreen() {
  const { width } = useWindowDimensions();
  const buttonWidth = (width - GRID_PADDING * 2 - GRID_GAP * 3) / 4;
  const buttonHeight = Math.round(buttonWidth * 1.25);
  const navigation = useNavigation();

  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    getStreakData().then(setStreak);
  }, []);

  const handleSelect = useCallback(
    (mbtiType: string) => navigation.navigate('/result', { mbtiType }),
    [navigation],
  );

  const badges = getAllBadges();

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ flex: 1, paddingHorizontal: GRID_PADDING }}>
        {/* 앱 헤더 */}
        <View style={{ paddingVertical: 24, alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#1a1a1a' }}>오늘의 한마디</Text>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>내 MBTI를 선택하세요</Text>
        </View>

        {/* 출석 스트릭 표시 */}
        {streak && streak.currentStreak > 0 && (
          <View style={{ marginBottom: 16, alignItems: 'center', gap: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#F8F7FF',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E8E5FF',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#6C5CE7' }}>
                {streak.currentStreak}일 연속 출석
              </Text>
              <Text style={{ fontSize: 12, color: '#A29BFE' }}>
                최장 {streak.longestStreak}일
              </Text>
            </View>

            {/* 배지 목록 */}
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {badges.map((badge) => {
                const earned = streak.badges.includes(badge.id);
                return (
                  <View
                    key={badge.id}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: earned ? '#6C5CE7' : '#f3f4f6',
                      borderWidth: 1,
                      borderColor: earned ? '#6C5CE7' : '#e5e7eb',
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: earned ? '#ffffff' : '#9ca3af' }}>
                      {getBadgeLabel(badge.id)} {badge.days}일
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* MBTI 선택 그리드 */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, justifyContent: 'center' }}>
          {MBTI_LIST.map((item: MbtiType) => (
            <MbtiButton
              key={item.type}
              item={item}
              onPress={handleSelect}
              buttonWidth={buttonWidth}
              buttonHeight={buttonHeight}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function MbtiButton({
  item,
  onPress,
  buttonWidth,
  buttonHeight,
}: {
  item: MbtiType;
  onPress: (type: string) => void;
  buttonWidth: number;
  buttonHeight: number;
}) {
  return (
    <Pressable
      style={({ pressed }) => ({
        width: buttonWidth,
        height: buttonHeight,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: pressed ? '#6C5CE7' : '#d1d5db',
        backgroundColor: pressed ? '#6C5CE7' : 'transparent',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingHorizontal: 4,
        gap: 2,
      })}
      onPress={() => onPress(item.type)}
    >
      {({ pressed }) => (
        <>
          <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: pressed ? '#ffffff' : '#1a1a1a' }}>{item.type}</Text>
          <Text style={{ fontSize: 11, color: pressed ? '#e0d9ff' : '#666666', textAlign: 'center' }}>{item.name}</Text>
        </>
      )}
    </Pressable>
  );
}
