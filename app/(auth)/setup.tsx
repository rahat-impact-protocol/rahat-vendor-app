import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore, useProjectStore } from '@/stores';
import { authService, projectService } from '@/services';
import { checkOrCreateWallet } from '@/utils/googleDrive';
import type { ApiProject } from '@/types';

type Step = 'checking' | 'form' | 'submitting';

export default function SetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const googleUser = useAuthStore(s => s.googleUser);
  const wallet = useAuthStore(s => s.wallet);
  const login = useAuthStore(s => s.login);
  const setWallet = useAuthStore(s => s.setWallet);
  const setActiveProject = useProjectStore(s => s.setActiveProject);

  const [step, setStep] = React.useState<Step>('checking');
  const [checkError, setCheckError] = React.useState<string | null>(null);

  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<{ name?: string; phone?: string; project?: string }>({});
  const [apiProjects, setApiProjects] = React.useState<ApiProject[]>([]);
  const [projectsLoading, setProjectsLoading] = React.useState(false);
  const [projectsError, setProjectsError] = React.useState<string | null>(null);

  // Guard: redirect to login if arrived here without a google user
  React.useEffect(() => {
    if (!googleUser) {
      router.replace('/(auth)/login');
    }
  }, [googleUser]);

  // ── Step 1: Drive check on mount ──────────────────────────────────
  React.useEffect(() => {
    if (!googleUser?.accessToken) return;

    let cancelled = false;

    (async () => {
      try {
        const result = await checkOrCreateWallet(googleUser.accessToken!);
        if (cancelled) return;

        setWallet({ address: result.address, mnemonic: result.mnemonic, privateKey: result.privateKey });

        // Always show form so user can select a project
        if (!cancelled) {
          setName(googleUser.name ?? '');
          setStep('form');
        }
      } catch (err: any) {
        if (!cancelled) {
          setCheckError(err?.message ?? 'Failed to check wallet backup. Please try again.');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [googleUser?.accessToken]);

  // ── Fetch projects from core API when form is shown ───────────────
  React.useEffect(() => {
    if (step !== 'form') return;
    let cancelled = false;

    (async () => {
      setProjectsLoading(true);
      setProjectsError(null);
      try {
        const list = await projectService.getProjects();
        if (!cancelled) setApiProjects(list);
      } catch (err: any) {
        if (!cancelled) setProjectsError(err?.message ?? 'Failed to load projects.');
      } finally {
        if (!cancelled) setProjectsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [step]);

  // ── Step 2: Validate form ─────────────────────────────────────────
  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!phone.trim()) {
      next.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-]{7,15}$/.test(phone.trim())) {
      next.phone = 'Enter a valid phone number';
    }
    if (!selectedProjectId) next.project = 'Please select a project';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Step 3: Submit form → check vendor → login or register ─────────
  const handleSubmit = async () => {
    if (!validate() || !googleUser || !wallet) return;
    setStep('submitting');
    try {
      const selectedProject = apiProjects.find(p => p.id === selectedProjectId)!;
      const projectBaseUrl = selectedProject.baseUrl;

      const existing = await authService.findVendorByEmail(projectBaseUrl, googleUser.email);

      let vendor;
      if (existing) {
        // Vendor already registered in this project → login
        vendor = await authService.loginVendor(projectBaseUrl, {
          email: googleUser.email,
          phoneNumber: phone.trim(),
          authProvider: 'google',
          providerSubject: googleUser.id,
        });
      } else {
        // New vendor → register
        vendor = await authService.registerVendor(projectBaseUrl, {
          walletAddress: wallet.address,
          name: name.trim(),
          phoneNumber: phone.trim(),
          email: googleUser.email,
          authProvider: 'google',
          providerSubject: googleUser.id,
        });
      }

      setActiveProject({
        id: selectedProject.id,
        name: selectedProject.name,
        baseUrl: selectedProject.baseUrl,
        orgId: '',
        orgName: '',
        tokens: 0,
        isActive: true,
      });

      login(vendor);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('[Setup] handleSubmit error:', err);
      setStep('form');
      Alert.alert('Sign in failed', err?.message ?? 'Something went wrong. Please try again.');
    }
  };

  if (!googleUser) return null;

  // ── Drive check loading screen ────────────────────────────────────
  if (step === 'checking') {
    return (
      <View style={styles.centeredScreen}>
        {checkError ? (
          <>
            <Text style={styles.errorTitle}>Wallet check failed</Text>
            <Text style={styles.errorMessage}>{checkError}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setCheckError(null);
                setStep('checking');
              }}
            >
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color="#1D70B8" />
            <Text style={styles.checkingText}>Setting up your wallet…</Text>
            <Text style={styles.checkingSub}>Checking Google Drive for existing backup</Text>
          </>
        )}
      </View>
    );
  }

  // ── Registration form ─────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 32) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.headerTitle}>Complete Your Profile</Text>
          <Text style={styles.headerSub}>
            A few quick details before you get started
          </Text>
        </View>

        {/* ── Google account card ── */}
        <View style={styles.accountCard}>
          {googleUser.picture ? (
            <Image source={{ uri: googleUser.picture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {googleUser.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.accountInfo}>
            <Text style={styles.accountName} numberOfLines={1}>{googleUser.name}</Text>
            <Text style={styles.accountEmail} numberOfLines={1}>{googleUser.email}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Google</Text>
          </View>
        </View>

        {/* ── Form ── */}
        <View style={styles.form}>

          {/* Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              value={name}
              onChangeText={v => { setName(v); setErrors(e => ({ ...e, name: undefined })); }}
              placeholder="Your full name"
              placeholderTextColor="#B0B0B0"
              autoCapitalize="words"
              returnKeyType="next"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              value={phone}
              onChangeText={v => { setPhone(v); setErrors(e => ({ ...e, phone: undefined })); }}
              placeholder="+977 98XXXXXXXX"
              placeholderTextColor="#B0B0B0"
              keyboardType="phone-pad"
              returnKeyType="done"
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          {/* Project selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Select Project <Text style={styles.required}>*</Text></Text>
            {errors.project ? <Text style={styles.errorText}>{errors.project}</Text> : null}
            {projectsLoading ? (
              <ActivityIndicator size="small" color="#1D70B8" style={{ marginTop: 8 }} />
            ) : projectsError ? (
              <Text style={styles.errorText}>{projectsError}</Text>
            ) : (
              <View style={styles.projectList}>
                {apiProjects.map(project => {
                  const selected = selectedProjectId === project.id;
                  return (
                    <TouchableOpacity
                      key={project.id}
                      style={[styles.projectItem, selected && styles.projectItemSelected]}
                      onPress={() => {
                        setSelectedProjectId(project.id);
                        setErrors(e => ({ ...e, project: undefined }));
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.projectItemLeft}>
                        <View style={[styles.projectDot, selected && styles.projectDotSelected]} />
                        <View>
                          <Text style={[styles.projectName, selected && styles.projectNameSelected]}>
                            {project.name}
                          </Text>
                          <Text style={styles.projectOrg}>{project.type}</Text>
                        </View>
                      </View>
                      {selected && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

        </View>

        {/* ── Submit button ── */}
        <TouchableOpacity
          style={[styles.submitBtn, step === 'submitting' && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={step === 'submitting'}
          activeOpacity={0.85}
        >
          {step === 'submitting' ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Get Started →</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  /* Loading / checking screen */
  centeredScreen: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  checkingText: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 16,
    color: '#1F242A',
    marginTop: 8,
  },
  checkingSub: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 13,
    color: '#6B6969',
    textAlign: 'center',
  },
  errorTitle: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 18,
    color: '#1F242A',
  },
  errorMessage: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 13,
    color: '#6B6969',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: '#1D70B8',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryBtnText: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 14,
    color: '#FFFFFF',
  },

  screen: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },

  /* Header */
  header: {
    paddingBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Manrope',
    fontWeight: '800',
    fontSize: 26,
    color: '#1F242A',
    marginBottom: 6,
  },
  headerSub: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 14,
    color: '#6B6969',
    lineHeight: 21,
  },

  /* Google account card */
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E8EAF0',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1D70B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 18,
    color: '#FFFFFF',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 14,
    color: '#1F242A',
  },
  accountEmail: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 12,
    color: '#6B6969',
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: '#EAF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  verifiedText: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 11,
    color: '#1D70B8',
  },

  /* Form */
  form: {
    gap: 20,
    marginBottom: 28,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 13,
    color: '#3A3F47',
  },
  required: {
    color: '#E53935',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E4E8',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: 'Manrope',
    fontSize: 14,
    color: '#1F242A',
  },
  inputError: {
    borderColor: '#E53935',
  },
  errorText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: '#E53935',
    marginTop: 2,
  },

  /* Project list */
  projectList: {
    gap: 8,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E4E8',
    padding: 14,
  },
  projectItemSelected: {
    borderColor: '#1D70B8',
    backgroundColor: '#F0F6FF',
  },
  projectItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  projectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D0D5DD',
  },
  projectDotSelected: {
    backgroundColor: '#1D70B8',
  },
  projectName: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 13,
    color: '#1F242A',
  },
  projectNameSelected: {
    color: '#1D70B8',
  },
  projectOrg: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 11,
    color: '#6B6969',
    marginTop: 2,
  },
  checkmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1D70B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Submit */
  submitBtn: {
    height: 52,
    backgroundColor: '#1D70B8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
