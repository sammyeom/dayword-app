import React from 'react';
import { View, Text } from 'react-native';

export default function NotFound() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <Text style={{ fontSize: 16, color: '#6b7280' }}>페이지를 찾을 수 없어요</Text>
    </View>
  );
}
