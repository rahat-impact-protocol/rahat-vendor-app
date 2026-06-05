import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores';

export default function Index() {
  const accessToken = useAuthStore(s => s.accessToken);
  const vendor = useAuthStore(s => s.vendor);
  const hasHydrated = useAuthStore(s => s._hasHydrated);

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F6FA' }}>
        <ActivityIndicator size="large" color="#1D70B8" />
      </View>
    );
  }

  if (!accessToken) return <Redirect href="/(auth)/login" />;
  if (!vendor?.isApproved) return <Redirect href="/pending-approval" />;
  return <Redirect href="/(tabs)" />;
}
