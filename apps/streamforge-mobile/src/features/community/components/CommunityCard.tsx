import React from 'react';
import { View, Text } from 'react-native';

export function CommunityCard() {
  return (
    <View style={{ padding: 16, backgroundColor: '#111827', borderRadius: 12, marginTop: 16 }}>
      <Text style={{ color: '#fff', fontWeight: '600' }}>Community preview</Text>
      <Text style={{ color: '#9ca3af', marginTop: 8 }}>Group interactions, events, and announcements.</Text>
    </View>
  );
}
