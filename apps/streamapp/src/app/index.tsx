import { View, Image } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";

export default function Splash() {
  useEffect(() => {
    setTimeout(() => {
      router.replace("/login");
    }, 2000);
  }, []);

  return (
    <View className="flex-1 bg-bg justify-center items-center">
      <Image source={require("../assets/images/logo.png")} />
    </View>
  );
}
