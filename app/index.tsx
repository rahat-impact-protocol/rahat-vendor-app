import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores';

export default function Index() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated
    ? <Redirect href="/(tabs)" />
    : <Redirect href="/(auth)/login" />;
}
