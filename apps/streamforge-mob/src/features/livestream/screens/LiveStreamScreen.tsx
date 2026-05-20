import React from "react";
import { View, Text, Button } from "react-native";
import { ChatPanel } from "../components/ChatPanel";

export function LiveStreamScreen() {
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#000" }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 16,
        }}
      >
        Live Stream
      </Text>
      <View
        style={{
          flex: 1,
          borderRadius: 12,
          backgroundColor: "#111",
          marginBottom: 16,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#9ca3af" }}>Live video preview placeholder</Text>
      </View>
      <ChatPanel />
      <Button title="Send Reaction" onPress={() => {}} />
    </View>
  );
}
