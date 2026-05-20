import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FolderPlus, ChevronRight, Film } from "lucide-react-native";
import { Card, EmptyState, Screen, Skeleton } from "@shared/components";
import { Button } from "@shared/components/Button";
import { Colors, IconSize, Spacing, Typography } from "@shared/theme/tokens";
import { useProjects } from "../hooks/useProject";
import { listLocalProjects } from "../services/projectPersistence";
import type { EditorStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<EditorStackParamList, "ProjectsList">;

export function ProjectsListScreen({ navigation }: Props) {
  const {
    data: apiProjects,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useProjects();
  const [localProjects, setLocalProjects] = useState(() => listLocalProjects());

  useFocusEffect(
    useCallback(() => {
      setLocalProjects(listLocalProjects());
    }, []),
  );

  const hasLocal = localProjects.length > 0;
  const hasCloud = (apiProjects?.length ?? 0) > 0;
  const showSyncError = !!error && !hasLocal && !hasCloud;
  const showLocalOnlyError = !!error && hasLocal && !hasCloud;

  return (
    <Screen padded>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Editor</Text>
          <Text style={styles.subtitle}>Local & cloud projects</Text>
        </View>
        <Button
          label="New"
          size="sm"
          icon={<FolderPlus size={IconSize.sm} color={Colors.textPrimary} />}
          onPress={() => navigation.navigate("ProjectSetup", {})}
        />
      </View>

      {isLoading && !hasLocal ? (
        <View style={styles.list}>
          <Skeleton height={88} />
          <Skeleton height={88} />
        </View>
      ) : showSyncError ? (
        <Card>
          <Text style={styles.errorTitle}>Cannot sync cloud projects</Text>
          <Text style={styles.errorText}>
            No local projects are available. Create a local project or try again
            once you are online.
          </Text>
          <Button
            label="Create local project"
            variant="secondary"
            onPress={() => navigation.navigate("ProjectSetup", {})}
          />
        </Card>
      ) : hasLocal || hasCloud ? (
        <View style={styles.list}>
          {showLocalOnlyError ? (
            <Card style={styles.cloudErrorCard}>
              <Text style={styles.errorTitle}>Cloud unavailable</Text>
              <Text style={styles.errorText}>
                Local projects are available, but cloud projects could not be
                loaded.
              </Text>
              <Button
                label="Retry"
                variant="secondary"
                onPress={() => refetch()}
              />
            </Card>
          ) : null}

          {localProjects.map((project) => (
            <TouchableOpacity
              key={project.id}
              onPress={() =>
                navigation.navigate("EditorCanvas", { projectId: project.id })
              }
              activeOpacity={0.8}
            >
              <Card style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Film size={IconSize.sm} color={Colors.brand} />
                  <Text style={styles.projectTitle} numberOfLines={1}>
                    {project.title}
                  </Text>
                  <ChevronRight
                    size={IconSize.sm}
                    color={Colors.textTertiary}
                  />
                </View>
                <Text style={styles.projectMeta}>
                  Local · {project.clips.length} clips · {project.fps ?? 30}fps
                </Text>
              </Card>
            </TouchableOpacity>
          ))}

          {apiProjects?.map((project) => (
            <TouchableOpacity
              key={project.id}
              onPress={() =>
                navigation.navigate("EditorCanvas", { projectId: project.id })
              }
              activeOpacity={0.8}
            >
              <Card style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectTitle} numberOfLines={1}>
                    {project.title}
                  </Text>
                  <ChevronRight
                    size={IconSize.sm}
                    color={Colors.textTertiary}
                  />
                </View>
                <Text style={styles.projectMeta}>
                  Cloud · {project.status} · {project.resolution ?? "—"}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <EmptyState
          title="No projects yet"
          message="Create a local project or connect to sync cloud projects."
          action={{
            label: "Create project",
            onPress: () => navigation.navigate("ProjectSetup", {}),
          }}
        />
      )}

      <Button
        label="Refresh"
        variant="ghost"
        onPress={() => refetch()}
        loading={isFetching && !isLoading}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.xxl,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  list: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  projectCard: {
    gap: Spacing.xs,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  projectTitle: {
    flex: 1,
    fontSize: Typography.md,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  projectMeta: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  errorTitle: {
    fontSize: Typography.md,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  cloudErrorCard: {
    padding: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
});
