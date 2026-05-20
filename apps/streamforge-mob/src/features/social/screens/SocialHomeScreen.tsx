import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SocialFeed } from "../components/SocialFeed";

export function SocialHomeScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 16 }}>
        Social Feed
      </Text>
      <SocialFeed />
    </ScrollView>
  );
}
