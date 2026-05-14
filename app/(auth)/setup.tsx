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
import type { ApiProject, GoogleUser } from '@/types';

/**
 * Flow:
 *  1. 'projects'   — fetch project list, user selects one, taps "Get Started"
 *  2. 'checking'   — findVendorByEmail at selected project baseUrl
 *                    → found  → loginVendor → save token → navigate
 *                    → not found → show phone-form
 *  3. 'phone-form' — collect name + phone for new vendors
 *  4. 'submitting' — generate wallet, save to Drive, registerVendor → navigate
 */
type Step = 'projects' | 'checking' | 'phone-form' | 'submitting';

export default function SetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const googleUser = useAuthStore(s => s.googleUser);
  const login = useAuthStore(s => s.login);
  const setActiveProject = useProjectStore(s => s.setActiveProject);

  const [step, setStep] = React.useState<Step>('projects');

  // Project selection
  const [apiProjects, setApiProjects] = React.useState<ApiProject[]>([]);
  const [projectsLoading, setProjectsLoading] = React.useState(false);
  const [projectsError, setProjectsError] = React.useState<string | null>(null);
  const [selectedProject, setSelectedProject] = React.useState<ApiProject | null>(null);
  const [projectSelectError, setProjectSelectError] = React.useState<string | null>(null);

  // Phone-form fields
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [errors, setErrors] = React.useState<{ name?: string; phone?: string }>({});

  // Guard: redirect to login if arrived here without a google user
  React.useEffect(() => {
    if (!googleUser) {
      router.replace('/(auth)/login');
    }
  }, [googleUser]);

  // Fetch project list on mount
  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    let cancelled = false;
    setProjectsLoading(true);
    setProjectsError(null);
    projectService.getProjects()
      .then(list => { if (!cancelled) setApiProjects(list); })
      .catch((err: any) => { if (!cancelled) setProjectsError(err?.message ?? 'Failed to load projects.'); })
      .finally(() => { if (!cancelled) setProjectsLoading(false); });
    return () => { cancelled = true; };
  };

  // ── After project selected → check if vendor exists ──────────────
  const handleGetStarted = async () => {
    if (!selectedProject) {
      setProjectSelectError('Please select a project');
      return;
    }
    if (!googleUser) return;
    setProjectSelectError(null);
    setStep('checking');

    try {
      const existing = await authService.findVendorByEmail(
        selectedProject.baseUrl,
        googleUser.email,
      );

      if (existing) {
        // Vendor exists → login
        const { vendor, token } = await authService.loginVendor(selectedProject.baseUrl, {
          email: googleUser.email,
          phoneNumber: existing.phoneNumber ?? existing.phone ?? '',
          authProvider: 'google',
          providerSubject: googleUser.id,
        });
        commitAndNavigate(vendor, token);
      } else {
        // New vendor → collect phone number
        setName(googleUser.name ?? '');
        setStep('phone-form');
      }
    } catch (err: any) {
      console.error('[Setup] handleGetStarted error:', err);
      setStep('projects');
      Alert.alert('Error', err?.message ?? 'Something went wrong. Please try again.');
    }
  };

  // ── Phone-form validation ─────────────────────────────────────────
  const validatePhone = (): boolean => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!phone.trim()) {
      next.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-]{7,15}$/.test(phone.trim())) {
      next.phone = 'Enter a valid phone number';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Register: generate wallet → save to Drive → POST /vendor ─────
  const handleRegister = async () => {
    if (!validatePhone() || !googleUser || !selectedProject) return;
    setStep('submitting');

    try {
      // Generate wallet and back up to Google Drive
      const walletResult = await checkOrCreateWallet(googleUser.accessToken!);

      // Register vendor on selected project
      const { vendor, token } = await authService.registerVendor(selectedProject.baseUrl, {
        walletAddress: walletResult.address,
        name: name.trim(),
        phoneNumber: phone.trim(),
        email: googleUser.email,
        authProvider: 'google',
        providerSubject: googleUser.id,
      });

      commitAndNavigate(vendor, token);
    } catch (err: any) {
      console.error('[Setup] handleRegister error:', err);
      setStep('phone-form');
      Alert.alert('Registration failed', err?.message ?? 'Something went wrong. Please try again.');
    }
  };

  // ── Persist state and navigate to app ────────────────────────────
  const commitAndNavigate = (vendor: any, token: string) => {
    if (selectedProject) {
      setActiveProject({
        id: selectedProject.id,
        name: selectedProject.name,
        baseUrl: selectedProject.baseUrl,
        orgId: '',
        orgName: '',
        tokens: 0,
        isActive: true,
      });
    }
    login(vendor, token);
    router.replace('/(tabs)');
  };

  if (!googleUser) return null;

  // Loading screens
  if (step === 'checking' || step === 'submitting') {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color="#1D70B8" />
        <Text style={styles.checkingText}>
          {step === 'checking' ? 'Checking your account…' : 'Setting up your wallet…'}
        </Text>
        <Text style={styles.checkingSub}>
          {step === 'checking'
            ? 'Verifying with the selected project'
            : 'Saving wallet backup to Google Drive'}
        </Text>
      </View>
    );
  }

  // ── Phone form (new vendor only) ──────────────────────────────────
  if (step === 'phone-form') {
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
          <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <Text style={styles.headerTitle}>Complete Your Profile</Text>
            <Text style={styles.headerSub}>A few quick details before you get started</Text>
          </View>

          <GoogleAccountCard googleUser={googleUser} />

          <View style={styles.form}>
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
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>Create Account →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => setStep('projects')} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>← Back to projects</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Project selection (default) ───────────────────────────────────
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
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.headerTitle}>Select a Project</Text>
          <Text style={styles.headerSub}>Choose the project you want to work with</Text>
        </View>

        <GoogleAccountCard googleUser={googleUser} />

        <View style={styles.fieldGroup}>
          {projectSelectError ? <Text style={styles.errorText}>{projectSelectError}</Text> : null}

          {projectsLoading ? (
            <ActivityIndicator size="small" color="#1D70B8" style={{ marginTop: 16 }} />
          ) : projectsError ? (
            <View style={styles.centeredCard}>
              <Text style={styles.errorText}>{projectsError}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadProjects}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.projectList}>
              {apiProjects.map(project => {
                const selected = selectedProject?.id === project.id;
                return (
                  <TouchableOpacity
                    key={project.id}
                    style={[styles.projectItem, selected && styles.projectItemSelected]}
                    onPress={() => {
                      setSelectedProject(project);
                      setProjectSelectError(null);
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

        <TouchableOpacity
          style={[styles.submitBtn, { marginTop: 28 }, !selectedProject && styles.submitBtnDisabled]}
          onPress={handleGetStarted}
          disabled={!selectedProject || projectsLoading}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>Get Started →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Shared Google account card ────────────────────────────────────
function GoogleAccountCard({ googleUser }: { googleUser: GoogleUser }) {
  return (
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
  );
}

const styles = StyleSheet.create({
  centeredScreen: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  centeredCard: {
    alignItems: 'center',
    marginTop: 16,
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
  projectList: {
    gap: 8,
    marginTop: 4,
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
  submitBtn: {
    height: 52,
    backgroundColor: '#1D70B8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
  backBtn: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  backBtnText: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 13,
    color: '#1D70B8',
  },
});
