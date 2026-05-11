import React, { useState } from "react";
import { Text, StyleSheet } from "react-native";
import { Bell, Database, Shield, LogOut, Trash2 } from "lucide-react-native";
import { ConfirmModal, ListItem, ListSection, ListSeparator, Screen } from "@shared/components";
import { Colors, IconSize, Typography } from "@shared/theme/tokens";
import { useDeleteAccount } from "../hooks/useProfile";
import { useAuthStore } from "@core/store/authStore";

export function SettingsScreen() {
  const { logout } = useAuthStore();
  const deleteAccount = useDeleteAccount();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <Screen padded scrollable>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Control notifications, privacy, and account actions.</Text>

      <ListSection title="General">
        <ListItem
          label="Notifications"
          sublabel="Push notifications preferences"
          icon={<Bell size={IconSize.sm} color={Colors.brand} />}
          onPress={() => {}}
        />
        <ListSeparator />
        <ListItem
          label="Storage"
          sublabel="Review local and cloud usage"
          icon={<Database size={IconSize.sm} color={Colors.brand} />}
          onPress={() => {}}
        />
        <ListSeparator />
        <ListItem
          label="Privacy"
          sublabel="Manage account visibility"
          icon={<Shield size={IconSize.sm} color={Colors.brand} />}
          onPress={() => {}}
        />
      </ListSection>

      <ListSection title="Account">
        <ListItem
          label="Log Out"
          icon={<LogOut size={IconSize.sm} color={Colors.warning} />}
          onPress={() => setShowLogoutConfirm(true)}
        />
        <ListSeparator />
        <ListItem
          label="Delete Account"
          sublabel="This action cannot be undone"
          icon={<Trash2 size={IconSize.sm} color={Colors.error} />}
          destructive
          onPress={() => setShowDeleteConfirm(true)}
        />
      </ListSection>

      <ConfirmModal
        visible={showLogoutConfirm}
        title="Log out now?"
        message="You will need to sign in again to continue."
        confirmLabel="Log Out"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={async () => {
          await logout();
          setShowLogoutConfirm(false);
        }}
      />

      <ConfirmModal
        visible={showDeleteConfirm}
        title="Delete account?"
        message="This permanently deletes your account and assets."
        confirmLabel="Delete"
        destructive
        loading={deleteAccount.isPending}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          await deleteAccount.mutateAsync();
          setShowDeleteConfirm(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: Typography.xl,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
});
