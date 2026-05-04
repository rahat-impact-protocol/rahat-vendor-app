import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '@/components/layout/PageHeader';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Colors, Radius } from '@/constants/tokens';
import { useProjectStore } from '@/stores';
import { MOCK_PROJECTS } from '@/mocks';

export default function SelectProjectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeProject, setActiveProject } = useProjectStore();
  const [selectedId, setSelectedId] = React.useState(activeProject?.id ?? 'p-001');

  const handleContinue = () => {
    const project = MOCK_PROJECTS.find(p => p.id === selectedId);
    if (project) setActiveProject(project);
    router.back();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <PageHeader title="Select Project" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Choose the project you are currently operating under.
        </Text>

        <View style={styles.projectList}>
          {MOCK_PROJECTS.map(project => {
            const isSelected = selectedId === project.id;
            return (
              <TouchableOpacity
                key={project.id}
                onPress={() => setSelectedId(project.id)}
                style={[styles.projectCard, isSelected && styles.projectCardSelected]}
                activeOpacity={0.8}
              >
                <View style={styles.projectInfo}>
                  <View style={styles.projectNameRow}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    {project.isActive && (
                      <Text style={styles.activeTag}>Active</Text>
                    )}
                  </View>
                  <Text style={styles.orgName}>{project.orgName}</Text>
                  <Text style={styles.tokens}>
                    <Text style={styles.tokenCount}>{project.tokens.toLocaleString()}</Text> tokens available
                  </Text>
                </View>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Button label="Continue" onPress={handleContinue} />
        <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: 20, paddingBottom: 8 },
  description: {
    fontFamily: 'Manrope', fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 20,
  },
  projectList: { gap: 8 },
  projectCard: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#F3F4F6', padding: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  projectCardSelected: { borderColor: Colors.primary },
  projectInfo: { flex: 1 },
  projectNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  projectName: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 14, color: Colors.textPrimary },
  activeTag: { fontFamily: 'Manrope', fontSize: 10, fontWeight: '700', color: Colors.success },
  orgName: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textMuted, marginBottom: 6 },
  tokens: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textSecondary },
  tokenCount: { fontFamily: 'Manrope', fontWeight: '800', fontSize: 13, color: Colors.primary },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  radioOuterSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  footer: { padding: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 8 },
});
