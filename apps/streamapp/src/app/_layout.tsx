import { Stack } from "expo-router";
import "./globals.css";

// export default function RootLayout() {
//   return <Stack />;
// }

import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}
