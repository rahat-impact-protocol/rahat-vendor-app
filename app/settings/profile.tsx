import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/tokens';
import { useAuthStore } from '@/stores';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const vendor = useAuthStore(s => s.vendor);

  const [editMode, setEditMode] = React.useState(false);
  const [name, setName] = React.useState(vendor?.name ?? 'Aadarsha Lamichhane');
  const [phone, setPhone] = React.useState(vendor?.phone ?? '+977 98XXXXXXXX');
  const [email, setEmail] = React.useState(vendor?.email ?? 'aadarsha@reliefnepal.org');

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <PageHeader
        title="Profile"
        showBack
        right={
          <TouchableOpacity onPress={() => setEditMode(e => !e)} activeOpacity={0.7}>
            <Text style={[styles.editBtn, editMode && styles.editBtnCancel]}>
              {editMode ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarBlock}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{vendor?.initials ?? 'AL'}</Text>
            </View>
            {editMode && (
              <View style={styles.cameraBtn}>
                <Icon name="camera" size={12} color="#fff" />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileRole}>Vendor · Relief Nepal 2025</Text>
        </View>

        {/* Info fields */}
        <View style={styles.card}>
          {[
            { label: 'Full Name', value: name, onChange: setName },
            { label: 'Phone', value: phone, onChange: setPhone },
            { label: 'Email', value: email, onChange: setEmail },
          ].map(({ label, value, onChange }, i, arr) => (
            <View key={label} style={[styles.fieldRow, i < arr.length - 1 && styles.fieldBorder]}>
              <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
              {editMode ? (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  style={styles.fieldInput}
                />
              ) : (
                <Text style={styles.fieldValue}>{value}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Wallet */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.walletLabel}>WALLET ADDRESS</Text>
          <View style={styles.walletRow}>
            <Text style={styles.walletAddr}>{vendor?.walletAddress ?? '0x5e68qwhs73...37455'}</Text>
            <Icon name="copy" size={15} color={Colors.textMuted} />
          </View>
        </View>

        {/* Role / Project */}
        <View style={[styles.card, { marginTop: 12 }]}>
          {[
            { label: 'Role', value: 'Vendor' },
            { label: 'Active Project', value: 'Relief Nepal 2025' },
          ].map(({ label, value }, i, arr) => (
            <View
              key={label}
              style={[
                styles.metaRow,
                i < arr.length - 1 && styles.fieldBorder,
              ]}
            >
              <Text style={styles.metaKey}>{label}</Text>
              <Text style={styles.metaVal}>{value}</Text>
            </View>
          ))}
        </View>

        {editMode && (
          <View style={{ marginTop: 24 }}>
            <Button label="Save Changes" onPress={() => setEditMode(false)} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  editBtn: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 13, color: Colors.primary },
  editBtnCancel: { color: Colors.error },

  avatarBlock: { alignItems: 'center', marginBottom: 24 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: Colors.primarySubtle, alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontFamily: 'Manrope', fontWeight: '800', fontSize: 26, color: Colors.primary },
  cameraBtn: {
    position: 'absolute', bottom: -4, right: -4,
    width: 24, height: 24, borderRadius: 8,
    backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  profileName: { fontFamily: 'Manrope', fontWeight: '800', fontSize: 18, color: Colors.textPrimary, marginBottom: 2 },
  profileRole: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textMuted },

  card: {
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  fieldRow: { paddingHorizontal: 16, paddingVertical: 13 },
  fieldBorder: { borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  fieldLabel: {
    fontFamily: 'Manrope', fontSize: 10, fontWeight: '700', color: Colors.textMuted,
    letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4,
  },
  fieldValue: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  fieldInput: {
    fontFamily: 'Roboto', fontSize: 14, color: Colors.textPrimary,
    backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
  },
  walletLabel: {
    fontFamily: 'Manrope', fontSize: 10, fontWeight: '700', color: Colors.textMuted,
    letterSpacing: 0.6, textTransform: 'uppercase', margin: 16, marginBottom: 4,
  },
  walletRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 14,
  },
  walletAddr: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '500', color: Colors.textBody },
  metaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  metaKey: { fontFamily: 'Manrope', fontSize: 13, color: Colors.textSecondary },
  metaVal: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
});
