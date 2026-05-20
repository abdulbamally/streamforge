import React from 'react';
import { View, Text } from 'react-native';

export function WalletBalanceCard({ balance }: { balance: string }) {
  return (
    <View style={{ padding: 16, backgroundColor: '#111', borderRadius: 12, marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 16 }}>Current Wallet Balance</Text>
      <Text style={{ color: '#10b981', fontSize: 28, fontWeight: '700', marginTop: 8 }}>{balance}</Text>
    </View>
  );
}
