import { View, Text } from "react-native";
import Button from "@/components/ui/Button";

export default function Login() {
  return (
    <View className="flex-1 bg-bg justify-center px-6">
      <Text className="text-text text-3xl font-bold mb-6">Welcome Back</Text>

      <Button title="Login with Email" />
      <Button title="Continue with Google" />
      <Button title="Continue with Apple" />

      <Text className="text-muted mt-4">Don’t have an account? Register</Text>
    </View>
  );
}
