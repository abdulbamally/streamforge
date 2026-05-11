import React, { useEffect, useMemo, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { Screen } from "@shared/components";
import { Input } from "@shared/components/Input";
import { Button } from "@shared/components/Button";
import { Colors, Spacing, Typography } from "@shared/theme/tokens";
import { useMe, useUpdateProfile } from "../hooks/useProfile";

export function EditProfileScreen() {
  const { data: me } = useMe();
  const updateProfile = useUpdateProfile();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    setDisplayName(me?.displayName ?? "");
    setBio(me?.bio ?? "");
    setAvatarUrl(me?.avatarUrl ?? "");
  }, [me?.avatarUrl, me?.bio, me?.displayName]);

  const cleanName = useMemo(() => displayName.trim(), [displayName]);
  const canSubmit = cleanName.length >= 2 && !updateProfile.isPending;
  const nameError = displayName.length > 0 && cleanName.length < 2 ? "At least 2 characters" : undefined;

  async function handleSave() {
    if (!canSubmit) return;
    await updateProfile.mutateAsync({
      displayName: cleanName,
      bio: bio.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
    });
  }

  return (
    <Screen padded scrollable>
      <Text style={styles.title}>Edit Profile</Text>
      <Text style={styles.subtitle}>Update how your profile appears across StreamForge.</Text>

      <Input
        label="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Creator Name"
        error={nameError}
      />
      <Input
        label="Bio"
        value={bio}
        onChangeText={setBio}
        placeholder="Tell viewers about yourself"
        multiline
        numberOfLines={4}
      />
      <Input
        label="Avatar URL"
        value={avatarUrl}
        onChangeText={setAvatarUrl}
        placeholder="https://..."
      />

      <Button
        label="Save Changes"
        onPress={handleSave}
        loading={updateProfile.isPending}
        disabled={!canSubmit}
        fullWidth
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
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
});
