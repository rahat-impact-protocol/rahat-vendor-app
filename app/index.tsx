import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores';

export default function Index() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const hasHydrated = useAuthStore(s => s._hasHydrated);

  // Wait for AsyncStorage to rehydrate persisted state before redirecting
  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F6FA' }}>
        <ActivityIndicator size="large" color="#1D70B8" />
      </View>
    );
  }

  return isAuthenticated
    ? <Redirect href="/(tabs)" />
    : <Redirect href="/(auth)/login" />;
}
