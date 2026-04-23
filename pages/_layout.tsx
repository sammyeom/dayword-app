import { PropsWithChildren } from 'react';
import { View } from 'react-native';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {children}
    </View>
  );
}
