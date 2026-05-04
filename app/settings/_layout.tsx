import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile" />
      <Stack.Screen name="select-project" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="token-redemption" />
    </Stack>
  );
}
