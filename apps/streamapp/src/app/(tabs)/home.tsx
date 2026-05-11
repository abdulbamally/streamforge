import { View, Text } from "react-native";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <View className="flex-1 bg-bg px-4 pt-10">
      {/* HEADER */}
      <View className="flex-row justify-between mb-6">
        <Text className="text-white">⚙️</Text>
        <Text className="text-white">☰</Text>
      </View>

      {/* BIG BUTTONS */}
      <View className="flex-row justify-between mb-6">
        <Button title="Stream" className="flex-1 mr-2" />
        <Button title="Record" className="flex-1 ml-2" />
      </View>

      {/* HISTORY */}
      <Text className="text-text mb-2">History</Text>

      <View className="bg-surface p-4 rounded-xl mb-2">
        <Text className="text-text">Live Stream</Text>
        <Text className="text-muted">10 min • Today</Text>
      </View>
    </View>
  );
}
