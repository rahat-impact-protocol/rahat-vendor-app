import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '@/stores';
import { authService } from '@/services';



const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 260;
const STATS_CARD_OVERLAP = 40;

// const STATS = [
//   { value: '2.4M+', label: 'TOKENS' },
//   { value: '18.5K', label: 'BENEFICIARIES' },
//   { value: '340',   label: 'VENDORS' },
// ];

const GoogleLogo = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
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

  const handleGoogleLogin = async () => {
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
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero photo block ── */}
        <ImageBackground
          source={require('@/assets/images/rahat-background.png')}
          style={[styles.heroBg, { paddingTop: insets.top }]}
          resizeMode="cover"
        >
          {/* dark scrim */}
          <View style={styles.heroScrim} />

          {/* Title text */}
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Rahat Identity</Text>
            <Text style={styles.heroSub}>Aid that reaches everyone.</Text>
          </View>
        </ImageBackground>

        {/* ── White sheet with rounded top corners ── */}
        <View style={styles.whiteSheet}>

          {/* ── Sign-in section ── */}
          <View style={styles.signInSection}>
            <Text style={styles.signInTitle}>Welcome back</Text>
            <Text style={styles.signInSub}>
              Sign in to your vendor dashboard to manage{'\n'}distributions.
            </Text>

            {/* Google button */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.googleBtn}
            >
              <GoogleLogo />
              <Text style={styles.googleBtnText}>
                {loading ? 'Signing in…' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.terms}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* ── Hero ── */
  heroBg: {
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: '#2C4A6E',
    justifyContent: 'flex-end',
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 22, 40, 0.52)',
  },
  heroContent: {
    paddingHorizontal: 22,
    paddingBottom: 28,         // extra space so text doesn't hide behind white sheet
  },
  heroTitle: {
    fontFamily: 'Manrope',
    fontWeight: '800',
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  heroSub: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 15,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 22,
  },

  /* ── White sheet ── */
  whiteSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,   // ← only these two corners are rounded
    borderTopRightRadius: 30,
    marginTop: -24,            // pull up over the hero image
    paddingTop: 20,
  },

  /* ── Stats card ── */
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: 'Manrope',
    fontWeight: '800',
    fontSize: 20,
    color: '#1F242A',
  },
  statLabel: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 10,
    color: '#6B6969',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  statSep: {
    width: 1,
    height: 36,
    backgroundColor: '#EBEBEB',
  },

  /* ── Sign-in section ── */
  signInSection: {
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  signInTitle: {
    fontFamily: 'Manrope',
    fontWeight: '800',
    fontSize: 26,
    color: '#1F242A',
    marginBottom: 8,
  },
  signInSub: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 14,
    color: '#6B6969',
    lineHeight: 21,
    marginBottom: 28,
  },

  /* ── Google button ── */
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E4E8',
    borderRadius: 10,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.04)',
    elevation: 1,
  },
  googleBtnText: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 15,
    color: '#1F242A',
  },

  /* ── Terms ── */
  terms: {
    textAlign: 'center',
    marginTop: 22,
    fontFamily: 'Manrope',
    fontSize: 12,
    color: '#6B6969',
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '700',
    color: '#303030',
  },
});