import React from "react";
import { View, Text, FlatList } from "react-native";
import { useSocialFeed } from "../hooks/useSocialFeed";

export function SocialFeed() {
  const { feed, isLoading } = useSocialFeed();

  if (isLoading) {
    return (
      <View
        style={{ padding: 16, backgroundColor: "#1f2937", borderRadius: 12 }}
      >
        <Text style={{ color: "#d1d5db" }}>Loading live feed…</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={feed}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={({ item }) => (
        <View
          style={{ padding: 16, backgroundColor: "#1f2937", borderRadius: 12 }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
            {item.title}
          </Text>
          <Text style={{ color: "#9ca3af", marginTop: 8 }}>
            {item.creatorName}
          </Text>
          <Text style={{ color: "#6ee7b7", marginTop: 8 }}>
            {item.isLive ? "LIVE · " : ""}
            {item.viewers} viewers · {item.category}
          </Text>
        </View>
      )}
    />
  );
}
