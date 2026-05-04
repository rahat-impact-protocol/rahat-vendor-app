import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '@/stores';
import { authService } from '@/services';
import { Colors, Typography } from '@/constants/tokens';
import { MOCK_VENDOR } from '@/mocks';

const STATS = [
  { value: '2.4M+', label: 'Tokens' },
  { value: '18.5K', label: 'Beneficiaries' },
  { value: '340',   label: 'Vendors' },
];

// Google logo inline SVG
const GoogleLogo = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </Svg>
);

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const login = useAuthStore(s => s.login);
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const vendor = await authService.loginWithGoogle();
      login(vendor);
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Image
          source={require('@/assets/images/rahat-logo-standard.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Hero copy */}
        <Text style={styles.heroTitle}>Aid that reaches{'\n'}everyone.</Text>
        <Text style={styles.heroSub}>
          Token distribution for humanitarian aid vendors.
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map(({ value, label }) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sign in panel */}
      <View style={[styles.signInPanel, { paddingBottom: Math.max(insets.bottom, 32) }]}>
        <Text style={styles.signInTitle}>Sign in</Text>
        <Text style={styles.signInSub}>Use your Google account to continue</Text>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
          style={styles.googleBtn}
        >
          <GoogleLogo />
          <Text style={styles.googleBtnText}>
            {loading ? 'Signing in…' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing, you agree to Rahat's Terms of Service
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 16,
  },
  logo: {
    width: 140,
    height: 44,
    marginBottom: 48,
  },
  heroTitle: {
    fontFamily: 'Manrope',
    fontWeight: '800',
    fontSize: 30,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 12,
  },
  heroSub: {
    fontFamily: 'Manrope',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    maxWidth: 260,
    marginBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statValue: {
    fontFamily: 'Manrope',
    fontWeight: '800',
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Manrope',
    fontSize: 11,
    color: Colors.textMuted,
  },
  signInPanel: {
    paddingHorizontal: 24,
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  signInTitle: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  signInSub: {
    fontFamily: 'Manrope',
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 24,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 48,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  googleBtnText: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 14,
    color: Colors.textBody,
  },
  terms: {
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Manrope',
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
});
