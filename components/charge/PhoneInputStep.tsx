import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PhoneInput } from '@/components/ui/PhoneInput';
import {
  PRIMARY_BLUE,
  PURPLE,
  PURPLE_LIGHT,
  BORDER_COLOR,
  TEXT_PRIMARY,
  TEXT_MUTED,
  BG_LIGHT,
  ERROR_COLOR,
} from './constants';
import { shared } from './styles';
import { SecureFooter } from './SecureFooter';

type ActiveProject = { name: string } | null | undefined;

type Props = {
  phone: string;
  setPhone: (v: string) => void;
  phoneError: string;
  loading: boolean;
  activeProject: ActiveProject;
  handleFindBeneficiary: () => void;
  validatePhone: (v: string) => boolean;
  onQRPress: () => void;
};

export const PhoneInputStep: React.FC<Props> = ({
  phone,
  setPhone,
  phoneError,
  loading,
  activeProject,
  handleFindBeneficiary,
  validatePhone,
  onQRPress,
}) => (
  <View style={shared.whiteSheet}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={shared.scrollPad}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={shared.stepTitle}>Find Beneficiary</Text>
        <Text style={shared.stepSub}>
          Enter the beneficiary's phone number to look up their details and
          available token balance.
        </Text>

        <Text style={shared.fieldLabel}>PHONE NUMBER</Text>
        <PhoneInput
          value={phone}
          onChange={(v) => {
            setPhone(v);
            if (phoneError) validatePhone(v);
          }}
          error={phoneError}
          placeholder="Enter phone number"
        />
        {phoneError ? (
          <Text style={shared.fieldError}>{phoneError}</Text>
        ) : null}

        {loading ? (
          <ActivityIndicator
            size="small"
            color={PRIMARY_BLUE}
            style={{ marginTop: 8, alignSelf: 'flex-end' }}
          />
        ) : null}

        {activeProject ? (
          <View style={s.projectBadge}>
            <Icon name="briefcase" size={13} color={PRIMARY_BLUE} />
            <Text style={s.projectBadgeText}>{activeProject.name}</Text>
          </View>
        ) : (
          <View style={s.projectBadge}>
            <Icon name="alert-circle" size={13} color={ERROR_COLOR} />
            <Text style={[s.projectBadgeText, { color: ERROR_COLOR }]}>
              No project selected
            </Text>
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          <Button
            label="Search Beneficiary"
            onPress={handleFindBeneficiary}
            loading={loading}
            icon="search"
          />
        </View>

        <View style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>OR</Text>
          <View style={s.dividerLine} />
        </View>

        <View style={{ gap: 12 }}>
          {[
            {
              icon: 'qr',
              label: 'Scan QR Code',
              sub: 'Scan beneficiary ID card',
            },
          ].map(({ icon, label, sub }) => (
            <TouchableOpacity
              key={label}
              style={s.altMethod}
              activeOpacity={0.75}
              onPress={icon === 'qr' ? onQRPress : undefined}
            >
              <View style={s.altIcon}>
                <Icon name={icon} size={20} color={PURPLE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.altLabel}>{label}</Text>
                <Text style={s.altSub}>{sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <SecureFooter />
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
);

const s = StyleSheet.create({
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  projectBadgeText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY_BLUE,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER_COLOR },
  dividerText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '600',
  },
  altMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: BG_LIGHT,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  altIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: PURPLE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  altLabel: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 14,
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  altSub: { fontFamily: 'Manrope', fontSize: 12, color: TEXT_MUTED },
});
