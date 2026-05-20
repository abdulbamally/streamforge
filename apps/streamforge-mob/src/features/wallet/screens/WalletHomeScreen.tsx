import React from 'react';
import { View, Text, Button } from 'react-native';

export function WalletHomeScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Wallet</Text>
      <Text style={{ marginTop: 8, color: '#6b7280' }}>Track your balance, earnings, and payout requests.</Text>
      <View style={{ marginTop: 24, padding: 16, backgroundColor: '#111827', borderRadius: 12 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600' }}>Balance</Text>
        <Text style={{ color: '#9ca3af', marginTop: 12 }}>$0.00</Text>
      </View>
      <Button title="Request Payout" onPress={() => {}} />
    </View>
  );
}
