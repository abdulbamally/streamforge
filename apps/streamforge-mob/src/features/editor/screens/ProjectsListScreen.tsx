import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FolderPlus, ChevronRight } from "lucide-react-native";
import { Card, EmptyState, Screen, Skeleton } from "@shared/components";
import { Button } from "@shared/components/Button";
import { Colors, IconSize, Spacing, Typography } from "@shared/theme/tokens";
import { useProjects } from "../hooks/useProject";
import type { EditorStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<EditorStackParamList, "ProjectsList">;

export function ProjectsListScreen({ navigation }: Props) {
  const { data: projects, isLoading, error, refetch, isFetching } = useProjects();

  return (
    <Screen padded>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Editor</Text>
          <Text style={styles.subtitle}>Projects and exports</Text>
        </View>
        <Button
          label="New"
          size="sm"
          icon={<FolderPlus size={IconSize.sm} color={Colors.textPrimary} />}
          onPress={() => navigation.navigate("ProjectSetup", {})}
        />
      </View>

      {isLoading ? (
        <View style={styles.list}>
          <Skeleton height={88} />
          <Skeleton height={88} />
          <Skeleton height={88} />
        </View>
      ) : error ? (
        <Card>
          <Text style={styles.errorTitle}>Unable to load projects</Text>
          <Text style={styles.errorBody}>Please check your connection and try again.</Text>
          <Button label="Retry" variant="secondary" onPress={() => refetch()} />
        </Card>
      ) : projects?.length ? (
        <View style={styles.list}>
          {projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              onPress={() => navigation.navigate("EditorCanvas", { projectId: project.id })}
              activeOpacity={0.8}
            >
              <Card style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectTitle} numberOfLines={1}>
                    {project.title}
                  </Text>
                  <ChevronRight size={IconSize.sm} color={Colors.textTertiary} />
                </View>
                <Text style={styles.projectMeta}>
                  {project.status} · {project.resolution ?? "No resolution"} · {project.fps ?? "--"}fps
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <EmptyState
          title="No projects yet"
          message="Create your first project to start editing."
          action={{ label: "Create project", onPress: () => navigation.navigate("ProjectSetup", {}) }}
        />
      )}

      <Button label="Refresh" variant="ghost" onPress={() => refetch()} loading={isFetching && !isLoading} />
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
    justifyContent: "space-between",
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
    marginBottom: Spacing.xxs,
  },
  errorBody: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
});
