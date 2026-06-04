//rahat-vendor-app/app/settings/select-project.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/tokens';
import { useProjectStore } from '@/stores';
import { projectService } from '@/services';
import { ApiProject } from '@/types';

export default function SelectProjectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeProject, setActiveProject } = useProjectStore();
  const [selectedId, setSelectedId] = React.useState<string | null>(
    activeProject?.id ?? null,
  );

  const [apiProjects, setApiProjects] = React.useState<ApiProject[]>([]);
  const [projectsLoading, setProjectsLoading] = React.useState(false);
  const [projectsError, setProjectsError] = React.useState<string | null>(null);
  const [selectedProject, setSelectedProject] =
    React.useState<ApiProject | null>(null);
  const [projectSelectError, setProjectSelectError] = React.useState<
    string | null
  >(null);

  const loadProjects = () => {
    let cancelled = false;
    setProjectsLoading(true);
    setProjectsError(null);
    projectService
      .getProjects()
      .then((list) => {
        if (!cancelled) setApiProjects(list);
      })
      .catch((err: any) => {
        if (!cancelled)
          setProjectsError(err?.message ?? 'Failed to load projects.');
      })
      .finally(() => {
        if (!cancelled) setProjectsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    return loadProjects();
  }, []);

  const handleContinue = () => {
    const project = apiProjects.find((p) => p.id === selectedId);
    if (project) setActiveProject(project);
    router.back();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <PageHeader title="Select Project" showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Choose the project you are currently operating under.
        </Text>

        <View style={styles.projectList}>
          {projectsLoading && (
            <Text style={styles.statusText}>Loading projects…</Text>
          )}
          {projectsError && (
            <Text style={[styles.statusText, styles.errorText]}>
              {projectsError}
            </Text>
          )}
          {!projectsLoading && !projectsError && apiProjects.length === 0 && (
            <Text style={styles.statusText}>No projects found.</Text>
          )}
          {apiProjects.map((project) => {
            const isSelected = selectedId === project.id;
            return (
              <TouchableOpacity
                key={project.id}
                onPress={() => setSelectedId(project.id)}
                style={[
                  styles.projectCard,
                  isSelected && styles.projectCardSelected,
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.projectInfo}>
                  <View style={styles.projectNameRow}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <Text style={styles.typeTag}>{project.type}</Text>
                  </View>
                  {project.description ? (
                    <Text style={styles.orgName} numberOfLines={1}>
                      {project.description}
                    </Text>
                  ) : null}
                  <Text style={styles.tokens}>{project.location}</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}
      >
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
    fontFamily: 'Manrope',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  projectList: { gap: 8 },
  projectCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectCardSelected: { borderColor: Colors.primary },
  projectInfo: { flex: 1 },
  projectNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  projectName: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  activeTag: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
  },
  orgName: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  tokens: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textSecondary },
  tokenCount: {
    fontFamily: 'Manrope',
    fontWeight: '800',
    fontSize: 13,
    color: Colors.primary,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  statusText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  errorText: { color: '#DC2626' },
  typeTag: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
});
