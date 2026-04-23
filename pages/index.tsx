import React from 'react';
import { View, Text } from 'react-native';
import { createRoute, useNavigation } from '@granite-js/react-native';

export const Route = createRoute('/', {
  validateParams: (params: unknown) => params,
  component: IndexScreen,
});

function IndexScreen() {
  const navigation = useNavigation();
  React.useEffect(() => {
    navigation.navigate('/home', {});
  }, [navigation]);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <Text style={{ fontSize: 16, color: '#6b7280' }}>로딩 중...</Text>
    </View>
  );
}
