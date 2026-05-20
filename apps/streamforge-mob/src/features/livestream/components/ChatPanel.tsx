import React from "react";
import { View, Text, FlatList } from "react-native";
import { useLiveChat } from "../hooks/useLiveChat";

type ChatPanelProps = {
  streamId?: string;
};

export function ChatPanel({ streamId }: ChatPanelProps) {
  const { messages } = useLiveChat(streamId);

  return (
    <View
      style={{
        height: 220,
        padding: 12,
        backgroundColor: "#111",
        borderRadius: 12,
        marginBottom: 16,
      }}
    >
      <Text style={{ color: "#fff", marginBottom: 8, fontWeight: "600" }}>
        Live Chat
      </Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ color: "#f9fafb", fontWeight: "700" }}>
              {item.user}
            </Text>
            <Text style={{ color: "#d1d5db" }}>{item.text}</Text>
          </View>
        )}
      />
    </View>
  );
}
