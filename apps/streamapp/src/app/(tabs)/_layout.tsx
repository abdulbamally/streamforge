import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={() => <CustomTabBar />}
    />
  );
}

function CustomTabBar() {
  return (
    <View className="flex-row bg-surface h-20 items-center justify-around">
      <TabItem label="Scenes" />
      <TabItem label="Media" />

      {/* CENTER BUTTON */}
      <TouchableOpacity className="bg-primary w-16 h-16 rounded-full items-center justify-center -mt-8">
        <Text className="text-white font-bold">+</Text>
      </TouchableOpacity>

      <TabItem label="Recordings" />
      <TabItem label="Streams" />
    </View>
  );
}
