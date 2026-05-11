import React from "react";
import { View, Text } from "react-native";

export function CommunityHomeScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Community Hub</Text>
      <Text style={{ marginTop: 12, color: "#6b7280" }}>
        Future community features and group interactions will appear here.
      </Text>
    </View>
  );
}
